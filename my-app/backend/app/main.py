"""Application entry point — FastAPI app factory with all routers and middleware."""

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import init_db
from app.core.exceptions import AppException

# ── Import all models so Base.metadata knows about them ──────────────────
from app.apps.users.models import User  # noqa: F401
from app.apps.trips.models import Trip, Stop, TripActivity  # noqa: F401
from app.apps.catalog.models import City, Activity  # noqa: F401
from app.apps.checklist.models import ChecklistItem  # noqa: F401
from app.apps.notes.models import Note  # noqa: F401
from app.apps.community.models import TripCopy  # noqa: F401

# ── Import routers ──────────────────────────────────────────────────────
from app.apps.users.router import router as users_router
from app.apps.trips.router import router as trips_router
from app.apps.catalog.router import router as catalog_router
from app.apps.checklist.router import router as checklist_router
from app.apps.notes.router import router as notes_router
from app.apps.community.router import router as community_router
from app.apps.admin.router import router as admin_router

logger = logging.getLogger("traveloop")


# ── Lifespan ─────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    logger.info("🚀 Starting Traveloop API …")
    os.makedirs("uploads", exist_ok=True)
    logger.info("📁 Ensured uploads directory exists.")
    await init_db()
    logger.info("✅ Database tables ensured.")
    yield
    logger.info("🛑 Shutting down Traveloop API …")


# ── App creation ─────────────────────────────────────────────────────────


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Production-ready REST API for the Traveloop travel planning platform.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    debug=settings.debug,
)


# ── Middleware ───────────────────────────────────────────────────────────


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Global exception handler ────────────────────────────────────────────


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


# ── Routers ──────────────────────────────────────────────────────────────


app.include_router(users_router, prefix="/api", tags=["Auth & Users"])
app.include_router(trips_router)
app.include_router(catalog_router, prefix="/api", tags=["City & Activity Catalog"])
app.include_router(checklist_router, prefix="/api", tags=["Packing Checklist"])
app.include_router(notes_router, prefix="/api", tags=["Trip Notes"])
app.include_router(community_router, prefix="/api", tags=["Community"])
app.include_router(admin_router, prefix="/api", tags=["Admin"])

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# ── Root health check ───────────────────────────────────────────────────


@app.get("/", tags=["Health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "traveloop-api", "version": "1.0.0"}
