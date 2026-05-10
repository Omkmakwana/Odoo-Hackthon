"""Trip, Stop, Activity, and Budget API routes."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.apps.trips import service
from app.apps.trips.schemas import (
    BudgetSummary,
    StopCreate,
    StopOut,
    StopReorder,
    StopUpdate,
    TripActivityCreate,
    TripActivityOut,
    TripActivityUpdate,
    TripCreate,
    TripListOut,
    TripOut,
    TripUpdate,
)
from app.core.database import get_db
from app.core.dependencies import get_current_user

router = APIRouter()


# ── Trips ────────────────────────────────────────────────────────────────


@router.post("/trips", response_model=TripOut, status_code=status.HTTP_201_CREATED)
async def create_trip(
    body: TripCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new trip for the authenticated user."""
    return await service.create_trip(db, current_user.id, body)


@router.get("/trips", response_model=list[TripListOut])
async def list_my_trips(
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 50,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List the authenticated user's trips with optional status filter."""
    return await service.list_user_trips(db, current_user.id, status_filter, skip, limit)


@router.get("/trips/{trip_id}", response_model=TripOut)
async def get_trip(
    trip_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a trip by ID (must be the owner)."""
    trip = await service.get_trip(db, trip_id)
    service.assert_trip_owner(trip, current_user.id)
    return trip


@router.patch("/trips/{trip_id}", response_model=TripOut)
async def update_trip(
    trip_id: int,
    body: TripUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a trip's details."""
    trip = await service.get_trip(db, trip_id)
    service.assert_trip_owner(trip, current_user.id)
    return await service.update_trip(db, trip, body)


@router.delete("/trips/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a trip."""
    trip = await service.get_trip(db, trip_id)
    service.assert_trip_owner(trip, current_user.id)
    await service.delete_trip(db, trip)


# ── Public / shared ─────────────────────────────────────────────────────


@router.get("/shared/{slug}", response_model=TripOut)
async def get_shared_trip(slug: str, db: AsyncSession = Depends(get_db)):
    """View a publicly shared trip by its slug (no auth required)."""
    return await service.get_trip_by_slug(db, slug)


# ── Stops ────────────────────────────────────────────────────────────────


@router.post("/trips/{trip_id}/stops", response_model=StopOut, status_code=status.HTTP_201_CREATED)
async def add_stop(
    trip_id: int,
    body: StopCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a city stop to a trip."""
    trip = await service.get_trip(db, trip_id)
    service.assert_trip_owner(trip, current_user.id)
    return await service.add_stop(db, trip_id, body)


@router.patch("/stops/{stop_id}", response_model=StopOut)
async def update_stop(
    stop_id: int,
    body: StopUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a stop."""
    stop = await service.get_stop(db, stop_id)
    trip = await service.get_trip(db, stop.trip_id)
    service.assert_trip_owner(trip, current_user.id)
    return await service.update_stop(db, stop, body)


@router.put("/trips/{trip_id}/stops/reorder", response_model=list[StopOut])
async def reorder_stops(
    trip_id: int,
    body: StopReorder,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reorder the stops of a trip."""
    trip = await service.get_trip(db, trip_id)
    service.assert_trip_owner(trip, current_user.id)
    return await service.reorder_stops(db, trip_id, body)


@router.delete("/stops/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stop(
    stop_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a stop and its activities."""
    stop = await service.get_stop(db, stop_id)
    trip = await service.get_trip(db, stop.trip_id)
    service.assert_trip_owner(trip, current_user.id)
    await service.delete_stop(db, stop)


# ── Activities ───────────────────────────────────────────────────────────


@router.post("/stops/{stop_id}/activities", response_model=TripActivityOut, status_code=status.HTTP_201_CREATED)
async def add_activity(
    stop_id: int,
    body: TripActivityCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add an activity to a stop."""
    stop = await service.get_stop(db, stop_id)
    trip = await service.get_trip(db, stop.trip_id)
    service.assert_trip_owner(trip, current_user.id)
    return await service.add_activity(db, stop_id, body)


@router.patch("/activities/{activity_id}", response_model=TripActivityOut)
async def update_activity(
    activity_id: int,
    body: TripActivityUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an activity."""
    activity = await service.get_activity(db, activity_id)
    stop = await service.get_stop(db, activity.stop_id)
    trip = await service.get_trip(db, stop.trip_id)
    service.assert_trip_owner(trip, current_user.id)
    return await service.update_activity(db, activity, body)


@router.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activity(
    activity_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove an activity."""
    activity = await service.get_activity(db, activity_id)
    stop = await service.get_stop(db, activity.stop_id)
    trip = await service.get_trip(db, stop.trip_id)
    service.assert_trip_owner(trip, current_user.id)
    await service.delete_activity(db, activity)


# ── Budget ───────────────────────────────────────────────────────────────


@router.get("/trips/{trip_id}/budget", response_model=BudgetSummary)
async def get_trip_budget(
    trip_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the full budget breakdown for a trip."""
    trip = await service.get_trip(db, trip_id)
    service.assert_trip_owner(trip, current_user.id)
    return await service.get_budget_summary(db, trip)
