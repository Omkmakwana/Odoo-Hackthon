"""Note service layer."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.apps.notes.models import Note
from app.apps.notes.schemas import NoteCreate, NoteUpdate
from app.core.exceptions import ForbiddenError, NotFoundError


async def list_notes(
    db: AsyncSession,
    user_id: int,
    trip_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
) -> list[Note]:
    stmt = select(Note).where(Note.user_id == user_id)
    if trip_id is not None:
        stmt = stmt.where(Note.trip_id == trip_id)
    stmt = stmt.order_by(Note.updated_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_note(db: AsyncSession, note_id: int) -> Note:
    result = await db.execute(select(Note).where(Note.id == note_id))
    note = result.scalar_one_or_none()
    if note is None:
        raise NotFoundError("Note", note_id)
    return note


def assert_note_owner(note: Note, user_id: int) -> None:
    if note.user_id != user_id:
        raise ForbiddenError("You do not own this note")


async def create_note(db: AsyncSession, user_id: int, data: NoteCreate) -> Note:
    note = Note(user_id=user_id, **data.model_dump())
    db.add(note)
    await db.flush()
    await db.refresh(note)
    return note


async def update_note(db: AsyncSession, note: Note, data: NoteUpdate) -> Note:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)
    await db.flush()
    await db.refresh(note)
    return note


async def delete_note(db: AsyncSession, note: Note) -> None:
    await db.delete(note)
    await db.flush()
