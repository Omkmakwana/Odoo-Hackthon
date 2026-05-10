"""Catalog service layer — cities and activities search."""

from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.apps.catalog.models import Activity, City
from app.apps.catalog.schemas import ActivityCreate, CityCreate
from app.core.exceptions import NotFoundError


# ── Cities ───────────────────────────────────────────────────────────────


async def search_cities(
    db: AsyncSession,
    query: str = "",
    region: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[City]:
    stmt = select(City)
    if query:
        pattern = f"%{query}%"
        stmt = stmt.where(
            or_(City.name.ilike(pattern), City.country.ilike(pattern))
        )
    if region:
        stmt = stmt.where(City.region == region)
    stmt = stmt.order_by(City.popularity.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_city(db: AsyncSession, city_id: int) -> City:
    result = await db.execute(select(City).where(City.id == city_id))
    city = result.scalar_one_or_none()
    if city is None:
        raise NotFoundError("City", city_id)
    return city


async def create_city(db: AsyncSession, data: CityCreate) -> City:
    city = City(**data.model_dump())
    db.add(city)
    await db.flush()
    await db.refresh(city)
    return city


# ── Activities ───────────────────────────────────────────────────────────


async def search_activities(
    db: AsyncSession,
    query: str = "",
    city_id: int | None = None,
    category: str | None = None,
    max_cost: float | None = None,
    max_duration: int | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Activity]:
    stmt = select(Activity)
    if query:
        stmt = stmt.where(Activity.name.ilike(f"%{query}%"))
    if city_id is not None:
        stmt = stmt.where(Activity.city_id == city_id)
    if category:
        stmt = stmt.where(Activity.category == category)
    if max_cost is not None:
        stmt = stmt.where(Activity.estimated_cost <= max_cost)
    if max_duration is not None:
        stmt = stmt.where(Activity.duration_minutes <= max_duration)
    stmt = stmt.order_by(Activity.name).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_activity(db: AsyncSession, activity_id: int) -> Activity:
    result = await db.execute(select(Activity).where(Activity.id == activity_id))
    activity = result.scalar_one_or_none()
    if activity is None:
        raise NotFoundError("Activity", activity_id)
    return activity


async def create_activity(db: AsyncSession, data: ActivityCreate) -> Activity:
    activity = Activity(**data.model_dump())
    db.add(activity)
    await db.flush()
    await db.refresh(activity)
    return activity
