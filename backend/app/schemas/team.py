from pydantic import BaseModel
from typing import Optional

class TeamBase(BaseModel):
    id: str
    name: str
    coach: Optional[str] = None
    club_name: Optional[str] = None
    division: Optional[str] = "Premier"
    category: Optional[str] = "Men's Senior"
    city: Optional[str] = None
    home_venue: Optional[str] = None
    founded_year: Optional[int] = None
    roster_limit: Optional[int] = 15
    status: Optional[str] = "Active"
    notes: Optional[str] = None

class TeamCreate(TeamBase):
    pass

class TeamRead(TeamBase):
    class Config:
        from_attributes = True