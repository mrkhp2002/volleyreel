from pydantic import BaseModel
from datetime import datetime


class PlayerBase(BaseModel):
    first_name: str
    last_name: str
    jersey_number: int | None = None
    position: str | None = None
    height: float | None = None
    weight: float | None = None
    team_id: int | None = None


class PlayerCreate(PlayerBase):
    pass


class PlayerUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    jersey_number: int | None = None
    position: str | None = None
    height: float | None = None
    weight: float | None = None
    team_id: int | None = None


class PlayerRead(PlayerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
