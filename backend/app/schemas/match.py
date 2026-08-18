from pydantic import BaseModel
from datetime import datetime


class MatchBase(BaseModel):
    tournament_id: int
    home_team_id: int
    away_team_id: int
    home_score: int | None = None
    away_score: int | None = None
    video_url: str | None = None
    status: str = "pending"
    match_status: str = "upcoming"  # upcoming | live | completed


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
    match_status: str | None = None  # upcoming | live | completed
    highlight_url: str | None = None
    transcript: str | None = None


class MatchRead(BaseModel):
    match_id: int
    tournament_id: int
    home_team_id: int
    away_team_id: int
    home_score: int | None = None
    away_score: int | None = None
    video_url: str | None = None
    status: str
    match_status: str = "upcoming"
    public_id: str | None = None
    highlight_url: str | None = None
    transcript: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
