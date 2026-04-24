from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.utils.security import get_password_hash


def create_user(db: Session, payload: UserCreate) -> User | None:
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        return None

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
