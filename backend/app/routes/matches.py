import os
import shutil

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.match import Match
from app.schemas.match import MatchCreate, MatchRead, MatchUpdate
from app.routes.dependencies import get_current_user

router = APIRouter()

# Directory where uploaded match videos are stored.
# Relative to wherever `uvicorn` / `run.py` is launched from (backend/).
VIDEO_UPLOAD_DIR = "media/videos"


# ── Existing CRUD endpoints ────────────────────────────────────────────────────

@router.get("/", response_model=list[MatchRead])
def list_matches(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Match).all()


@router.post("/", response_model=MatchRead, status_code=status.HTTP_201_CREATED)
def create_match(payload: MatchCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Explicit field assignment avoids passing unknown schema fields to the ORM.
    match = Match(
        home_team_id=payload.home_team_id,
        away_team_id=payload.away_team_id,
        tournament_id=payload.tournament_id,
        video_url=payload.video_url,
        status=payload.status,
        match_status=payload.match_status,
        home_score=payload.home_score,
        away_score=payload.away_score,
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


@router.get("/{match_id}", response_model=MatchRead)
def get_match(match_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    match = db.query(Match).filter(Match.match_id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match


@router.put("/{match_id}", response_model=MatchRead)
def update_match(
    match_id: int,
    payload: MatchUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    match = db.query(Match).filter(Match.match_id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(match, field, value)

    db.commit()
    db.refresh(match)
    return match


@router.delete("/{match_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_match(match_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    match = db.query(Match).filter(Match.match_id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    db.delete(match)
    db.commit()


# ── New: Video upload endpoint ─────────────────────────────────────────────────

@router.post("/{match_id}/upload", response_model=MatchRead)
def upload_match_video(
    match_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Upload a video file for a specific match.

    WHY THIS ENDPOINT EXISTS:
    The frontend previously used PUT /matches/{id} to set a bare video_url string
    (a local path the server already knew about). This endpoint accepts the actual
    binary video file via multipart/form-data, persists it to disk, and then
    updates the database — so coaches can upload directly from the browser.

    Flow:
    1. Validate match exists.
    2. Validate the uploaded file is a recognised video MIME type.
    3. Create media/videos/ directory if absent.
    4. Save the file as  media/videos/match_{match_id}.mp4
       (always MP4 on disk regardless of original extension — FFmpeg is happy
        with the container format once the pipeline runs).
    5. Update match.video_url  → the saved file path.
    6. Reset match.status      → "pending"  (ready for pipeline processing).
    7. Return the updated match object.
    """
    # Step 1 — Verify the match exists.
    match = db.query(Match).filter(Match.match_id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    # Step 2 — Validate MIME type.
    # UploadFile.content_type is set from the browser's Content-Type header.
    ALLOWED_MIME_TYPES = {
        "video/mp4",
        "video/quicktime",      # .mov
        "video/x-msvideo",      # .avi
        "video/x-matroska",     # .mkv
        "video/webm",
        "application/octet-stream",  # generic fallback some clients send
    }
    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. "
                   f"Accepted: MP4, MOV, AVI, MKV, WebM."
        )

    # Step 3 — Ensure the upload directory exists.
    os.makedirs(VIDEO_UPLOAD_DIR, exist_ok=True)

    # Step 4 — Write the file to disk.
    # Named deterministically so re-uploads simply overwrite the old file.
    save_path = os.path.join(VIDEO_UPLOAD_DIR, f"match_{match_id}.mp4")

    try:
        with open(save_path, "wb") as dest:
            shutil.copyfileobj(file.file, dest)
    except OSError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to write video file to disk: {exc}"
        )
    finally:
        # Always close the upload stream to free memory.
        file.file.close()

    # Step 5 & 6 — Persist path + reset status.
    match.video_url = save_path
    match.status = "pending"

    db.commit()
    db.refresh(match)

    return match
