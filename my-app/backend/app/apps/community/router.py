"""Community API routes — shared trips and copy."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.apps.community import service
from app.apps.community.schemas import SharedTripOut, SharedTripDetailOut
from app.apps.trips.schemas import TripOut
from app.core.database import get_db
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/shared/{slug}", response_model=SharedTripDetailOut)
async def get_shared_trip_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint: get a shared trip by its public_slug (no auth required)."""
    return await service.get_trip_by_slug(db, slug)


@router.get("/community/trips", response_model=list[SharedTripOut])
async def list_shared_trips(
    skip: int = 0,
    limit: int = 20,
    _user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Browse publicly shared trips from the community."""
    return await service.get_public_trips(db, skip, limit)


@router.post("/community/trips/{trip_id}/copy", response_model=TripOut, status_code=status.HTTP_201_CREATED)
async def copy_trip(
    trip_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Copy a shared trip into your own account (deep clone)."""
    return await service.copy_trip(db, trip_id, current_user.id)
