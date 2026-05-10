"""Trip, Stop, and Activity SQLAlchemy models."""

from datetime import date, datetime, timezone

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    owner_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    cover_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="draft")  # draft | upcoming | active | completed
    is_public: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    public_slug: Mapped[str | None] = mapped_column(String(80), unique=True, nullable=True, index=True)
    budget_limit: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    owner = relationship("User", back_populates="trips", lazy="selectin")
    stops = relationship("Stop", back_populates="trip", cascade="all, delete-orphan", lazy="selectin", order_by="Stop.order")
    notes = relationship("Note", back_populates="trip", cascade="all, delete-orphan", lazy="selectin")
    checklist_items = relationship("ChecklistItem", back_populates="trip", cascade="all, delete-orphan", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Trip id={self.id} name={self.name!r}>"


class Stop(Base):
    """A city stop within a trip itinerary."""
    __tablename__ = "stops"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    trip_id: Mapped[int] = mapped_column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    city_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("cities.id", ondelete="SET NULL"), nullable=True)
    city_name: Mapped[str] = mapped_column(String(150), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    arrival_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    departure_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    trip = relationship("Trip", back_populates="stops", lazy="selectin")
    city = relationship("City", lazy="selectin")
    activities = relationship("TripActivity", back_populates="stop", cascade="all, delete-orphan", lazy="selectin", order_by="TripActivity.time_slot")

    def __repr__(self) -> str:
        return f"<Stop id={self.id} city={self.city_name!r}>"


class TripActivity(Base):
    """An activity within a stop."""
    __tablename__ = "trip_activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    stop_id: Mapped[int] = mapped_column(Integer, ForeignKey("stops.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("activities.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    day_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    time_slot: Mapped[str] = mapped_column(String(20), nullable=False, default="09:00")  # HH:MM
    duration_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=60)
    estimated_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    cost_category: Mapped[str] = mapped_column(String(30), nullable=False, default="activity")  # transport | stay | activity | meal
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    stop = relationship("Stop", back_populates="activities", lazy="selectin")
    activity_ref = relationship("Activity", lazy="selectin")

    def __repr__(self) -> str:
        return f"<TripActivity id={self.id} name={self.name!r}>"
