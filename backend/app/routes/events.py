<<<<<<< HEAD
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
=======
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.event import Event
from app.schemas.event import EventCreate, EventRead, EventUpdate
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[EventRead])
def list_events(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return db.query(Event).all()


@router.post("/", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    event = Event(
        match_id=payload.match_id,
        player_id=payload.player_id,
        event_type=payload.event_type,
        timestamp_sec=payload.timestamp_sec,
        clip_url=payload.clip_url,
        transcript_snippet=payload.transcript_snippet,
        confidence=payload.confidence,
    )
    db.add(event)
>>>>>>> dev
    db.commit()
    db.refresh(event)
    return event

<<<<<<< HEAD
@router.post("/match/{match_id}/compile")
def compile_highlights(match_id: str, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match structure missing")
    match.video = "Ready"
    db.commit()
    return {"status": "success", "message": "Highlight file compilation completed successfully"}
=======

@router.get("/{event_id}", response_model=EventRead)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=EventRead)
def update_event(
    event_id: int,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db.delete(event)
    db.commit()
>>>>>>> dev
