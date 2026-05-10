"""Admin analytics API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.apps.admin import service
from app.apps.admin.schemas import AdminDashboard
from app.core.database import get_db
from app.core.dependencies import get_current_admin

router = APIRouter()


@router.get("/admin/dashboard", response_model=AdminDashboard)
async def get_admin_dashboard(
    _admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin-only: get platform analytics dashboard data."""
    return await service.get_dashboard(db)
