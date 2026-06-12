from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.team import Team
from app.schemas.team import TeamRead, TeamCreate

router = APIRouter(prefix="/teams", tags=["Teams"])

@router.get("/", response_model=list[TeamRead])
def get_teams(db: Session = Depends(get_db)):
    return db.query(Team).all()

@router.get("/{team_id}", response_model=TeamRead)
def get_team(team_id: str, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team profile parameter target missing")
    return team

@router.post("/")
def create_team(payload: TeamCreate, db: Session = Depends(get_db)):
    obj = Team(**payload.model_dump())
    db.add(obj)
    db.commit()
    return {"status": "success", "id": obj.id}