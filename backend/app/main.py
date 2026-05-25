from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.database import init_db
from app.routers import auth, gallery, reviews, assistant

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create DB tables + ensure media directory exists
    await init_db()
    Path(settings.media_dir).mkdir(parents=True, exist_ok=True)
    yield
    # Shutdown: nothing to clean up for SQLite


def create_app() -> FastAPI:
    app = FastAPI(
        title="Harput Castle API",
        description=(
            "Backend for the Harput Rehberi mobile app. "
            "Provides Auth, Gallery, Reviews, and AI Assistant."
        ),
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS — allow the Expo dev server and any configured origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Static file serving for uploaded gallery images
    media_path = Path(settings.media_dir)
    media_path.mkdir(parents=True, exist_ok=True)
    app.mount("/media", StaticFiles(directory=str(media_path)), name="media")

    # Routers
    app.include_router(auth.router)
    app.include_router(gallery.router)
    app.include_router(reviews.router)
    app.include_router(assistant.router)

    @app.get("/", tags=["Health"])
    async def health_check():
        return {"status": "ok", "service": "Harput Castle API"}

    return app


app = create_app()
