"""Checklist service layer."""

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.apps.checklist.models import ChecklistItem
from app.apps.checklist.schemas import ChecklistItemCreate, ChecklistItemUpdate, ChecklistSummary
from app.core.exceptions import ForbiddenError, NotFoundError


async def get_checklist_for_trip(db: AsyncSession, user_id: int, trip_id: int) -> ChecklistSummary:
    result = await db.execute(
        select(ChecklistItem)
        .where(ChecklistItem.user_id == user_id, ChecklistItem.trip_id == trip_id)
        .order_by(ChecklistItem.category, ChecklistItem.created_at)
    )
    items = list(result.scalars().all())
    packed = sum(1 for i in items if i.is_packed)
    total = len(items)
    return ChecklistSummary(
        trip_id=trip_id,
        total=total,
        packed=packed,
        percentage=round((packed / total * 100) if total > 0 else 0, 1),
        items=items,
    )


async def add_item(db: AsyncSession, user_id: int, data: ChecklistItemCreate) -> ChecklistItem:
    item = ChecklistItem(user_id=user_id, **data.model_dump())
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return item


async def get_item(db: AsyncSession, item_id: int) -> ChecklistItem:
    result = await db.execute(select(ChecklistItem).where(ChecklistItem.id == item_id))
    item = result.scalar_one_or_none()
    if item is None:
        raise NotFoundError("ChecklistItem", item_id)
    return item


def assert_item_owner(item: ChecklistItem, user_id: int) -> None:
    if item.user_id != user_id:
        raise ForbiddenError("You do not own this checklist item")


async def update_item(db: AsyncSession, item: ChecklistItem, data: ChecklistItemUpdate) -> ChecklistItem:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    await db.flush()
    await db.refresh(item)
    return item


async def delete_item(db: AsyncSession, item: ChecklistItem) -> None:
    await db.delete(item)
    await db.flush()


async def reset_checklist(db: AsyncSession, user_id: int, trip_id: int) -> None:
    """Un-check all items for a trip."""
    await db.execute(
        update(ChecklistItem)
        .where(ChecklistItem.user_id == user_id, ChecklistItem.trip_id == trip_id)
        .values(is_packed=False)
    )
    await db.flush()
