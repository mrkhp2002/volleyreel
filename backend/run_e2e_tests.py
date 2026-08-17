import os
import sys
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.services.auth_service import get_password_hash

client = TestClient(app)

def test_full_e2e_flow():
    db = SessionLocal()
    try:
        # 1. Clean up old test users if they exist
        db.query(User).filter(User.email.in_(["testcoach@volley.com", "testplayer@volley.com"])).delete(synchronize_session=False)
        db.commit()

        print("\n--- Starting E2E Tests ---")

        # 2. Register Coach
        res = client.post("/api/auth/register", json={
            "full_name": "Test Coach",
            "email": "testcoach@volley.com",
            "password": "password123",
            "role": "coach"
        })
        assert res.status_code in [200, 201], f"Coach registration failed: {res.text}"
        print("[OK] Coach Registration successful")

        # 3. Login Coach
        res = client.post("/api/auth/login", json={
            "email": "testcoach@volley.com",
            "password": "password123"
        })
        assert res.status_code in [200, 201], "Coach login failed"
        coach_token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {coach_token}"}
        print("[OK] Coach Login successful")

        # 4. Create Tournament (Coach)
        res = client.post("/api/tournaments/", json={
            "name": "E2E Test Tournament",
            "type": "Round Robin",
            "team_limit": 8
        }, headers=headers)
        assert res.status_code in [200, 201], f"Tournament creation failed: {res.text}"
        tournament_id = res.json()["tournament_id"]
        print(f"[OK] Tournament Created (ID: {tournament_id})")

        # 5. Create Team 1 (Coach)
        res = client.post("/api/teams/", json={
            "name": "E2E Home Team",
            "tournament_id": tournament_id,
            "coach": "Test Coach",
        }, headers=headers)
        assert res.status_code in [200, 201], f"Team 1 creation failed: {res.text}"
        team1_id = res.json()["team_id"]
        print(f"[OK] Team 1 Created (ID: {team1_id})")

        # 6. Create Team 2 (Coach)
        res = client.post("/api/teams/", json={
            "name": "E2E Away Team",
            "tournament_id": tournament_id,
            "coach": "Away Coach",
        }, headers=headers)
        assert res.status_code in [200, 201], f"Team 2 creation failed: {res.text}"
        team2_id = res.json()["team_id"]
        print(f"[OK] Team 2 Created (ID: {team2_id})")

        # 7. Register Player & assign to Team 1
        res = client.post("/api/auth/register", json={
            "full_name": "Test Player",
            "email": "testplayer@volley.com",
            "password": "password123",
            "role": "player",
            "team_id": team1_id,
            "position": "Setter",
            "jersey_number": 10
        })
        assert res.status_code in [200, 201], f"Player registration failed: {res.text}"
        print("[OK] Player Registration (assigned to Team) successful")

        # 8. Login Player
        res = client.post("/api/auth/login", json={
            "email": "testplayer@volley.com",
            "password": "password123"
        })
        assert res.status_code == 200, "Player login failed"
        player_token = res.json()["access_token"]
        player_headers = {"Authorization": f"Bearer {player_token}"}
        print("[OK] Player Login successful")

        # 9. Verify Player RBAC (Should fail to create match)
        res = client.post("/api/matches/", json={
            "tournament_id": tournament_id,
            "home_team_id": team1_id,
            "away_team_id": team2_id,
        }, headers=player_headers)
        assert res.status_code in [403, 401], f"RBAC Failed! Player created a match: {res.text}"
        print("[OK] RBAC: Player forbidden from creating match")

        # 10. Create Match (Coach)
        res = client.post("/api/matches/", json={
            "tournament_id": tournament_id,
            "home_team_id": team1_id,
            "away_team_id": team2_id,
            "match_status": "upcoming"
        }, headers=headers)
        assert res.status_code in [200, 201], f"Match creation failed: {res.text}"
        match_id = res.json()["match_id"]
        print(f"[OK] Match Created (ID: {match_id})")

        # 10.5 Update Match with mock video URL
        res = client.put(f"/api/matches/{match_id}", json={
            "video_url": "mock_video.mp4"
        }, headers=headers)
        assert res.status_code in [200, 201], f"Match update failed: {res.text}"
        print("[OK] Match updated with video URL")

        # 11. Start Pipeline (Coach)
        res = client.post(f"/api/pipeline/{match_id}/process", headers=headers)
        assert res.status_code == 200, f"Pipeline start failed: {res.text}"
        print("[OK] Pipeline started processing")

        # Clean up
        db.query(User).filter(User.email.in_(["testcoach@volley.com", "testplayer@volley.com"])).delete(synchronize_session=False)
        db.commit()
        print("[OK] Cleanup successful")
        print("\nAll Core E2E Tests Passed successfully!")

    except AssertionError as e:
        print(f"\nTEST FAILED: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    test_full_e2e_flow()
