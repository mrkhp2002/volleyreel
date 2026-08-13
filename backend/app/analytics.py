from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class ClipRequest(BaseModel):
    event_id: int

@router.post("/analytics/generate-clip")
async def generate_clip(request: ClipRequest):

    return {
        "message": "Clip generation started",
        "event_id": request.event_id
    }