from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.tournament import Tournament
from app.schemas.tournament import TournamentCreate, TournamentRead, TournamentUpdate
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[TournamentRead])
def list_tournaments(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Tournament).all()


@router.post("/", response_model=TournamentRead, status_code=status.HTTP_201_CREATED)
def create_tournament(payload: TournamentCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tournament = Tournament(**payload.model_dump())
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    return tournament


@router.get("/{tournament_id}", response_model=TournamentRead)
def get_tournament(tournament_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament
