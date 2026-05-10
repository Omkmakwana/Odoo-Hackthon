"""Community (shared itineraries) model — tracks trip copies."""

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class TripCopy(Base):
    """Tracks when a user copies a shared trip to their own account."""
    __tablename__ = "trip_copies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    source_trip_id: Mapped[int] = mapped_column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    copied_by_user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    copied_trip_id: Mapped[int] = mapped_column(Integer, ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self) -> str:
        return f"<TripCopy source={self.source_trip_id} copied_by={self.copied_by_user_id}>"
