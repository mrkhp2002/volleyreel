from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.admin import AIJob, FlaggedItem, SystemSettings
from app.schemas.admin import AIJobSchema, FlaggedItemSchema, SystemSettingsSchema
from app.services.backup_service import create_sqlite_backup

router = APIRouter(prefix="/admin", tags=["Admin Core Telemetry"])

@router.get("/jobs", response_model=list[AIJobSchema])
def get_jobs(db: Session = Depends(get_db)):
    return db.query(AIJob).all()

@router.post("/jobs/{job_id}/restart")
def restart_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(AIJob).filter(AIJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job worker thread entry lost")
    job.status = "Pending"
    job.error = ""
    db.commit()
    return {"status": "Pending"}

@router.get("/moderation", response_model=list[FlaggedItemSchema])
def get_flagged_content(db: Session = Depends(get_db)):
    return db.query(FlaggedItem).all()

@router.post("/backup")
def trigger_backup():
    return create_sqlite_backup()