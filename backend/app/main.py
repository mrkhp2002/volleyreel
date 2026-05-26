from fastapi import FastAPI
from app.database import engine, Base
from app.routes.auth import router as auth_router

# Import all models so SQLAlchemy registers them
# Without this tables will NOT be created
from app.models.user import User
from app.models.tournament import Tournament
from app.models.team import Team
from app.models.player import Player
from app.models.match import Match
from app.models.event import Event

app = FastAPI(title="VolleyReel API", version="0.1.0")

# Creates all tables when app starts
# Skips tables that already exist
Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/auth", tags=["auth"])

@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
