from fastapi import FastAPI

from app.routes.auth import router as auth_router

app = FastAPI(title="VolleyReel API", version="0.1.0")
app.include_router(auth_router, prefix="/auth", tags=["auth"])


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
