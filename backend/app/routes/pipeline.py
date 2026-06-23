# backend/app/routes/pipeline.py
#
# WHY THIS FILE EXISTS:
# This is the API endpoint that triggers the entire AI pipeline.
# When a coach uploads a match video, this endpoint:
# 1. Updates match status to "processing"
# 2. Runs video chunking
# 3. Runs Whisper transcription
# 4. Detects events
# 5. Generates highlight clips
# 6. Updates match with results
# 7. Updates match status to "complete"

import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.match import Match
from app.models.event import Event
from app.models.player import Player
from app.routes.dependencies import get_current_user
from app.services.video_processor import split_video_into_chunks, cleanup_chunks
from app.services.transcription import transcribe_all_chunks, segments_to_full_text
from app.services.event_detector import detect_whistle_timestamps, detect_events_from_transcript
from app.services.highlight_generator import process_match_highlights

router = APIRouter()

# Temporary directory for processing files
TEMP_DIR = "temp_processing"
OUTPUT_DIR = "media/highlights"


def run_pipeline(match_id: int, video_path: str, db: Session):
    """
    Main pipeline function — runs in background.
    
    Why background?
    Processing a 1-hour video takes 10-30 minutes.
    We can't make the user wait — so we run it in the background
    and update the database when done.
    """
    try:
        # Step 1 — Update status to processing
        match = db.query(Match).filter(Match.match_id == match_id).first()
        if not match:
            return

        match.status = "processing"
        db.commit()
        print(f"Match {match_id}: Starting pipeline...")

        # Step 2 — Get players for this match (for attribution)
        players = []
        if match.home_team_id:
            home_players = db.query(Player).filter(
                Player.team_id == match.home_team_id
            ).all()
            players.extend([{
                "player_id": p.player_id,
                "name": p.name,
                "number": p.number
            } for p in home_players])

        if match.away_team_id:
            away_players = db.query(Player).filter(
                Player.team_id == match.away_team_id
            ).all()
            players.extend([{
                "player_id": p.player_id,
                "name": p.name,
                "number": p.number
            } for p in away_players])

        # Step 3 — Split video into chunks
        chunk_dir = os.path.join(TEMP_DIR, f"match_{match_id}")
        print(f"Match {match_id}: Splitting video into chunks...")
        chunks = split_video_into_chunks(video_path, chunk_dir)

        # Step 4 — Transcribe all chunks with Whisper
        print(f"Match {match_id}: Transcribing audio...")
        segments = transcribe_all_chunks(chunks)
        full_transcript = segments_to_full_text(segments)

        # Save transcript to database
        match.transcript = full_transcript
        db.commit()

        # Step 5 — Detect whistle sounds from first chunk audio
        whistle_times = []
        if chunks:
            print(f"Match {match_id}: Detecting whistles...")
            whistle_times = detect_whistle_timestamps(chunks[0]["audio_path"])

        # Step 6 — Detect events from transcript
        print(f"Match {match_id}: Detecting events...")
        detected_events = detect_events_from_transcript(
            segments=segments,
            whistle_times=whistle_times,
            players=players
        )
        print(f"Match {match_id}: Found {len(detected_events)} events")

        # Step 7 — Generate highlight clips
        highlight_dir = os.path.join(OUTPUT_DIR, f"match_{match_id}")
        print(f"Match {match_id}: Generating highlights...")
        highlight_result = process_match_highlights(
            video_path=video_path,
            events=detected_events,
            output_dir=highlight_dir,
            match_id=match_id
        )

        # Step 8 — Save events to database
        for i, event_data in enumerate(detected_events):
            clip_path = highlight_result["clips"].get(i)

            event = Event(
                match_id=match_id,
                player_id=event_data["player_id"],
                event_type=event_data["event_type"],
                timestamp_sec=event_data["timestamp_sec"],
                clip_url=clip_path,
                transcript_snippet=event_data["transcript_snippet"],
                confidence=event_data["confidence"]
            )
            db.add(event)

        # Step 9 — Update match with highlight URL and status
        match.highlight_url = highlight_result["highlight_url"]
        match.status = "complete"
        db.commit()

        print(f"Match {match_id}: Pipeline complete!")

        # Step 10 — Cleanup temporary chunk files
        cleanup_chunks(chunk_dir)

    except Exception as e:
        print(f"Match {match_id}: Pipeline failed — {e}")
        match = db.query(Match).filter(Match.match_id == match_id).first()
        if match:
            match.status = "failed"
            db.commit()


@router.post("/{match_id}/process")
def trigger_pipeline(
    match_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Trigger the AI pipeline for a match.
    
    Why BackgroundTasks?
    Processing takes a long time. BackgroundTasks lets FastAPI
    return a response immediately while processing continues
    in the background.
    """
    match = db.query(Match).filter(Match.match_id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if not match.video_url:
        raise HTTPException(status_code=400, detail="Match has no video uploaded")

    if match.status == "processing":
        raise HTTPException(status_code=400, detail="Match is already being processed")

    # Add pipeline to background tasks
    background_tasks.add_task(
        run_pipeline,
        match_id=match_id,
        video_path=match.video_url,
        db=db
    )

    return {
        "message": f"Pipeline started for match {match_id}",
        "status": "processing"
    }


@router.get("/{match_id}/status")
def get_pipeline_status(
    match_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Check the current processing status of a match.
    
    Frontend polls this endpoint every 30 seconds to check
    if processing is complete.
    """
    match = db.query(Match).filter(Match.match_id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    events_count = db.query(Event).filter(
        Event.match_id == match_id
    ).count()

    return {
        "match_id": match_id,
        "status": match.status,
        "events_detected": events_count,
        "highlight_url": match.highlight_url,
        "has_transcript": match.transcript is not None
    }