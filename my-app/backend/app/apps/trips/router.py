"""Trip, Stop, Activity, and Budget API routes."""

import os
import uuid

from fastapi import APIRouter, Depends, File, UploadFile, status
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

router = APIRouter(prefix="/api/trips", tags=["trips"])


# ── Upload ───────────────────────────────────────────────────────────────

@router.post("/upload/cover", status_code=status.HTTP_201_CREATED)
async def upload_trip_cover(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    """Upload a cover image for a trip"""
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join("uploads", filename)
    
    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())
        
    return {"cover_url": f"http://localhost:8000/uploads/{filename}"}


# ── Trips ────────────────────────────────────────────────────────────────

@router.get("/", response_model=list[TripListOut])
async def list_trips(
    status: str | None = None,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all trips for current user, optional ?status= filter"""
    return await service.list_trips(db, current_user.id, status)

@router.post("/", response_model=TripOut, status_code=status.HTTP_201_CREATED)
async def create_trip(
    body: TripCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new trip"""
    return await service.create_trip(db, current_user.id, body)

@router.get("/{trip_id}", response_model=TripOut)
async def get_trip(
    trip_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get full trip detail with stops + activities"""
    return await service.get_trip(db, trip_id, current_user.id)

@router.put("/{trip_id}", response_model=TripOut)
async def update_trip(
    trip_id: int,
    body: TripUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update trip fields"""
    return await service.update_trip(db, trip_id, current_user.id, body)

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(
    trip_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete trip"""
    await service.delete_trip(db, trip_id, current_user.id)

# ── Stops ────────────────────────────────────────────────────────────────

@router.post("/{trip_id}/stops", response_model=StopOut, status_code=status.HTTP_201_CREATED)
async def add_stop(
    trip_id: int,
    body: StopCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add a stop to trip"""
    return await service.add_stop(db, trip_id, current_user.id, body)

@router.put("/{trip_id}/stops/{stop_id}", response_model=StopOut)
async def update_stop(
    trip_id: int,
    stop_id: int,
    body: StopUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a stop"""
    return await service.update_stop(db, stop_id, current_user.id, body)

@router.delete("/{trip_id}/stops/{stop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stop(
    trip_id: int,
    stop_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a stop"""
    await service.delete_stop(db, stop_id, current_user.id)

@router.post("/{trip_id}/stops/reorder", response_model=list[StopOut])
async def reorder_stops(
    trip_id: int,
    body: StopReorder,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reorder stops"""
    return await service.reorder_stops(db, trip_id, current_user.id, body)

# ── Activities ───────────────────────────────────────────────────────────

@router.post("/{trip_id}/stops/{stop_id}/activities", response_model=TripActivityOut, status_code=status.HTTP_201_CREATED)
async def add_activity(
    trip_id: int,
    stop_id: int,
    body: TripActivityCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add activity to stop"""
    return await service.add_activity(db, stop_id, current_user.id, body)

@router.put("/{trip_id}/stops/{stop_id}/activities/{activity_id}", response_model=TripActivityOut)
async def update_activity(
    trip_id: int,
    stop_id: int,
    activity_id: int,
    body: TripActivityUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update activity"""
    return await service.update_activity(db, activity_id, current_user.id, body)

@router.delete("/{trip_id}/stops/{stop_id}/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_activity(
    trip_id: int,
    stop_id: int,
    activity_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete activity"""
    await service.delete_activity(db, activity_id, current_user.id)

# ── Budget ───────────────────────────────────────────────────────────────

@router.get("/{trip_id}/budget", response_model=BudgetSummary)
async def get_trip_budget(
    trip_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get budget summary"""
    return await service.get_budget_summary(db, trip_id, current_user.id)
