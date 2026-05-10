"""Checklist Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class ChecklistItemCreate(BaseModel):
    trip_id: int
    label: str = Field(min_length=1, max_length=200)
    category: str = "other"


class ChecklistItemUpdate(BaseModel):
    label: str | None = Field(None, min_length=1, max_length=200)
    category: str | None = None
    is_packed: bool | None = None


class ChecklistItemOut(BaseModel):
    id: int
    user_id: int
    trip_id: int
    label: str
    category: str
    is_packed: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ChecklistSummary(BaseModel):
    trip_id: int
    total: int
    packed: int
    percentage: float
    items: list[ChecklistItemOut]
