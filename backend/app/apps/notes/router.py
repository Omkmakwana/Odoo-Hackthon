"""Notes API routes."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.apps.notes import service
from app.apps.notes.schemas import NoteCreate, NoteOut, NoteUpdate
from app.core.database import get_db
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/notes", response_model=list[NoteOut])
async def list_notes(
    trip_id: int | None = None,
    skip: int = 0,
    limit: int = 50,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List notes for the authenticated user, optionally filtered by trip."""
    return await service.list_notes(db, current_user.id, trip_id, skip, limit)


@router.get("/notes/{note_id}", response_model=NoteOut)
async def get_note(
    note_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single note."""
    note = await service.get_note(db, note_id)
    service.assert_note_owner(note, current_user.id)
    return note


@router.post("/notes", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(
    body: NoteCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new note tied to a trip."""
    return await service.create_note(db, current_user.id, body)


@router.patch("/notes/{note_id}", response_model=NoteOut)
async def update_note(
    note_id: int,
    body: NoteUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a note."""
    note = await service.get_note(db, note_id)
    service.assert_note_owner(note, current_user.id)
    return await service.update_note(db, note, body)


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a note."""
    note = await service.get_note(db, note_id)
    service.assert_note_owner(note, current_user.id)
    await service.delete_note(db, note)
