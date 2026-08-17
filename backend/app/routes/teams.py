from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.team import Team
from app.schemas.team import TeamCreate, TeamRead, TeamUpdate
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[TeamRead])
def list_teams(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_role = getattr(current_user, "role", "coach").lower()
    if user_role in ["player", "admin", "viewer", "public_user"]:
        return db.query(Team).all()
    return db.query(Team).filter(Team.user_id == current_user.id).all()


@router.post("/", response_model=TeamRead, status_code=status.HTTP_201_CREATED)
def create_team(payload: TeamCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_role = getattr(current_user, "role", "coach").lower()
    if user_role == "player":
        raise HTTPException(status_code=403, detail="Players cannot create teams. Only coaches and admins can create teams.")

    existing = db.query(Team).filter(
        Team.name == payload.name,
        Team.tournament_id == payload.tournament_id,
        Team.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="Team name already exists in this tournament")

    team = Team(**payload.model_dump(), user_id=current_user.id)
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


@router.get("/{team_id}", response_model=TeamRead)
def get_team(team_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_role = getattr(current_user, "role", "coach").lower()
    if user_role in ["player", "admin", "viewer", "public_user"]:
        team = db.query(Team).filter(Team.team_id == team_id).first()
    else:
        team = db.query(Team).filter(
            Team.team_id == team_id,
            Team.user_id == current_user.id
        ).first()

    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team


@router.put("/{team_id}", response_model=TeamRead)
def update_team(
    team_id: int,
    payload: TeamUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_role = getattr(current_user, "role", "coach").lower()
    if user_role == "player":
        raise HTTPException(status_code=403, detail="Players cannot modify teams.")

    team = db.query(Team).filter(
        Team.team_id == team_id,
        Team.user_id == current_user.id
    ).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(team, field, value)

    db.commit()
    db.refresh(team)
    return team


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(team_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_role = getattr(current_user, "role", "coach").lower()
    if user_role == "player":
        raise HTTPException(status_code=403, detail="Players cannot delete teams.")

    team = db.query(Team).filter(
        Team.team_id == team_id,
        Team.user_id == current_user.id
    ).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    db.delete(team)
    db.commit()

