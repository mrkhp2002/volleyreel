from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.tournament import Tournament
from app.schemas.tournament import TournamentCreate, TournamentRead, TournamentUpdate
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[TournamentRead])
def list_tournaments(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)  # ලොග් වෙලා ඉන්න කෙනාව ගන්නවා
):
    # වෙනස් කළා: .all() වෙනුවට .filter(...) දැම්මා
    return db.query(Tournament).filter(Tournament.user_id == current_user.id).all()


@router.post("/", response_model=TournamentRead, status_code=status.HTTP_201_CREATED)
def create_tournament(
    payload: TournamentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)  # ලොග් වෙලා ඉන්න කෙනාව ගන්නවා
):
    # වෙනස් කළා: user_id=1 වෙනුවට user_id=current_user.id දැම්මා!
    tournament = Tournament(**payload.model_dump(), user_id=current_user.id)

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


from app.models.match import Match
from app.models.team import Team

@router.delete("/{tournament_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tournament(tournament_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
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

