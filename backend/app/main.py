from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.analytics import router as analytics_router
from app.routes.dashboard_routes import router

app = FastAPI()

# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================
# ROUTES
# =========================================

app.include_router(router)


@app.get("/")
def root():

    return {
        "message": "VolleyReel FastAPI Backend Running"
    }