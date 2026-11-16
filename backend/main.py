"""
SupeRR Selector API - FastAPI Backend Entrypoint
Rajasthan Royals Hackathon - Season 2
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.api.routes import router as api_router
from backend.services.data_service import service

app = FastAPI(
    title="SupeRR Selector API",
    description="Pressure Intelligence & Player Performance Analytics Platform for Rajasthan Royals Hackathon Season 2",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration for local development and production deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints
app.include_router(api_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SupeRR Selector API",
        "data_loaded": service.is_loaded,
        "eligible_batters": len([p for p in service.batting_rankings if p.get("eligible")]),
        "eligible_bowlers": len([p for p in service.bowling_rankings if p.get("eligible")])
    }

# Check if frontend production dist directory exists and mount static assets
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    # Mount assets folder
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Catch-all route to serve React index.html for client-side routing
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "message": "Welcome to SupeRR Selector API - Season 2",
            "documentation": "/api/docs",
            "endpoints": {
                "summary": "/api/summary",
                "top_batters": "/api/rankings/top-batters",
                "top_bowlers": "/api/rankings/top-bowlers",
                "batting_leaderboard": "/api/rankings/batting",
                "bowling_leaderboard": "/api/rankings/bowling",
                "analytics": "/api/analytics",
                "model_evaluation": "/api/models/evaluation"
            }
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
