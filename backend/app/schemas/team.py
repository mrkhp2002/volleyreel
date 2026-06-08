from pydantic import BaseModel
from datetime import datetime


class TeamBase(BaseModel):
    name: str
    tournament_id: int


class TeamCreate(TeamBase):
    # tournament_id is inherited from TeamBase and is required (NOT NULL in DB).
    # It must be supplied by the client since a team always belongs to a tournament.
    pass


class TeamUpdate(BaseModel):
    name: str | None = None


class TeamRead(BaseModel):
    team_id: int
    name: str
    tournament_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
