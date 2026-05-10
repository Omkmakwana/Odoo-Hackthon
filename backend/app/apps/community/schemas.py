"""Community Pydantic schemas."""

from datetime import datetime

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


class TripCopyOut(BaseModel):
    id: int
    source_trip_id: int
    copied_by_user_id: int
    copied_trip_id: int | None
    created_at: datetime

    model_config = {"from_attributes": True}
