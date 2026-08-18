from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.tournament import Tournament
from app.models.match import Match
from app.models.team import Team
from app.schemas.tournament import TournamentCreate, TournamentRead, TournamentUpdate
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[TournamentRead])
def list_tournaments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_role = getattr(current_user, "role", "coach").lower()
    # Players, admins, and viewers can view all tournaments across the platform
    if user_role in ["player", "admin", "viewer", "public_user"]:
        return db.query(Tournament).all()
    return db.query(Tournament).filter(Tournament.user_id == current_user.id).all()


@router.post("/", response_model=TournamentRead, status_code=status.HTTP_201_CREATED)
def create_tournament(
    payload: TournamentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_role = getattr(current_user, "role", "coach").lower()
    if user_role == "player":
        raise HTTPException(status_code=403, detail="Players cannot create tournaments. Only coaches and admins can create tournaments.")

    tournament = Tournament(**payload.model_dump(), user_id=current_user.id)
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    return tournament


@router.get("/{tournament_id}", response_model=TournamentRead)
def get_tournament(tournament_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_role = getattr(current_user, "role", "coach").lower()
    if user_role in ["player", "admin", "viewer", "public_user"]:
        tournament = db.query(Tournament).filter(Tournament.tournament_id == tournament_id).first()
    else:
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
    user_role = getattr(current_user, "role", "coach").lower()
    if user_role == "player":
        raise HTTPException(status_code=403, detail="Players cannot modify tournaments.")

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
    user_role = getattr(current_user, "role", "coach").lower()
    if user_role == "player":
        raise HTTPException(status_code=403, detail="Players cannot delete tournaments.")

    tournament = db.query(Tournament).filter(
        Tournament.tournament_id == tournament_id,
        Tournament.user_id == current_user.id
    ).first()

    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")

    # Explicitly delete all matches in this tournament
    db.query(Match).filter(Match.tournament_id == tournament_id).delete(synchronize_session=False)

    # Explicitly delete all teams in this tournament
    db.query(Team).filter(Team.tournament_id == tournament_id).delete(synchronize_session=False)

    # Delete the tournament object
    db.delete(tournament)
    db.commit()


@router.post("/{tournament_id}/views", response_model=TournamentRead)
def increment_tournament_views(tournament_id: int, db: Session = Depends(get_db)):
    # Anyone can increment views, no auth required
    tournament = db.query(Tournament).filter(Tournament.tournament_id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    tournament.views += 1
    db.commit()
    db.refresh(tournament)
    return tournament


@router.post("/{tournament_id}/shares", response_model=TournamentRead)
def increment_tournament_shares(tournament_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Usually logged-in users share it
    tournament = db.query(Tournament).filter(Tournament.tournament_id == tournament_id).first()
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    tournament.shares += 1
    db.commit()
    db.refresh(tournament)
    return tournament
