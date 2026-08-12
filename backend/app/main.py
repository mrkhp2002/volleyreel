from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
import app.models

from app.routes.api import api_router
from app.routes import dashboard


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
app.include_router(api_router, prefix="/api",)

app.include_router(
    dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])


@app.get("/health")
def health_check():
    return {"status": "ok"}
