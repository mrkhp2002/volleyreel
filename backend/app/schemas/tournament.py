from pydantic import BaseModel
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