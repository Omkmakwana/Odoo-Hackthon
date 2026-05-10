"""Structured application exceptions with automatic HTTP mapping."""

from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base application exception."""
    pass


class NotFoundError(AppException):
    def __init__(self, resource: str = "Resource", resource_id: int | str | None = None):
        detail = f"{resource} not found" + (f" (id={resource_id})" if resource_id else "")
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class AlreadyExistsError(AppException):
    def __init__(self, resource: str = "Resource", field: str = ""):
        detail = f"{resource} already exists" + (f" ({field})" if field else "")
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class BadRequestError(AppException):
    def __init__(self, detail: str = "Bad request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class ForbiddenError(AppException):
    def __init__(self, detail: str = "Forbidden"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class UnauthorizedError(AppException):
    def __init__(self, detail: str = "Not authenticated"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )
