from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.match import Match
from app.schemas.match import MatchCreate, MatchRead
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[MatchRead])
def list_matches(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Match).all()


@router.post("/", response_model=MatchRead, status_code=status.HTTP_201_CREATED)
def create_match(payload: MatchCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    match = Match(**payload.model_dump())
    db.add(match)
    db.commit()
    db.refresh(match)
    return match


@router.get("/{match_id}", response_model=MatchRead)
def get_match(match_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    return match
