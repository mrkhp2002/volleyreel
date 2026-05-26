from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.player import Player
from app.schemas.player import PlayerCreate, PlayerRead
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[PlayerRead])
def list_players(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Player).all()


@router.post("/", response_model=PlayerRead, status_code=status.HTTP_201_CREATED)
def create_player(payload: PlayerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    player = Player(**payload.model_dump())
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@router.get("/{player_id}", response_model=PlayerRead)
def get_player(player_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player
