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
from typing import List

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.match import Match
from app.models.event import Event
from app.models.player import Player
from app.routes.dependencies import get_current_user
from app.services.video_processor import split_video_into_chunks, cleanup_chunks
from app.services.transcription import transcribe_all_chunks, segments_to_full_text
from app.services.event_detector import detect_whistle_timestamps, detect_events_from_transcript
from app.services.highlight_generator import (
    generate_event_clip,
    generate_highlight_reel,
    process_match_highlights,
)

router = APIRouter()

# Temporary directory for processing files
TEMP_DIR = "temp_processing"
OUTPUT_DIR = "media/highlights"


# ── Full AI pipeline (background) ────────────────────────────────────────────

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


# ── Trigger full pipeline ─────────────────────────────────────────────────────

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


# ── Poll pipeline status ──────────────────────────────────────────────────────

@router.get("/{match_id}/status")
def get_pipeline_status(
    match_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    Check the current processing status of a match.

    Frontend polls this endpoint every 10 seconds to check
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


# ── New: Generate highlight reel from selected events ─────────────────────────

class GenerateHighlightRequest(BaseModel):
    event_ids: List[int]


@router.post("/{match_id}/generate-highlight")
def generate_highlight_from_events(
    match_id: int,
    payload: GenerateHighlightRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Generate (or regenerate) a highlight reel from a hand-picked list of events.

    WHY THIS ENDPOINT EXISTS:
    The full pipeline auto-selects ALL detected events for the reel.
    Coaches often want a curated highlight — only the best 5-10 plays.
    This endpoint lets the frontend pass an explicit list of event_ids
    and produces a new highlight MP4 from just those clips.

    Request body:
        { "event_ids": [1, 2, 3, 5] }

    Flow:
    1. Validate match exists and has a source video.
    2. Load the requested events from the database (scoped to this match).
    3. Verify every event already has a pre-generated clip (clip_url).
       If a clip is missing, generate it on the fly from the source video.
    4. Concatenate clips in timestamp order → highlight reel MP4.
    5. Persist the new highlight_url on the match row.
    6. Return {"highlight_url": "..."}.

    Returns:
        {"highlight_url": "media/highlights/match_N/match_N_custom_highlight.mp4"}
    """
    # Step 1 — Validate match & video.
    match = db.query(Match).filter(Match.match_id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if not match.video_url:
        raise HTTPException(
            status_code=400,
            detail="Match has no source video. Upload a video first."
        )

    if not payload.event_ids:
        raise HTTPException(
            status_code=400,
            detail="event_ids list cannot be empty."
        )

    # Step 2 — Load the requested events, scoped to this match.
    events = (
        db.query(Event)
        .filter(
            Event.match_id == match_id,
            Event.event_id.in_(payload.event_ids),
        )
        .order_by(Event.timestamp_sec)   # chronological order in the reel
        .all()
    )

    if not events:
        raise HTTPException(
            status_code=404,
            detail="None of the provided event_ids were found for this match."
        )

    # Warn (but don't fail) if some requested IDs were missing.
    found_ids = {ev.event_id for ev in events}
    missing_ids = set(payload.event_ids) - found_ids
    if missing_ids:
        print(
            f"Match {match_id} generate-highlight: "
            f"event_ids {sorted(missing_ids)} not found — skipping."
        )

    # Step 3 — Ensure each selected event has a clip on disk.
    output_dir = os.path.join(OUTPUT_DIR, f"match_{match_id}")
    os.makedirs(output_dir, exist_ok=True)

    clip_paths: list[str] = []

    for event in events:
        # Use the existing clip if the file is already present.
        if event.clip_url and os.path.isfile(event.clip_url):
            clip_paths.append(event.clip_url)
            continue

        # Otherwise generate the clip on the fly.
        clip_filename = (
            f"match_{match_id}_event_{event.event_id}_{event.event_type}.mp4"
        )
        clip_path = os.path.join(output_dir, clip_filename)

        print(
            f"Match {match_id}: Generating missing clip for event "
            f"{event.event_id} ({event.event_type}) at {event.timestamp_sec:.1f}s..."
        )

        success = generate_event_clip(
            video_path=match.video_url,
            timestamp_sec=event.timestamp_sec,
            output_path=clip_path,
        )

        if success:
            # Persist the newly generated clip path so future calls can reuse it.
            event.clip_url = clip_path
            clip_paths.append(clip_path)
        else:
            print(
                f"Match {match_id}: Warning — could not generate clip for "
                f"event {event.event_id}. Skipping."
            )

    db.commit()  # flush any clip_url updates

    if not clip_paths:
        raise HTTPException(
            status_code=500,
            detail=(
                "No clips could be generated for the selected events. "
                "Check that the source video file is accessible."
            )
        )

    # Step 4 — Concatenate clips into the custom highlight reel.
    highlight_filename = f"match_{match_id}_custom_highlight.mp4"
    highlight_path = os.path.join(output_dir, highlight_filename)

    print(f"Match {match_id}: Concatenating {len(clip_paths)} clips → {highlight_path}")

    success = generate_highlight_reel(clip_paths, highlight_path)

    if not success:
        raise HTTPException(
            status_code=500,
            detail="FFmpeg failed to concatenate clips into a highlight reel."
        )

    # Step 5 — Persist the new highlight URL on the match.
    match.highlight_url = highlight_path
    db.commit()
    db.refresh(match)

    # Step 6 — Return the result.
    return {
        "highlight_url": highlight_path,
        "clips_used": len(clip_paths),
        "events_requested": len(payload.event_ids),
        "events_included": len(events),
    }