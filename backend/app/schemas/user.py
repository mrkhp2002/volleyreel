from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    role: str | None = "coach"
    team_id: int | None = None
    position: str | None = None
    jersey_number: int | None = None


class UserCreate(UserBase):
    password: str
    role: str | None = "coach"
    team_id: int | None = None
    position: str | None = None
    jersey_number: int | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    email: EmailStr
    full_name: str | None = None
    role: str | None = "coach"
    team_id: int | None = None
    team_name: str | None = None


class UserRead(UserBase):
    id: int
    is_active: bool
    role: str | None = "coach"
    team_id: int | None = None

    class Config:
        from_attributes = True


