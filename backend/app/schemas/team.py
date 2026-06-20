from pydantic import BaseModel
from datetime import datetime


class TeamBase(BaseModel):
    name: str
    tournament_id: int
    coach: str | None = None
    club_name: str | None = None
    logo_url: str | None = None
    division: str | None = None
    category: str | None = None
    description: str | None = None
    city: str | None = None
    home_venue: str | None = None
    founded_year: str | None = None
    roster_limit: int | None = 15
    status: str | None = "Active"
    notes: str | None = None


class TeamCreate(TeamBase):
    # tournament_id is inherited from TeamBase and is required (NOT NULL in DB).
    # It must be supplied by the client since a team always belongs to a tournament.
    pass


class TeamUpdate(BaseModel):
    name: str | None = None
    coach: str | None = None
    club_name: str | None = None
    logo_url: str | None = None
    division: str | None = None
    category: str | None = None
    description: str | None = None
    city: str | None = None
    home_venue: str | None = None
    founded_year: str | None = None
    roster_limit: int | None = None
    status: str | None = None
    notes: str | None = None


class TeamRead(TeamBase):
    team_id: int
    created_at: datetime
    # updated_at: datetime

    model_config = {"from_attributes": True}
