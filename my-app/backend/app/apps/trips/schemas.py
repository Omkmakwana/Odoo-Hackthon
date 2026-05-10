"""Trip, Stop, and Activity Pydantic schemas."""

from datetime import date, datetime

from pydantic import BaseModel, Field


# ── Trip ─────────────────────────────────────────────────────────────────


class TripCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = ""
    cover_url: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    budget_limit: float = 0.0


class TripUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    cover_url: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    status: str | None = None
    is_public: bool | None = None
    budget_limit: float | None = None


class TripActivityOut(BaseModel):
    id: int
    stop_id: int
    activity_id: int | None
    name: str
    description: str
    day_number: int
    time_slot: str
    duration_minutes: int
    estimated_cost: float
    cost_category: str
    created_at: datetime

    model_config = {"from_attributes": True}


class StopOut(BaseModel):
    id: int
    trip_id: int
    city_id: int | None
    city_name: str
    country: str
    arrival_date: date | None
    departure_date: date | None
    order: int
    activities: list[TripActivityOut] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class TripOut(BaseModel):
    id: int
    owner_id: int
    name: str
    description: str
    cover_url: str | None
    start_date: date | None
    end_date: date | None
    status: str
    is_public: bool
    public_slug: str | None
    budget_limit: float
    stops: list[StopOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TripListOut(BaseModel):
    """Lightweight trip representation for list views."""
    id: int
    name: str
    cover_url: str | None
    start_date: date | None
    end_date: date | None
    status: str
    is_public: bool
    stop_count: int = 0
    total_cost: float = 0.0
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Stop ─────────────────────────────────────────────────────────────────


class StopCreate(BaseModel):
    city_id: int | None = None
    city_name: str = Field(min_length=1, max_length=150)
    country: str = ""
    arrival_date: date | None = None
    departure_date: date | None = None
    order: int = 0


class StopUpdate(BaseModel):
    city_name: str | None = Field(None, min_length=1, max_length=150)
    country: str | None = None
    arrival_date: date | None = None
    departure_date: date | None = None
    order: int | None = None


class StopReorder(BaseModel):
    """Batch reorder stops."""
    stop_ids: list[int]


# ── Activity ─────────────────────────────────────────────────────────────


class TripActivityCreate(BaseModel):
    activity_id: int | None = None
    name: str = Field(min_length=1, max_length=200)
    description: str = ""
    day_number: int = Field(ge=1, default=1)
    time_slot: str = "09:00"
    duration_minutes: int = Field(ge=1, default=60)
    estimated_cost: float = Field(ge=0, default=0.0)
    cost_category: str = "activity"


class TripActivityUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = None
    day_number: int | None = Field(None, ge=1)
    time_slot: str | None = None
    duration_minutes: int | None = Field(None, ge=1)
    estimated_cost: float | None = Field(None, ge=0)
    cost_category: str | None = None


# ── Budget ───────────────────────────────────────────────────────────────


class BudgetBreakdown(BaseModel):
    category: str
    total: float
    percentage: float


class BudgetSummary(BaseModel):
    trip_id: int
    trip_name: str
    budget_limit: float
    total_estimated: float
    remaining: float
    is_over_budget: bool
    average_per_day: float
    breakdown: list[BudgetBreakdown]
    daily_costs: list[dict]
