"""Community Pydantic schemas."""

from datetime import date, datetime

from pydantic import BaseModel


class SharedTripOut(BaseModel):
    """Lightweight shared trip for the community feed."""
    id: int
    name: str
    description: str
    cover_url: str | None
    owner_name: str
    stop_count: int
    public_slug: str | None
    created_at: datetime


class PublicActivityOut(BaseModel):
    name: str
    description: str
    day_number: int
    time_slot: str
    duration_minutes: int
    estimated_cost: float
    cost_category: str

    model_config = {"from_attributes": True}


class PublicStopOut(BaseModel):
    city_name: str
    country: str
    arrival_date: date | None
    departure_date: date | None
    order: int
    activities: list[PublicActivityOut] = []

    model_config = {"from_attributes": True}


class SharedTripDetailOut(BaseModel):
    """Full public trip detail for the shared itinerary view."""
    id: int
    name: str
    description: str
    cover_url: str | None
    owner_name: str
    start_date: date | None
    end_date: date | None
    budget_limit: float
    total_cost: float
    stop_count: int
    public_slug: str | None
    stops: list[PublicStopOut] = []
    created_at: datetime


class TripCopyOut(BaseModel):
    id: int
    source_trip_id: int
    copied_by_user_id: int
    copied_trip_id: int | None
    created_at: datetime

    model_config = {"from_attributes": True}

