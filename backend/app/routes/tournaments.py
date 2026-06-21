<<<<<<< HEAD
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
=======
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.tournament import Tournament
from app.schemas.tournament import TournamentCreate, TournamentRead, TournamentUpdate
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[TournamentRead])
def list_tournaments(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Scoped to the authenticated user — each user only sees their own tournaments.
    return db.query(Tournament).filter(Tournament.user_id == current_user.id).all()


@router.post("/", response_model=TournamentRead, status_code=status.HTTP_201_CREATED)
def create_tournament(payload: TournamentCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):

    tournament_data = payload.model_dump()

    tournament = Tournament(
        **tournament_data,
        user_id=current_user.id,
    )
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    return tournament


@router.get("/{tournament_id}", response_model=TournamentRead)
def get_tournament(tournament_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tournament = db.query(Tournament).filter(
        Tournament.tournament_id == tournament_id,
        Tournament.user_id == current_user.id
    ).first()

    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament


@router.put("/{tournament_id}", response_model=TournamentRead)
def update_tournament(
    tournament_id: int,
    payload: TournamentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    tournament = db.query(Tournament).filter(
        Tournament.tournament_id == tournament_id,
        Tournament.user_id == current_user.id
    ).first()

    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tournament, field, value)

    db.commit()
    db.refresh(tournament)
    return tournament


@router.delete("/{tournament_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tournament(tournament_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    tournament = db.query(Tournament).filter(
        Tournament.tournament_id == tournament_id,
        Tournament.user_id == current_user.id
    ).first()

    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    db.delete(tournament)
    db.commit()
>>>>>>> dev
