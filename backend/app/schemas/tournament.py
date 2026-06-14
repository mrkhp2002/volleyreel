from pydantic import BaseModel
from datetime import date, datetime


class TournamentBase(BaseModel):
    name: str
    start_date: date | None = None
    end_date: date | None = None


class TournamentCreate(TournamentBase):
    # user_id is intentionally excluded — it is injected from the
    # authenticated user's token inside the route handler, never from
    # the request body.
    pass


class TournamentUpdate(BaseModel):
    name: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class TournamentRead(BaseModel):
    tournament_id: int
    name: str
    start_date: date | None = None
    end_date: date | None = None
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
