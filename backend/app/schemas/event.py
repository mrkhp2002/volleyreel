from pydantic import BaseModel
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