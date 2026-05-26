from pydantic import BaseModel
from datetime import datetime


class MatchBase(BaseModel):
    tournament_id: int | None = None
    home_team_id: int
    away_team_id: int
    match_date: datetime | None = None
    video_url: str | None = None
    audio_url: str | None = None
    status: str = "scheduled"
    home_score: int = 0
    away_score: int = 0


class MatchCreate(MatchBase):
    pass


class MatchUpdate(BaseModel):
    tournament_id: int | None = None
    home_team_id: int | None = None
    away_team_id: int | None = None
    match_date: datetime | None = None
    video_url: str | None = None
    audio_url: str | None = None
    status: str | None = None
    home_score: int | None = None
    away_score: int | None = None


class MatchRead(MatchBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
