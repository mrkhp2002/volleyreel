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

    recent_events = (
    db.query(Event)
        .join(Match, Event.match_id == Match.match_id)
        .join(Tournament, Match.tournament_id == Tournament.tournament_id)
        .filter(Tournament.user_id == uid)
        .order_by(Event.created_at.desc())
        .limit(5)
        .all()
    )

    recent_highlights = [
    {
        "event_id": e.event_id,
        "event_type": e.event_type,
        "timestamp_sec": e.timestamp_sec,
        "match_id": e.match_id,
        "clip_url": e.clip_url,
    }
    for e in recent_events
    ]

    return {
        "tournaments_count": tournaments_count,
        "teams_count": teams_count,
        "matches_count": matches_count,
        "events_count": events_count,
        "recent_highlights": recent_highlights,
    }

@router.get("/match/{match_id}/timeline")
def get_match_timeline(
    match_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    events = (
        db.query(Event)
        .join(Match, Event.match_id == Match.match_id)
        .join(Tournament, Match.tournament_id == Tournament.tournament_id)
        .filter(
            Event.match_id == match_id,
            Tournament.user_id == current_user.id
        )
        .order_by(Event.timestamp_sec.asc())
        .all()
    )

    return [
        {
            "time": f"{int(e.timestamp_sec // 60):02}:{int(e.timestamp_sec % 60):02}",
            "event": e.event_type,
            "clip_url": e.clip_url,
            "player_id": e.player_id,
        }
        for e in events
    ]