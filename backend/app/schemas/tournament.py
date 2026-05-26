from pydantic import BaseModel
from datetime import date, datetime


class TournamentBase(BaseModel):
    name: str
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    location: str | None = None


class TournamentCreate(TournamentBase):
    pass


class TournamentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    location: str | None = None


class TournamentRead(TournamentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
