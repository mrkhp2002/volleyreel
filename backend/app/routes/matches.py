<<<<<<< HEAD
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
import time
from app.database import get_db
from app.models.match import Match
from app.models.admin import AIJob
from app.schemas.match import MatchRead, MatchCreate
from app.services.video_service import run_async_ai_pipeline

router = APIRouter(prefix="/matches", tags=["Matches Pipeline"])

@router.get("/", response_model=list[MatchRead])
def get_matches(db: Session = Depends(get_db)):
    return db.query(Match).all()

@router.post("/", response_model=MatchRead)
def create_match(payload: MatchCreate, db: Session = Depends(get_db)):
    obj = Match(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.post("/{match_id}/upload")
def upload_video_stream(match_id: str, background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match routing reference mismatch")
        
    job_id = f"JOB-{int(time.time())}"
    job = AIJob(id=job_id, uploaded_by="Coach Admin", filename=file.filename, status="Processing", date="2026-06-10 12:00")
    db.add(job)
    db.commit()
    
    background_tasks.add_task(run_async_ai_pipeline, db, job_id, match_id)
    return {"status": "Processing", "job_id": job_id, "message": "Video ingestion stream added to worker pool"}
=======
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.match import Match
from app.schemas.match import MatchCreate, MatchRead, MatchUpdate
from app.routes.dependencies import get_current_user

router = APIRouter()


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
>>>>>>> dev
