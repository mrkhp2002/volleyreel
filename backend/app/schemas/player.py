from pydantic import BaseModel
from datetime import datetime


class PlayerBase(BaseModel):
    name: str
    number: int | None = None
    team_id: int


class PlayerCreate(PlayerBase):
    # team_id is inherited from PlayerBase and is required (NOT NULL in DB).
    # A player must always be assigned to a team on creation.
    pass


class PlayerUpdate(BaseModel):
    name: str | None = None
    number: int | None = None
    team_id: int | None = None


class PlayerRead(BaseModel):
    player_id: int
    name: str
    number: int | None = None
    team_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
