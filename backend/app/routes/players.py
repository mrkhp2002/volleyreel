from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.player import Player
from app.schemas.player import PlayerCreate, PlayerRead, PlayerUpdate
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[PlayerRead])
def list_players(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # 1. ලොග් වෙලා ඉන්න කෙනාගේ ප්ලේයර්ස්ලා විතරක් යවනවා
    return db.query(Player).filter(Player.user_id == current_user.id).all()


@router.post("/", response_model=PlayerRead, status_code=status.HTTP_201_CREATED)
def create_player(payload: PlayerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    print(f"DEBUG: Received payload: {payload}")
    if not payload.name or not payload.name.strip():
        raise HTTPException(
            status_code=400, detail="Player name cannot be empty or just whitespace.")

    player_count = db.query(Player).filter(
        Player.team_id == payload.team_id).count()
    if player_count >= 14:
        raise HTTPException(
            status_code=400, detail="Team roster is full (Maximum 14 players allowed).")

    # 2. නිවැරදිව player විචල්‍යයට දත්ත සහ user_id එක දානවා
    player = Player(**payload.model_dump(), user_id=current_user.id)
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@router.get("/{player_id}", response_model=PlayerRead)
def get_player(player_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # 3. ලොකු අකුරෙන් Player පාවිච්චි කරලා, අදාළ user ගේ දත්තය විතරක් ගන්නවා
    player = db.query(Player).filter(
        Player.player_id == player_id,
        Player.user_id == current_user.id
    ).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player


@router.put("/{player_id}", response_model=PlayerRead)
def update_player(
    player_id: int,
    payload: PlayerUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 4. වෙන කෙනෙක්ගේ දත්ත Update කරන එක වළක්වන්න user_id එකත් චෙක් කරනවා
    player = db.query(Player).filter(
        Player.player_id == player_id,
        Player.user_id == current_user.id
    ).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(player, field, value)

    db.commit()
    db.refresh(player)
    return player


@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_player(player_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # 5. වෙන කෙනෙක්ගේ දත්ත මකා දමන එක වළක්වන්න user_id එකත් චෙක් කරනවා
    player = db.query(Player).filter(
        Player.player_id == player_id,
        Player.user_id == current_user.id
    ).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    db.delete(player)
    db.commit()
