from sqlalchemy.orm import Session

from app.models.user import User
from app.models.player import Player
from app.models.team import Team
from app.schemas.user import UserCreate, UserLogin
from app.utils.security import get_password_hash, verify_password


def create_user(db: Session, payload: UserCreate) -> User | None:
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        return None

    assigned_role = (payload.role or "coach").lower().strip()
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        role=assigned_role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # If the user is registering as a player with an associated team, create the Player record
    if assigned_role == "player" and payload.team_id:
        player_entry = Player(
            name=payload.full_name or "Player",
            team_id=payload.team_id,
            email=payload.email,
            user_id=user.id,
            position=payload.position or "Outside Hitter",
            jersey_number=payload.jersey_number or 1,
            status="Active"
        )
        db.add(player_entry)
        db.commit()

    return user


def authenticate_user(db: Session, payload: UserLogin) -> User | None:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        return None
    if not verify_password(payload.password, user.hashed_password):
        return None
    return user


