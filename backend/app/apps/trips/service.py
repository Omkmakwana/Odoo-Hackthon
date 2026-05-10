"""Trip business logic layer."""

import secrets
from collections import defaultdict

from sqlalchemy import select, func
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
    TripListOut,
    TripUpdate,
)
from app.core.exceptions import BadRequestError, ForbiddenError, NotFoundError


# ── Trip CRUD ────────────────────────────────────────────────────────────


async def create_trip(db: AsyncSession, owner_id: int, data: TripCreate) -> Trip:
    trip = Trip(owner_id=owner_id, **data.model_dump())
    trip.public_slug = secrets.token_urlsafe(12)
    db.add(trip)
    await db.flush()
    await db.refresh(trip, ["stops"])
    return trip


async def get_trip(db: AsyncSession, trip_id: int) -> Trip:
    result = await db.execute(
        select(Trip)
        .options(selectinload(Trip.stops).selectinload(Stop.activities))
        .where(Trip.id == trip_id)
    )
    trip = result.scalar_one_or_none()
    if trip is None:
        raise NotFoundError("Trip", trip_id)
    return trip


async def get_trip_by_slug(db: AsyncSession, slug: str) -> Trip:
    result = await db.execute(
        select(Trip)
        .options(selectinload(Trip.stops).selectinload(Stop.activities))
        .where(Trip.public_slug == slug, Trip.is_public == True)  # noqa: E712
    )
    trip = result.scalar_one_or_none()
    if trip is None:
        raise NotFoundError("Trip")
    return trip


async def list_user_trips(
    db: AsyncSession,
    owner_id: int,
    status_filter: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[TripListOut]:
    query = (
        select(Trip)
        .options(selectinload(Trip.stops).selectinload(Stop.activities))
        .where(Trip.owner_id == owner_id)
    )
    if status_filter:
        query = query.where(Trip.status == status_filter)
    query = query.order_by(Trip.created_at.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    trips = result.scalars().all()

    out: list[TripListOut] = []
    for t in trips:
        total_cost = sum(a.estimated_cost for s in t.stops for a in s.activities)
        out.append(
            TripListOut(
                id=t.id,
                name=t.name,
                cover_url=t.cover_url,
                start_date=t.start_date,
                end_date=t.end_date,
                status=t.status,
                is_public=t.is_public,
                stop_count=len(t.stops),
                total_cost=round(total_cost, 2),
                created_at=t.created_at,
            )
        )
    return out


async def update_trip(db: AsyncSession, trip: Trip, data: TripUpdate) -> Trip:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(trip, field, value)
    await db.flush()
    await db.refresh(trip, ["stops"])
    return trip


async def delete_trip(db: AsyncSession, trip: Trip) -> None:
    await db.delete(trip)
    await db.flush()


def assert_trip_owner(trip: Trip, user_id: int) -> None:
    if trip.owner_id != user_id:
        raise ForbiddenError("You do not own this trip")


# ── Stop CRUD ────────────────────────────────────────────────────────────


async def add_stop(db: AsyncSession, trip_id: int, data: StopCreate) -> Stop:
    stop = Stop(trip_id=trip_id, **data.model_dump())
    db.add(stop)
    await db.flush()
    await db.refresh(stop, ["activities"])
    return stop


async def get_stop(db: AsyncSession, stop_id: int) -> Stop:
    result = await db.execute(
        select(Stop).options(selectinload(Stop.activities)).where(Stop.id == stop_id)
    )
    stop = result.scalar_one_or_none()
    if stop is None:
        raise NotFoundError("Stop", stop_id)
    return stop


async def update_stop(db: AsyncSession, stop: Stop, data: StopUpdate) -> Stop:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(stop, field, value)
    await db.flush()
    await db.refresh(stop, ["activities"])
    return stop


async def reorder_stops(db: AsyncSession, trip_id: int, data: StopReorder) -> list[Stop]:
    for idx, stop_id in enumerate(data.stop_ids):
        result = await db.execute(
            select(Stop).where(Stop.id == stop_id, Stop.trip_id == trip_id)
        )
        stop = result.scalar_one_or_none()
        if stop is None:
            raise NotFoundError("Stop", stop_id)
        stop.order = idx
    await db.flush()

    result = await db.execute(
        select(Stop)
        .options(selectinload(Stop.activities))
        .where(Stop.trip_id == trip_id)
        .order_by(Stop.order)
    )
    return list(result.scalars().all())


async def delete_stop(db: AsyncSession, stop: Stop) -> None:
    await db.delete(stop)
    await db.flush()


# ── Activity CRUD ────────────────────────────────────────────────────────


async def add_activity(db: AsyncSession, stop_id: int, data: TripActivityCreate) -> TripActivity:
    activity = TripActivity(stop_id=stop_id, **data.model_dump())
    db.add(activity)
    await db.flush()
    await db.refresh(activity)
    return activity


async def get_activity(db: AsyncSession, activity_id: int) -> TripActivity:
    result = await db.execute(select(TripActivity).where(TripActivity.id == activity_id))
    activity = result.scalar_one_or_none()
    if activity is None:
        raise NotFoundError("Activity", activity_id)
    return activity


async def update_activity(db: AsyncSession, activity: TripActivity, data: TripActivityUpdate) -> TripActivity:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)
    await db.flush()
    await db.refresh(activity)
    return activity


async def delete_activity(db: AsyncSession, activity: TripActivity) -> None:
    await db.delete(activity)
    await db.flush()


# ── Budget ───────────────────────────────────────────────────────────────


async def get_budget_summary(db: AsyncSession, trip: Trip) -> BudgetSummary:
    """Compute budget breakdown for a trip."""
    all_activities: list[TripActivity] = []
    for stop in trip.stops:
        all_activities.extend(stop.activities)

    total = sum(a.estimated_cost for a in all_activities)

    # By category
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

    # Daily costs
    daily: dict[int, float] = defaultdict(float)
    for a in all_activities:
        daily[a.day_number] += a.estimated_cost
    daily_costs = [{"day": d, "cost": round(c, 2)} for d, c in sorted(daily.items())]

    # Duration
    num_days = max((d["day"] for d in daily_costs), default=1) if daily_costs else 1
    avg_per_day = round(total / num_days, 2) if num_days > 0 else 0.0

    remaining = round(trip.budget_limit - total, 2) if trip.budget_limit > 0 else 0.0

    return BudgetSummary(
        trip_id=trip.id,
        trip_name=trip.name,
        budget_limit=trip.budget_limit,
        total_estimated=round(total, 2),
        remaining=remaining,
        is_over_budget=total > trip.budget_limit > 0,
        average_per_day=avg_per_day,
        breakdown=breakdown,
        daily_costs=daily_costs,
    )


# ── Admin stats ──────────────────────────────────────────────────────────


async def count_trips(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(Trip.id)))
    return result.scalar_one()


async def top_cities(db: AsyncSession, limit: int = 10) -> list[dict]:
    result = await db.execute(
        select(Stop.city_name, func.count(Stop.id).label("trip_count"))
        .group_by(Stop.city_name)
        .order_by(func.count(Stop.id).desc())
        .limit(limit)
    )
    return [{"city": row.city_name, "trip_count": row.trip_count} for row in result.all()]
