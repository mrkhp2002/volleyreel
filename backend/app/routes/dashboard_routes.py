from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db

from app.models.tournament_model import Tournament
from app.models.team_model import Team
from app.models.player_model import Player
from app.models.match_model import Match

router = APIRouter()


# =========================================
# DASHBOARD STATS
# =========================================

@router.get("/api/dashboard/stats")
def dashboard_stats(db: Session = Depends(get_db)):

    tournaments = db.query(func.count(Tournament.id)).scalar()

    teams = db.query(func.count(Team.id)).scalar()

    players = db.query(func.count(Player.id)).scalar()

    matches = db.query(func.count(Match.id)).scalar()

    return {
        "tournaments": tournaments,
        "teams": teams,
        "players": players,
        "matches": matches
    }


# =========================================
# MATCHES API
# =========================================

@router.get("/api/dashboard/matches")
def dashboard_matches(db: Session = Depends(get_db)):

    matches = db.query(Match).all()

    return matches


# =========================================
# TOURNAMENTS API
# =========================================

@router.get("/api/dashboard/tournaments")
def dashboard_tournaments(db: Session = Depends(get_db)):

    tournaments = db.query(Tournament).all()

    return tournaments


# =========================================
# ANALYTICS API
# =========================================

@router.get("/api/dashboard/analytics")
def dashboard_analytics():

    return {
        "videos_generated": 31,
        "under_review": 12,
        "processing": 3
    }