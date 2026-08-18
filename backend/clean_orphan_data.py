import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.tournament import Tournament
from app.models.team import Team
from app.models.match import Match
from app.models.event import Event

def clean_orphan_data():
    db = SessionLocal()
    try:
        # Get list of valid tournament IDs
        valid_tourney_ids = [t.tournament_id for t in db.query(Tournament).all()]
        print(f"Valid active tournaments in database: {valid_tourney_ids}")

        # Delete matches whose tournament_id is not in valid_tourney_ids
        orphan_matches = db.query(Match).filter(~Match.tournament_id.in_(valid_tourney_ids)).all()
        orphan_match_count = len(orphan_matches)
        
        if orphan_match_count > 0:
            for m in orphan_matches:
                db.delete(m)
            db.commit()
            print(f"[OK] Deleted {orphan_match_count} orphan matches.")
        else:
            print("[OK] No orphan matches found.")

        # Delete teams whose tournament_id is not in valid_tourney_ids
        orphan_teams = db.query(Team).filter(~Team.tournament_id.in_(valid_tourney_ids)).all()
        orphan_team_count = len(orphan_teams)

        if orphan_team_count > 0:
            for t in orphan_teams:
                db.delete(t)
            db.commit()
            print(f"[OK] Deleted {orphan_team_count} orphan teams.")
        else:
            print("[OK] No orphan teams found.")

        print("\n[SUCCESS] Cleanup completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Cleanup error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    clean_orphan_data()
