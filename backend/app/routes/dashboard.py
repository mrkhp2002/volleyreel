from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

from app.models.match import Match
from app.models.team import Team
from app.models.tournament import Tournament
from app.models.player import Player
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    uid = current_user.id

    try:
        total_tournaments = db.query(Tournament).filter(Tournament.user_id == uid).count()
    except Exception:
        total_tournaments = 0

    try:
        total_teams = db.query(Team).filter(Team.user_id == uid).count()
    except Exception:
        total_teams = 0

    try:
        total_matches = (
            db.query(Match)
            .join(Tournament, Match.tournament_id == Tournament.tournament_id)
            .filter(Tournament.user_id == uid)
            .count()
        )
    except Exception:
        total_matches = 0

    try:
        total_players = db.query(Player).filter(Player.user_id == uid).count()
    except Exception:
        total_players = 0

    try:
        under_review = (
            db.query(Match)
            .join(Tournament, Match.tournament_id == Tournament.tournament_id)
            .filter(Tournament.user_id == uid, Match.status == "processing")
            .count()
        )
    except Exception:
        under_review = 0

    try:
        videos_generated = (
            db.query(Match)
            .join(Tournament, Match.tournament_id == Tournament.tournament_id)
            .filter(Tournament.user_id == uid, Match.status == "complete", Match.highlight_url.isnot(None))
            .count()
        )
    except Exception:
        videos_generated = 0

    # Recent matches (last 5)
    recent_matches = []
    try:
        db_matches = (
            db.query(Match)
            .join(Tournament, Match.tournament_id == Tournament.tournament_id)
            .filter(Tournament.user_id == uid)
            .order_by(Match.created_at.desc())
            .limit(5)
            .all()
        )

        for m in db_matches:
            home_name = m.home_team.name if m.home_team else f"Team #{m.home_team_id}"
            away_name = m.away_team.name if m.away_team else f"Team #{m.away_team_id}"
            tourney_name = m.tournament.name if m.tournament else "Tournament"
            score_str = f"{m.home_score}-{m.away_score}" if (m.home_score is not None and m.away_score is not None) else "--"

            recent_matches.append({
                "id": f"VM-{m.match_id}",
                "tournament": tourney_name,
                "teams": f"{home_name} vs {away_name}",
                "score": score_str,
                "status": m.match_status.capitalize() if m.match_status else "Upcoming"
            })
    except Exception:
        recent_matches = []

    return {
        "total_tournaments": total_tournaments,
        "total_teams": total_teams,
        "total_matches": total_matches,
        "total_players": total_players,
        "under_review": under_review,
        "videos_generated": videos_generated,
        "recent_matches": recent_matches,
        "status": "success"
    }

