from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.team import Team
from app.schemas.team import TeamCreate, TeamRead, TeamUpdate
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=list[TeamRead])
def list_teams(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Team).all()


@router.post("/", response_model=TeamRead, status_code=status.HTTP_201_CREATED)
def create_team(payload: TeamCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Uniqueness is scoped to tournament — two different tournaments can each
    # have a team called "Tigers" without conflict.
    existing = db.query(Team).filter(
        Team.name == payload.name,
        Team.tournament_id == payload.tournament_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Team name already exists in this tournament")

    # Explicit field assignment avoids passing unknown schema fields to the ORM.
    team = Team(
        name=payload.name,
        tournament_id=payload.tournament_id,
    )
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


@router.get("/{team_id}", response_model=TeamRead)
def get_team(team_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    team = db.query(Team).filter(Team.team_id == team_id).first()
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
    team = db.query(Team).filter(Team.team_id == team_id).first()
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
    team = db.query(Team).filter(Team.team_id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    db.delete(team)
    db.commit()
