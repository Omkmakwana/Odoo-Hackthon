"""City and Activity Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


# ── City ─────────────────────────────────────────────────────────────────


class CityCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    country: str = Field(min_length=1, max_length=100)
    region: str = ""
    description: str = ""
    image_url: str | None = None
    cost_index: int = Field(ge=1, le=5, default=2)
    popularity: int = Field(ge=0, le=100, default=50)
    latitude: float | None = None
    longitude: float | None = None


class CityOut(BaseModel):
    id: int
    name: str
    country: str
    region: str
    description: str
    image_url: str | None
    cost_index: int
    popularity: int
    latitude: float | None
    longitude: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Activity ─────────────────────────────────────────────────────────────


class ActivityCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    city_id: int | None = None
    category: str = "sightseeing"
    description: str = ""
    image_url: str | None = None
    estimated_cost: float = Field(ge=0, default=0.0)
    duration_minutes: int = Field(ge=1, default=60)


class ActivityOut(BaseModel):
    id: int
    name: str
    city_id: int | None
    category: str
    description: str
    image_url: str | None
    estimated_cost: float
    duration_minutes: int
    created_at: datetime

    model_config = {"from_attributes": True}
