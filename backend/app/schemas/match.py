from pydantic import BaseModel
<<<<<<< HEAD
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
=======
from datetime import datetime


class MatchBase(BaseModel):
    tournament_id: int
    home_team_id: int
    away_team_id: int
    home_score: int = 0
    away_score: int = 0
    video_url: str | None = None
    status: str = "pending"


class MatchCreate(MatchBase):
    # tournament_id is inherited from MatchBase and is required (NOT NULL in DB).
    pass


class MatchUpdate(BaseModel):
    home_team_id: int | None = None
    away_team_id: int | None = None
    home_score: int | None = None
    away_score: int | None = None
    video_url: str | None = None
    status: str | None = None
    highlight_url: str | None = None
    transcript: str | None = None


class MatchRead(BaseModel):
    match_id: int
    tournament_id: int
    home_team_id: int
    away_team_id: int
    home_score: int
    away_score: int
    video_url: str | None = None
    status: str
    public_id: str | None = None
    highlight_url: str | None = None
    transcript: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
>>>>>>> dev
