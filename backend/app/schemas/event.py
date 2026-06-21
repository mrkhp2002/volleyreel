from pydantic import BaseModel
<<<<<<< HEAD
from typing import Optional

class EventBase(BaseModel):
    id: str
    match_id: str
    time: str
    type: str
    player: Optional[str] = None
    confidence: Optional[str] = "90%"
    status: Optional[str] = "Pending"

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    type: Optional[str] = None
    player: Optional[str] = None
    status: Optional[str] = None

class EventRead(EventBase):
    class Config:
        from_attributes = True
=======
from datetime import datetime


class EventBase(BaseModel):
    match_id: int
    player_id: int | None = None
    event_type: str
    timestamp_sec: float
    clip_url: str | None = None
    transcript_snippet: str | None = None
    confidence: float = 1.0


class EventCreate(EventBase):
    # match_id is inherited from EventBase and is required (NOT NULL in DB).
    # player_id is optional — some events (e.g. timeouts) may not be tied to a player.
    pass


class EventUpdate(BaseModel):
    player_id: int | None = None
    event_type: str | None = None
    timestamp_sec: float | None = None
    clip_url: str | None = None
    transcript_snippet: str | None = None
    confidence: float | None = None


class EventRead(BaseModel):
    event_id: int
    match_id: int
    player_id: int | None = None
    event_type: str
    timestamp_sec: float
    clip_url: str | None = None
    transcript_snippet: str | None = None
    confidence: float
    created_at: datetime

    model_config = {"from_attributes": True}
>>>>>>> dev
