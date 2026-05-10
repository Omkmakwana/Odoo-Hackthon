"""Admin analytics service."""

from sqlalchemy import select, func, extract, distinct
from sqlalchemy.ext.asyncio import AsyncSession

from app.apps.trips.models import Stop, Trip
from app.apps.users.models import User
from app.apps.admin.schemas import AdminDashboard


async def get_dashboard(db: AsyncSession) -> AdminDashboard:
    """Aggregate platform-wide stats for the admin dashboard."""

    # Total users
    total_users = (await db.execute(select(func.count(User.id)))).scalar_one()

    # Total trips
    total_trips = (await db.execute(select(func.count(Trip.id)))).scalar_one()

    # Active users (have at least one trip)
    active_users = (
        await db.execute(select(func.count(distinct(Trip.owner_id))))
    ).scalar_one()

    # Top cities by appearance in stops
    top_cities_result = await db.execute(
        select(Stop.city_name, func.count(Stop.id).label("count"))
        .group_by(Stop.city_name)
        .order_by(func.count(Stop.id).desc())
        .limit(10)
    )
    top_cities = [{"city": r.city_name, "count": r.count} for r in top_cities_result.all()]

    # Trips per month (last 12 months)
    trips_per_month_result = await db.execute(
        select(
            extract("year", Trip.created_at).label("year"),
            extract("month", Trip.created_at).label("month"),
            func.count(Trip.id).label("count"),
        )
        .group_by("year", "month")
        .order_by("year", "month")
        .limit(12)
    )
    trips_per_month = [
        {"year": int(r.year), "month": int(r.month), "count": r.count}
        for r in trips_per_month_result.all()
    ]

    # Recent users
    recent_users_result = await db.execute(
        select(User).order_by(User.created_at.desc()).limit(10)
    )
    recent_users = [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "created_at": u.created_at.isoformat(),
            "is_active": u.is_active,
        }
        for u in recent_users_result.scalars().all()
    ]

    return AdminDashboard(
        total_users=total_users,
        total_trips=total_trips,
        active_users=active_users,
        top_cities=top_cities,
        trips_per_month=trips_per_month,
        recent_users=recent_users,
    )
