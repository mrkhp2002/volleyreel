from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.tournament import Tournament
from app.schemas.tournament import TournamentRead, TournamentCreate

router = APIRouter(prefix="/tournaments", tags=["Tournaments"])

@router.get("/", response_model=list[TournamentRead])
def get_tournaments(db: Session = Depends(get_db)):
    return db.query(Tournament).all()

@router.post("/", response_model=TournamentRead)
def create_tournament(payload: TournamentCreate, db: Session = Depends(get_db)):
    obj = Tournament(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj