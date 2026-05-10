"""Community service — shared trips feed and copy functionality."""

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.apps.community.models import TripCopy
from app.apps.community.schemas import SharedTripOut
from app.apps.trips.models import Stop, Trip, TripActivity
from app.core.exceptions import BadRequestError, NotFoundError


async def get_public_trips(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20,
) -> list[SharedTripOut]:
    """List publicly shared trips for the community feed."""
    result = await db.execute(
        select(Trip)
        .options(selectinload(Trip.owner), selectinload(Trip.stops))
        .where(Trip.is_public == True)  # noqa: E712
        .order_by(Trip.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    trips = result.scalars().all()
    out: list[SharedTripOut] = []
    for t in trips:
        out.append(
            SharedTripOut(
                id=t.id,
                name=t.name,
                description=t.description,
                cover_url=t.cover_url,
                owner_name=t.owner.full_name if t.owner else "Unknown",
                stop_count=len(t.stops),
                public_slug=t.public_slug,
                created_at=t.created_at,
            )
        )
    return out


async def copy_trip(db: AsyncSession, source_trip_id: int, user_id: int) -> Trip:
    """Deep-copy a shared trip into the user's own trips."""
    # Get source
    result = await db.execute(
        select(Trip)
        .options(selectinload(Trip.stops).selectinload(Stop.activities))
        .where(Trip.id == source_trip_id, Trip.is_public == True)  # noqa: E712
    )
    source = result.scalar_one_or_none()
    if source is None:
        raise NotFoundError("Trip", source_trip_id)

    if source.owner_id == user_id:
        raise BadRequestError("You cannot copy your own trip")

    # Create copy
    new_trip = Trip(
        owner_id=user_id,
        name=f"{source.name} (Copy)",
        description=source.description,
        cover_url=source.cover_url,
        start_date=source.start_date,
        end_date=source.end_date,
        budget_limit=source.budget_limit,
        status="draft",
        is_public=False,
    )
    db.add(new_trip)
    await db.flush()

    # Copy stops and activities
    for stop in source.stops:
        new_stop = Stop(
            trip_id=new_trip.id,
            city_id=stop.city_id,
            city_name=stop.city_name,
            country=stop.country,
            arrival_date=stop.arrival_date,
            departure_date=stop.departure_date,
            order=stop.order,
        )
        db.add(new_stop)
        await db.flush()

        for act in stop.activities:
            new_act = TripActivity(
                stop_id=new_stop.id,
                activity_id=act.activity_id,
                name=act.name,
                description=act.description,
                day_number=act.day_number,
                time_slot=act.time_slot,
                duration_minutes=act.duration_minutes,
                estimated_cost=act.estimated_cost,
                cost_category=act.cost_category,
            )
            db.add(new_act)

    # Record the copy
    copy_record = TripCopy(
        source_trip_id=source.id,
        copied_by_user_id=user_id,
        copied_trip_id=new_trip.id,
    )
    db.add(copy_record)
    await db.flush()
    await db.refresh(new_trip, ["stops"])
    return new_trip
