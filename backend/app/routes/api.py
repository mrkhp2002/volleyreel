from fastapi import APIRouter
from app.routes.auth import router as auth_router
from app.routes.tournaments import router as tournaments_router
from app.routes.teams import router as teams_router
from app.routes.players import router as players_router
from app.routes.matches import router as matches_router
from app.routes.events import router as events_router
from app.routes.analytics import router as analytics_router
from app.routes.pipeline import router as pipeline_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(tournaments_router, prefix="/tournaments", tags=["tournaments"])
api_router.include_router(teams_router, prefix="/teams", tags=["teams"])
api_router.include_router(players_router, prefix="/players", tags=["players"])
api_router.include_router(matches_router, prefix="/matches", tags=["matches"])
api_router.include_router(events_router, prefix="/events", tags=["events"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
api_router.include_router(pipeline_router, prefix="/pipeline", tags=["pipeline"])
