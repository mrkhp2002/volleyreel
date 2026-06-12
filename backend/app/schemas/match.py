from pydantic import BaseModel
from typing import Optional

class MatchBase(BaseModel):
    id: str
    tournament: str
    teams: str
    date: Optional[str] = None
    upload: Optional[str] = "Not Uploaded"
    review: Optional[str] = "Not Started"
    video: Optional[str] = "Not Generated"
    venue: Optional[str] = None
    stage: Optional[str] = "Group Stage"
    notes: Optional[str] = None
    duration: Optional[str] = "1h 45m"

class MatchCreate(MatchBase):
    pass

class MatchRead(MatchBase):
    class Config:
        from_attributes = True