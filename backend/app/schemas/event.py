from pydantic import BaseModel
from datetime import datetime


class EventBase(BaseModel):
    match_id: int
    timestamp: float
    event_type: str
    confidence: float = 1.0
    is_verified: bool = False
    verified_by_id: int | None = None
    notes: str | None = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    match_id: int | None = None
    timestamp: float | None = None
    event_type: str | None = None
    confidence: float | None = None
    is_verified: bool | None = None
    verified_by_id: int | None = None
    notes: str | None = None


class EventRead(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
