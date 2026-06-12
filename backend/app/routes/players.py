from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.player import Player
from app.schemas.player import PlayerRead, PlayerCreate

router = APIRouter(prefix="/players", tags=["Players"])

@router.get("/", response_model=list[PlayerRead])
def get_players(db: Session = Depends(get_db)):
    return db.query(Player).all()

@router.get("/{player_id}", response_model=PlayerRead)
def get_player(player_id: str, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player record profile missing")
    return player

@router.post("/", response_model=PlayerRead)
def create_player(payload: PlayerCreate, db: Session = Depends(get_db)):
    obj = Player(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/{player_id}")
def delete_player(player_id: str, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
         raise HTTPException(status_code=404, detail="Profile target not found")
    db.delete(player)
    db.commit()
    return {"status": "success", "message": "Player dropped from roster file mapping"}