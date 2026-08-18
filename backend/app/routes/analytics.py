from fastapi import APIRouter, Depends, HTTPException
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
    tournament_id: int | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    uid = current_user.id

    if tournament_id:
        tournament = (
            db.query(Tournament)
            .filter(Tournament.tournament_id == tournament_id)
            .first()
        )
        if not tournament:
            raise HTTPException(status_code=404, detail="Tournament not found")
        if not tournament.public_visibility and tournament.user_id != uid:
            raise HTTPException(status_code=403, detail="Not authorized")

        tournaments_count = 1
        
        teams_count = (
            db.query(Team)
            .filter(Team.tournament_id == tournament_id)
            .count()
        )

        matches_count = (
            db.query(Match)
            .filter(Match.tournament_id == tournament_id)
            .count()
        )

        events_count = (
            db.query(Event)
            .join(Match, Event.match_id == Match.match_id)
            .filter(Match.tournament_id == tournament_id)
            .count()
        )

        recent_events = (
            db.query(Event)
            .join(Match, Event.match_id == Match.match_id)
            .filter(Match.tournament_id == tournament_id)
            .order_by(Event.created_at.desc())
            .limit(5)
            .all()
        )
    else:
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


@router.get("/tournament/{tournament_id}/standings")
def get_tournament_standings(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    tournament = (
        db.query(Tournament)
        .filter(Tournament.tournament_id == tournament_id)
        .first()
    )
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
        
    if not tournament.public_visibility and tournament.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this tournament")
        
    teams = (
        db.query(Team)
        .filter(Team.tournament_id == tournament_id)
        .all()
    )
    
    standings = []
    for team in teams:
        matches = (
            db.query(Match)
            .filter(
                Match.tournament_id == tournament_id,
                (Match.home_team_id == team.team_id) | (Match.away_team_id == team.team_id)
            )
            .all()
        )
        
        mp = 0
        w = 0
        l = 0
        sw = 0
        sl = 0
        pts = 0
        
        for m in matches:
            is_played = (m.home_score > 0 or m.away_score > 0) or m.status == "complete"
            if not is_played:
                continue
                
            mp += 1
            if m.home_team_id == team.team_id:
                sw += m.home_score
                sl += m.away_score
                if m.home_score > m.away_score:
                    w += 1
                    if m.home_score == 3 and m.away_score == 2:
                        pts += 2
                    else:
                        pts += 3
                else:
                    l += 1
                    if m.away_score == 3 and m.home_score == 2:
                        pts += 1
            else:
                sw += m.away_score
                sl += m.home_score
                if m.away_score > m.home_score:
                    w += 1
                    if m.away_score == 3 and m.home_score == 2:
                        pts += 2
                    else:
                        pts += 3
                else:
                    l += 1
                    if m.home_score == 3 and m.away_score == 2:
                        pts += 1
                        
        win_rate = f"{(w / mp * 100):.1f}%" if mp > 0 else "0.0%"
        standings.append({
            "team_id": team.team_id,
            "name": team.name,
            "mp": mp,
            "w": w,
            "l": l,
            "sw": sw,
            "sl": sl,
            "points": pts,
            "win_rate": win_rate
        })
        
    standings.sort(key=lambda x: (-x["points"], -x["w"], -(x["sw"] / x["sl"] if x["sl"] > 0 else x["sw"]), x["name"]))
    
    for rank, entry in enumerate(standings, 1):
        entry["rank"] = rank
        
    return standings


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