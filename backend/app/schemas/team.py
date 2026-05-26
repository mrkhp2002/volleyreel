from pydantic import BaseModel
from datetime import datetime


class TeamBase(BaseModel):
    name: str
    coach: str | None = None
    club_name: str | None = None
    logo_url: str | None = None


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: str | None = None
    coach: str | None = None
    club_name: str | None = None
    logo_url: str | None = None


class TeamRead(TeamBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
