"""City & Activity search API routes."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.apps.catalog import service
from app.apps.catalog.schemas import ActivityCreate, ActivityOut, CityCreate, CityOut
from app.core.database import get_db
from app.core.dependencies import get_current_admin, get_current_user

router = APIRouter()


# ── Cities ───────────────────────────────────────────────────────────────


@router.get("/cities", response_model=list[CityOut])
async def search_cities(
    q: str = "",
    region: str | None = None,
    skip: int = 0,
    limit: int = 50,
    _user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Search cities by name/country with optional region filter."""
    return await service.search_cities(db, q, region, skip, limit)


@router.get("/cities/{city_id}", response_model=CityOut)
async def get_city(
    city_id: int,
    _user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single city by ID."""
    return await service.get_city(db, city_id)


@router.post("/cities", response_model=CityOut, status_code=status.HTTP_201_CREATED)
async def create_city(
    body: CityCreate,
    _admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: add a new city to the catalog."""
    return await service.create_city(db, body)


# ── Activities ───────────────────────────────────────────────────────────


@router.get("/activities", response_model=list[ActivityOut])
async def search_activities(
    q: str = "",
    city_id: int | None = None,
    category: str | None = None,
    max_cost: float | None = None,
    max_duration: int | None = None,
    skip: int = 0,
    limit: int = 50,
    _user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Search activities with multi-filter support."""
    return await service.search_activities(db, q, city_id, category, max_cost, max_duration, skip, limit)


@router.get("/activities/{activity_id}", response_model=ActivityOut)
async def get_activity(
    activity_id: int,
    _user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single activity by ID."""
    return await service.get_activity(db, activity_id)


@router.post("/activities", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
async def create_activity(
    body: ActivityCreate,
    _admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: add a new activity to the catalog."""
    return await service.create_activity(db, body)
