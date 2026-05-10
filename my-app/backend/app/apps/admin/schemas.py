"""Admin analytics schemas."""

from pydantic import BaseModel


class AdminDashboard(BaseModel):
    total_users: int
    total_trips: int
    active_users: int  # users with at least one trip
    top_cities: list[dict]
    trips_per_month: list[dict]
    recent_users: list[dict]
