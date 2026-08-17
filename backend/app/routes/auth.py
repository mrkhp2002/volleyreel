from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserLogin, Token
from app.services.auth_service import create_user, authenticate_user
from app.utils.security import create_access_token
from app.routes.dependencies import get_current_user

from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    user = create_user(db=db, payload=payload)
    if user is None:
        raise HTTPException(status_code=400, detail="User already exists")
    return user


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> Token:
    user = authenticate_user(db=db, payload=payload)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(data={"sub": user.email})
    return Token(
        access_token=access_token,
        token_type="bearer",
        email=user.email,
        full_name=user.full_name,
        role=user.role,
    )


@router.get("/users", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(User).all()


@router.post("/swagger-login", response_model=Token, include_in_schema=False)
def swagger_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    login_payload = UserLogin(email=form_data.username,
                              password=form_data.password)
    user = authenticate_user(db=db, payload=login_payload)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(data={"sub": user.email})
    return Token(
        access_token=access_token,
        token_type="bearer",
        email=user.email,
        full_name=user.full_name,
        role=user.role,
    )


