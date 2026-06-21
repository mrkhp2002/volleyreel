from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.tournament import Tournament
from app.models.team import Team
from app.models.match import Match
from app.models.event import Event
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/summary")
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    uid = current_user.id

    # Tournaments owned by this user
    tournaments_count = (
        db.query(Tournament)
        .filter(Tournament.user_id == uid)
        .count()
    )

    # Teams that belong to any of this user's tournaments
    teams_count = (
        db.query(Team)
        .join(Tournament, Team.tournament_id == Tournament.tournament_id)
        .filter(Tournament.user_id == uid)
        .count()
    )

    # Matches that belong to any of this user's tournaments
    matches_count = (
        db.query(Match)
        .join(Tournament, Match.tournament_id == Tournament.tournament_id)
        .filter(Tournament.user_id == uid)
        .count()
    )

    # Events that belong to matches inside this user's tournaments
    events_count = (
        db.query(Event)
        .join(Match, Event.match_id == Match.match_id)
        .join(Tournament, Match.tournament_id == Tournament.tournament_id)
        .filter(Tournament.user_id == uid)
        .count()
    )

    return {
        "tournaments_count": tournaments_count,
        "teams_count": teams_count,
        "matches_count": matches_count,
        "events_count": events_count,
        "recent_highlights": [],
    }
