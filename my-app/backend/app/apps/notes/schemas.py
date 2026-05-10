"""Note Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class NoteCreate(BaseModel):
    trip_id: int
    stop_id: int | None = None
    title: str = Field(min_length=1, max_length=200)
    body: str = ""


class NoteUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    body: str | None = None
    stop_id: int | None = None


class NoteOut(BaseModel):
    id: int
    user_id: int
    trip_id: int
    stop_id: int | None
    title: str
    body: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
