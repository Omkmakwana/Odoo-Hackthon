"""User & Auth API routes."""

from fastapi import APIRouter, Depends, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.apps.users import service
from app.apps.users.schemas import (
    PasswordChange,
    RefreshRequest,
    TokenResponse,
    UserLogin,
    UserOut,
    UserRegister,
    UserUpdate,
)
from app.core.database import get_db
from app.core.dependencies import get_current_admin, get_current_user
from app.core.exceptions import UnauthorizedError
from app.core.security import create_access_token, create_refresh_token, decode_token

router = APIRouter()


# ── Auth endpoints ───────────────────────────────────────────────────────


@router.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: UserRegister, db: AsyncSession = Depends(get_db)):
    """Create a new user account and return JWT tokens."""
    user = await service.create_user(db, body)
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/auth/login", response_model=TokenResponse)
async def login(body: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate with email/password and return JWT tokens."""
    user = await service.authenticate_user(db, body.email, body.password)
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_tokens(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a valid refresh token for new access + refresh tokens."""
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid token type")
        user_id = payload.get("sub")
    except JWTError:
        raise UnauthorizedError("Invalid or expired refresh token")

    user = await service.get_user_by_id(db, int(user_id))
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


# ── Profile endpoints ───────────────────────────────────────────────────


@router.get("/users/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user)):
    """Return the authenticated user's profile."""
    return current_user


@router.patch("/users/me", response_model=UserOut)
async def update_me(
    body: UserUpdate,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the authenticated user's profile."""
    return await service.update_user(db, current_user, body)


@router.post("/users/me/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_my_password(
    body: PasswordChange,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Change the authenticated user's password."""
    await service.change_password(db, current_user, body.current_password, body.new_password)


@router.delete("/users/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Permanently delete the authenticated user's account."""
    await service.delete_user(db, current_user)


# ── Admin endpoints ─────────────────────────────────────────────────────


@router.get("/admin/users", response_model=list[UserOut])
async def admin_list_users(
    skip: int = 0,
    limit: int = 50,
    _admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Admin: list all users with pagination."""
    return await service.list_users(db, skip, limit)
