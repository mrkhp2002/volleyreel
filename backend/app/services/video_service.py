import time
from sqlalchemy.orm import Session
from app.models.admin import AIJob
from app.models.match import Match
from app.models.event import Event

def run_async_ai_pipeline(db: Session, job_id: str, match_id: str):
    """Simulates background video processing framework steps"""
    job = db.query(AIJob).filter(AIJob.id == job_id).first()
    match = db.query(Match).filter(Match.id == match_id).first()
    
    if not job or not match:
        return
        
    try:
        match.upload = "Processing"
        match.review = "Processing"
        db.commit()
        
        # Heuristic timing simulator loop
        time.sleep(1) 
        
        # Populate Mock Video Calibration Events inside table records
        mock_events = [
            {"id": f"e_{match_id}_1", "time": "00:01:14", "type": "Serve", "player": "#12 J. Anderson"},
            {"id": f"e_{match_id}_2", "time": "00:01:23", "type": "Spike", "player": "#09 M. Chen"},
            {"id": f"e_{match_id}_3", "time": "00:02:47", "type": "Block", "player": "#07 S. Kim"}
        ]
        
        for me in mock_events:
            event = Event(match_id=match_id, **me)
            db.add(event)
            
        job.status = "Completed"
        match.upload = "Completed"
        match.review = "In Review"
        db.commit()
    except Exception as e:
        job.status = "Failed"
        job.error = str(e)
        match.upload = "Failed"
        db.commit()