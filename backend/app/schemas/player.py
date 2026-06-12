from pydantic import BaseModel
from typing import Optional

class PlayerBase(BaseModel):
    id: str
    name: str
    team_name: str
    position: str
    jersey_number: Optional[str] = None
    contact_number: Optional[str] = None
    status: Optional[str] = "Active"
    email: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = "Male"
    height: Optional[float] = None
    weight: Optional[float] = None
    address: Optional[str] = None
    photo_url: Optional[str] = None

class PlayerCreate(PlayerBase):
    pass

class PlayerRead(PlayerBase):
    class Config:
        from_attributes = True