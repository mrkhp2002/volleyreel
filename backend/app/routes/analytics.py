from fastapi import APIRouter, Depends
from app.routes.dependencies import get_current_user

router = APIRouter()


@router.get("/summary")
def get_analytics_summary(current_user=Depends(get_current_user)):
    return {
        "tournaments_count": 0,
        "teams_count": 0,
        "matches_count": 0,
        "events_count": 0,
        "recent_highlights": []
    }
