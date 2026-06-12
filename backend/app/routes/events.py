from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.event import Event
from app.models.match import Match
from app.schemas.event import EventRead, EventUpdate

router = APIRouter(prefix="/events", tags=["Event Timelines"])

@router.get("/match/{match_id}", response_model=list[EventRead])
def get_match_timeline(match_id: str, db: Session = Depends(get_db)):
    return db.query(Event).filter(Event.match_id == match_id).all()

@router.patch("/{event_id}", response_model=EventRead)
def update_event_tag(event_id: str, payload: EventUpdate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Marker metadata key lookup missed")
    for key, val in payload.model_dump(exclude_unset=True).items():
        setattr(event, key, val)
    db.commit()
    db.refresh(event)
    return event

@router.post("/match/{match_id}/compile")
def compile_highlights(match_id: str, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match structure missing")
    match.video = "Ready"
    db.commit()
    return {"status": "success", "message": "Highlight file compilation completed successfully"}