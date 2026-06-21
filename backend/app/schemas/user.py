from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    email: EmailStr
    full_name: str | None = None


class UserRead(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

