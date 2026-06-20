from pydantic import BaseModel, field_validator
from datetime import datetime


class PlayerBase(BaseModel):
    name: str

    jersey_number: int | None = None
    position: str | None = None
    height: float | None = None
    weight: float | None = None
    team_id: int | None = None

    date_of_birth: str | None = None
    gender: str | None = None
    contact_number: str | None = None
    email: str | None = None
    address: str | None = None
    status: str | None = "Active"
    photo_url: str | None = None

    @field_validator('name')
    @classmethod
    def check_name_not_empty(cls, v: str):
        if not v or not v.strip():
            raise ValueError("Player name cannot be empty or just whitespace")
        return v


class PlayerCreate(PlayerBase):
    team_id: int
    pass


class PlayerUpdate(BaseModel):
    name: str | None = None
    jersey_number: int | None = None
    position: str | None = None
    height: float | None = None
    weight: float | None = None
    team_id: int | None = None

    # මෙන්න මේ අලුත් Fields ටික අනිවාර්යයෙන්ම PlayerUpdate එකටත් දාන්න ඕනේ!
    date_of_birth: str | None = None
    gender: str | None = None
    contact_number: str | None = None
    email: str | None = None
    address: str | None = None
    status: str | None = None
    photo_url: str | None = None


class PlayerRead(PlayerBase):
    player_id: int
    created_at: datetime
    # updated_at: datetime

    model_config = {"from_attributes": True}
