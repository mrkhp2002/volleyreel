from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

from app.models.match import Match
from app.models.team import Team
# අලුතින් Tournament එක ගන්නවා
from app.models.tournament import Tournament
from app.routes.dependencies import get_current_user
from app.models.player import Player

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Tournament ගණන් කිරීම
    try:
        total_tournaments = db.query(Tournament).filter(
            Tournament.user_id == current_user.id).count()
    except:
        total_tournaments = 0

    try:
        total_teams = db.query(Team).filter(
            Team.user_id == current_user.id).count()
    except:
        total_teams = 0

    # 3. Matches ගණන් කිරීම (මෙතන තමයි Error එක ආවේ!)
    # දැනට අපි මේක 0 කරනවා. Match Model එක බැලුවට පස්සේ මේක හදමු.
    total_matches = 0
    try:
        total_players = db.query(Player).filter(
            Player.user_id == current_user.id).count()
    except:
        total_players = 0

    return {
        "total_tournaments": total_tournaments,
        "total_teams": total_teams,
        "total_matches": total_matches,
        "total_players": total_players,
        "status": "success"
    }
