"""Checklist API routes."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.apps.checklist import service
from app.apps.checklist.schemas import ChecklistItemCreate, ChecklistItemOut, ChecklistItemUpdate, ChecklistSummary
from app.core.database import get_db
from app.core.dependencies import get_current_user

router = APIRouter()


@router.get("/trips/{trip_id}/checklist", response_model=ChecklistSummary)
async def get_checklist(
    trip_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the packing checklist for a trip with progress stats."""
    return await service.get_checklist_for_trip(db, current_user.id, trip_id)


@router.post("/checklist", response_model=ChecklistItemOut, status_code=status.HTTP_201_CREATED)
async def add_item(
    body: ChecklistItemCreate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Add an item to a trip's checklist."""
    return await service.add_item(db, current_user.id, body)


@router.patch("/checklist/{item_id}", response_model=ChecklistItemOut)
async def update_item(
    item_id: int,
    body: ChecklistItemUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a checklist item (label, category, or packed status)."""
    item = await service.get_item(db, item_id)
    service.assert_item_owner(item, current_user.id)
    return await service.update_item(db, item, body)


@router.delete("/checklist/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a checklist item."""
    item = await service.get_item(db, item_id)
    service.assert_item_owner(item, current_user.id)
    await service.delete_item(db, item)


@router.post("/trips/{trip_id}/checklist/reset", status_code=status.HTTP_204_NO_CONTENT)
async def reset_checklist(
    trip_id: int,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Reset all checklist items for a trip to unpacked."""
    await service.reset_checklist(db, current_user.id, trip_id)
