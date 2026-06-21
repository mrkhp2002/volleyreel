from pydantic import BaseModel
<<<<<<< HEAD
from typing import Optional
from datetime import datetime

class TournamentBase(BaseModel):
    name: str
    division: Optional[str] = "Premier Division"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class TournamentCreate(TournamentBase):
    user_id: int

class TournamentRead(TournamentBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True
=======
from datetime import date, datetime


class TournamentBase(BaseModel):
    name: str
    description: str | None = None
    location: str | None = None
    start_date: date | None = None
    end_date: date | None = None

    type: str | None = None
    category: str | None = None
    registration_deadline: date | None = None
    city: str | None = None
    organizer_name: str | None = None
    team_limit: int | None = 16
    groups_count: int | None = 4
    match_format: str | None = None
    set_rules: str | None = None
    status: str | None = "Upcoming"
    banner_url: str | None = None
    notes: str | None = None
    public_visibility: bool | None = True
    allow_report_sharing: bool | None = True
    enable_leaderboard: bool | None = True


class TournamentCreate(TournamentBase):
    # user_id is intentionally excluded — it is injected from the
    # authenticated user's token inside the route handler, never from
    # the request body.
    pass


class TournamentUpdate(BaseModel):
    # tournament_id: int
    tournament_id: int | None = None
    name: str | None = None
    description: str | None = None
    location: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    type: str | None = None
    category: str | None = None
    registration_deadline: date | None = None
    city: str | None = None
    organizer_name: str | None = None
    team_limit: int | None = None
    groups_count: int | None = None
    match_format: str | None = None
    set_rules: str | None = None
    status: str | None = None
    banner_url: str | None = None
    notes: str | None = None
    public_visibility: bool | None = None
    allow_report_sharing: bool | None = None
    enable_leaderboard: bool | None = None


class TournamentRead(TournamentBase):
    tournament_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
>>>>>>> dev
