from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< HEAD
from app.database import Base, engine


from app.routes import auth, tournaments, teams, players, matches, events, admin
=======

from app.database import Base, engine
import app.models

from app.routes.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables for local development
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="VolleyReel API",
    version="0.1.0",
    lifespan=lifespan
)

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized API routes
app.include_router(api_router, prefix="/api")
>>>>>>> dev

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
<<<<<<< HEAD
def system_health_status() -> dict[str, str]:
    return {"status": "operational", "database": "connected"}
=======
def health_check():
    return {"status": "ok"}
>>>>>>> dev
