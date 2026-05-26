from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.event import Event
from app.schemas.event import EventCreate, EventRead
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[EventRead])
def list_events(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Event).all()


@router.post("/", response_model=EventRead, status_code=status.HTTP_201_CREATED)
def create_event(payload: EventCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    event = Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/{event_id}", response_model=EventRead)
def get_event(event_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
