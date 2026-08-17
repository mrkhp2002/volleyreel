import sys
import os
import datetime
import uuid

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.tournament import Tournament
from app.models.team import Team
from app.models.player import Player
from app.models.match import Match

def seed_data():
    db = SessionLocal()
    try:
        print("Checking user account...")
        # Get or create an active user to assign ownership
        user = db.query(User).first()
        if not user:
            user = User(
                username="admin_coach",
                email="coach@volleyreel.com",
                hashed_password="hashedpassword123",
                full_name="Kanchana Piyasekara",
                role="coach"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        print(f"Assigning data to user: {user.full_name} (User ID: {user.id})")

        # 1. Create Tournament
        tournament = Tournament(
            name="VolleyReel National Championship 2026",
            description="Premier national volleyball tournament bringing together top-tier university and club teams.",
            location="Metropolitan Arena, Chicago, IL",
            start_date=datetime.date(2026, 9, 1),
            end_date=datetime.date(2026, 9, 10),
            type="Championship League",
            category="Men's Senior Division",
            city="Chicago",
            organizer_name="VolleyReel Sports Federation",
            team_limit=5,
            groups_count=1,
            match_format="Best of 5 Sets (25 Rally Points)",
            set_rules="25 Point Rally Score, 15 Point Tiebreak 5th Set",
            status="Active",
            public_visibility=True,
            allow_report_sharing=True,
            enable_leaderboard=True,
            user_id=user.id
        )
        db.add(tournament)
        db.commit()
        db.refresh(tournament)
        print(f"[OK] Created Tournament: {tournament.name} (ID: {tournament.tournament_id})")

        # 2. Create 5 Teams
        teams_data = [
            {
                "name": "Apex Spikers",
                "coach": "Marcus Vance",
                "club_name": "Chicago Apex Volleyball",
                "city": "Chicago",
                "home_venue": "Apex Training Facility",
                "founded_year": "2018",
                "category": "Men's Senior",
                "division": "Division 1"
            },
            {
                "name": "Thunder Aces",
                "coach": "Sarah Jenkins",
                "club_name": "Bay Area Thunder",
                "city": "San Francisco",
                "home_venue": "Pacific Sports Complex",
                "founded_year": "2020",
                "category": "Men's Senior",
                "division": "Division 1"
            },
            {
                "name": "Iron Blockers",
                "coach": "David Miller",
                "club_name": "Empire State Volleyball",
                "city": "New York",
                "home_venue": "Madison Sports Hall",
                "founded_year": "2015",
                "category": "Men's Senior",
                "division": "Division 1"
            },
            {
                "name": "Phoenix Velocity",
                "coach": "Elena Rostova",
                "club_name": "LA Velocity Club",
                "city": "Los Angeles",
                "home_venue": "West Coast Arena",
                "founded_year": "2021",
                "category": "Men's Senior",
                "division": "Division 1"
            },
            {
                "name": "Titan Setters",
                "coach": "Robert Hayes",
                "club_name": "Miami Titans AC",
                "city": "Miami",
                "home_venue": "Sun Coast Athletic Pavilion",
                "founded_year": "2019",
                "category": "Men's Senior",
                "division": "Division 1"
            }
        ]

        created_teams = []
        for t_info in teams_data:
            team = Team(
                name=t_info["name"],
                coach=t_info["coach"],
                club_name=t_info["club_name"],
                city=t_info["city"],
                home_venue=t_info["home_venue"],
                founded_year=t_info["founded_year"],
                category=t_info["category"],
                division=t_info["division"],
                status="Active",
                tournament_id=tournament.tournament_id,
                user_id=user.id
            )
            db.add(team)
            db.commit()
            db.refresh(team)
            created_teams.append(team)
            print(f"  - Added Team: {team.name} (ID: {team.team_id})")

        # 3. Add Roster Players to Each Team
        sample_positions = ["Outside Hitter", "Middle Blocker", "Setter", "Opposite Hitter", "Libero"]
        for team in created_teams:
            for jersey_num in range(1, 6):
                player = Player(
                    name=f"Player {jersey_num} ({team.name.split()[0]})",
                    jersey_number=jersey_num,
                    position=sample_positions[(jersey_num - 1) % len(sample_positions)],
                    team_id=team.team_id,
                    user_id=user.id
                )
                db.add(player)
            db.commit()
        print("[OK] Created player rosters for all 5 teams.")

        # 4. Create Round-Robin Matches with Video URLs for Every Team
        # 5 teams in round-robin = 10 total matches (every team plays 4 matches)
        sample_videos = [
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoylikes.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnTheLocks.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
        ]

        match_count = 0
        n_teams = len(created_teams)
        for i in range(n_teams):
            for j in range(i + 1, n_teams):
                home = created_teams[i]
                away = created_teams[j]
                video_sample = sample_videos[match_count % len(sample_videos)]
                
                # Alternate home/away scores for realistic data
                h_score = 3 if match_count % 2 == 0 else (1 if match_count % 3 == 0 else 2)
                a_score = 1 if h_score == 3 else 3
                
                match = Match(
                    tournament_id=tournament.tournament_id,
                    home_team_id=home.team_id,
                    away_team_id=away.team_id,
                    home_score=h_score,
                    away_score=a_score,
                    match_status="completed",
                    status="complete",
                    video_url=video_sample,
                    public_id=str(uuid.uuid4())
                )
                db.add(match)
                match_count += 1

        db.commit()
        print(f"[OK] Created {match_count} matches with video URLs for each team.")
        print("\n[SUCCESS] Dummy tournament data seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
