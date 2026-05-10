"""Legacy routes module — kept for backwards compatibility.

All routes are now organized in app.apps.*.router modules
and registered directly in app.main.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def api_health() -> dict[str, str]:
    return {"status": "ok"}
