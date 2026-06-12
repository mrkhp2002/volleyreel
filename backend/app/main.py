from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine


from app.routes import auth, tournaments, teams, players, matches, events, admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VolleyReel API Platform Core Server Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication Layer"])
app.include_router(tournaments.router, prefix="/tournaments", tags=["Tournaments Data"])
app.include_router(teams.router, prefix="/teams", tags=["Club Team Profiles"])
app.include_router(players.router, prefix="/players", tags=["Athletic Team Rosters"])
app.include_router(matches.router, prefix="/matches", tags=["Ingestion Matches Engine"])
app.include_router(events.router, prefix="/events", tags=["Analytical Timelines"])
app.include_router(admin.router, prefix="/admin", tags=["Admin Telemetry Monitors"])

@app.get("/health")
def system_health_status() -> dict[str, str]:
    return {"status": "operational", "database": "connected"}