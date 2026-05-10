"""Trip business logic layer."""

import secrets
from collections import defaultdict

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.apps.trips.models import Stop, Trip, TripActivity
from app.apps.trips.schemas import (
    BudgetBreakdown,
    BudgetSummary,
    StopCreate,
    StopReorder,
    StopUpdate,
    TripActivityCreate,
    TripActivityUpdate,
    TripCreate,
    TripUpdate,
)


# ── Trip CRUD ────────────────────────────────────────────────────────────

async def create_trip(db: AsyncSession, owner_id: int, data: TripCreate) -> Trip:
    trip = Trip(owner_id=owner_id, **data.model_dump())
    # public_slug generation on is_public=True: use secrets.token_urlsafe(8)
    if getattr(data, "is_public", False) or getattr(trip, "is_public", False):
        trip.public_slug = secrets.token_urlsafe(8)
    db.add(trip)
    await db.flush()
    await db.refresh(trip, ["stops"])
    return trip

async def get_trip(db: AsyncSession, trip_id: int, owner_id: int) -> Trip:
    result = await db.execute(
        select(Trip)
        .options(selectinload(Trip.stops).selectinload(Stop.activities))
        .where(Trip.id == trip_id)
    )
    trip = result.scalar_one_or_none()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.owner_id != owner_id:
        raise HTTPException(status_code=403, detail="Not authorized to access this trip")
    return trip

async def list_trips(db: AsyncSession, owner_id: int, status: str | None = None) -> list[Trip]:
    query = (
        select(Trip)
        .options(selectinload(Trip.stops).selectinload(Stop.activities))
        .where(Trip.owner_id == owner_id)
    )
    if status:
        query = query.where(Trip.status == status)
    
    query = query.order_by(Trip.created_at.desc())
    
    result = await db.execute(query)
    trips = list(result.scalars().all())
    
    for t in trips:
        t.stop_count = len(t.stops)
        t.total_cost = sum(a.estimated_cost for s in t.stops for a in s.activities)
        
    return trips

async def update_trip(db: AsyncSession, trip_id: int, owner_id: int, data: TripUpdate) -> Trip:
    trip = await get_trip(db, trip_id, owner_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(trip, field, value)
        
    if "is_public" in update_data:
        if trip.is_public and not trip.public_slug:
            trip.public_slug = secrets.token_urlsafe(8)
        elif not trip.is_public:
            trip.public_slug = None
            
    await db.flush()
    await db.refresh(trip, ["stops"])
    return trip

async def delete_trip(db: AsyncSession, trip_id: int, owner_id: int) -> None:
    trip = await get_trip(db, trip_id, owner_id)
    await db.delete(trip)
    await db.flush()


# ── Stop CRUD ────────────────────────────────────────────────────────────

async def add_stop(db: AsyncSession, trip_id: int, owner_id: int, data: StopCreate) -> Stop:
    await get_trip(db, trip_id, owner_id)
    
    stop = Stop(trip_id=trip_id, **data.model_dump())
    db.add(stop)
    await db.flush()
    await db.refresh(stop, ["activities"])
    return stop

async def _get_stop(db: AsyncSession, stop_id: int, owner_id: int) -> Stop:
    result = await db.execute(
        select(Stop)
        .options(selectinload(Stop.activities))
        .where(Stop.id == stop_id)
    )
    stop = result.scalar_one_or_none()
    if stop is None:
        raise HTTPException(status_code=404, detail="Stop not found")
    
    result_trip = await db.execute(select(Trip).where(Trip.id == stop.trip_id))
    trip = result_trip.scalar_one()
    if trip.owner_id != owner_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return stop

async def update_stop(db: AsyncSession, stop_id: int, owner_id: int, data: StopUpdate) -> Stop:
    stop = await _get_stop(db, stop_id, owner_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(stop, field, value)
    await db.flush()
    await db.refresh(stop, ["activities"])
    return stop

async def delete_stop(db: AsyncSession, stop_id: int, owner_id: int) -> None:
    stop = await _get_stop(db, stop_id, owner_id)
    await db.delete(stop)
    await db.flush()

async def reorder_stops(db: AsyncSession, trip_id: int, owner_id: int, data: StopReorder) -> list[Stop]:
    await get_trip(db, trip_id, owner_id)
    
    for idx, stop_id in enumerate(data.stop_ids):
        result = await db.execute(
            select(Stop).where(Stop.id == stop_id, Stop.trip_id == trip_id)
        )
        stop = result.scalar_one_or_none()
        if stop is None:
            raise HTTPException(status_code=404, detail=f"Stop {stop_id} not found")
        stop.order = idx
    await db.flush()

    result = await db.execute(
        select(Stop)
        .options(selectinload(Stop.activities))
        .where(Stop.trip_id == trip_id)
        .order_by(Stop.order)
    )
    return list(result.scalars().all())


# ── Activity CRUD ────────────────────────────────────────────────────────

async def add_activity(db: AsyncSession, stop_id: int, owner_id: int, data: TripActivityCreate) -> TripActivity:
    await _get_stop(db, stop_id, owner_id)
    activity = TripActivity(stop_id=stop_id, **data.model_dump())
    db.add(activity)
    await db.flush()
    await db.refresh(activity)
    return activity

async def _get_activity(db: AsyncSession, activity_id: int, owner_id: int) -> TripActivity:
    result = await db.execute(select(TripActivity).where(TripActivity.id == activity_id))
    activity = result.scalar_one_or_none()
    if activity is None:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    await _get_stop(db, activity.stop_id, owner_id)
    return activity

async def update_activity(db: AsyncSession, activity_id: int, owner_id: int, data: TripActivityUpdate) -> TripActivity:
    activity = await _get_activity(db, activity_id, owner_id)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)
    await db.flush()
    await db.refresh(activity)
    return activity

async def delete_activity(db: AsyncSession, activity_id: int, owner_id: int) -> None:
    activity = await _get_activity(db, activity_id, owner_id)
    await db.delete(activity)
    await db.flush()


# ── Budget ───────────────────────────────────────────────────────────────

async def get_budget_summary(db: AsyncSession, trip_id: int, owner_id: int) -> BudgetSummary:
    trip = await get_trip(db, trip_id, owner_id)
    
    all_activities: list[TripActivity] = []
    for stop in trip.stops:
        all_activities.extend(stop.activities)

    total = sum(a.estimated_cost for a in all_activities)

    cat_totals: dict[str, float] = defaultdict(float)
    for a in all_activities:
        cat_totals[a.cost_category] += a.estimated_cost

    breakdown = [
        BudgetBreakdown(
            category=cat,
            total=round(amt, 2),
            percentage=round((amt / total * 100) if total > 0 else 0, 1),
        )
        for cat, amt in sorted(cat_totals.items())
    ]

    daily: dict[int, float] = defaultdict(float)
    for a in all_activities:
        daily[a.day_number] += a.estimated_cost
    daily_costs = [{"day": d, "cost": round(c, 2)} for d, c in sorted(daily.items())]

    total_days = 1
    if trip.start_date and trip.end_date:
        total_days = (trip.end_date - trip.start_date).days + 1
        if total_days < 1:
            total_days = 1

    avg_per_day = round(total / total_days, 2)
    remaining = round(trip.budget_limit - total, 2)

    return BudgetSummary(
        trip_id=trip.id,
        trip_name=trip.name,
        budget_limit=trip.budget_limit,
        total_estimated=round(total, 2),
        remaining=remaining,
        is_over_budget=total > trip.budget_limit,
        average_per_day=avg_per_day,
        breakdown=breakdown,
        daily_costs=daily_costs,
    )
