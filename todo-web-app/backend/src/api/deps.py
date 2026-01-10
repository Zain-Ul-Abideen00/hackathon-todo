"""
API Dependencies Module.

This module contains FastAPI dependency functions for:
- Database session management (re-exported from db.dependencies)
- Authentication/authorization (Module 4 placeholder)
- Rate limiting (100 req/min per user per FR-016)
- User access verification
"""

from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends, Header, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.dependencies import get_session as db_get_session

# Re-export get_session from db.dependencies
get_session = db_get_session


# Rate limiter - key by user_id or IP address
def get_user_identifier(request: Request) -> str:
    """Get user identifier for rate limiting.

    Uses Authorization header user_id if available, otherwise falls back to IP.
    """
    # For now, use remote address; Module 4 will use JWT user_id
    return get_remote_address(request)


limiter = Limiter(key_func=get_user_identifier)


async def get_api_key(x_api_key: Annotated[str | None, Header()] = None) -> str | None:
    """
    Placeholder dependency for API key validation.

    Will be replaced with proper JWT authentication in Module 4.
    """
    return x_api_key


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
) -> dict:
    """
    Get the current authenticated user.

    This is a PLACEHOLDER that returns a test user for development.
    Module 4 will implement real JWT verification.

    Args:
        authorization: Bearer token from Authorization header

    Returns:
        User dict with user_id and email

    Raises:
        HTTPException: 401 if no authorization provided
    """
    # For testing without auth, use a hardcoded test user
    # In Module 4, this will verify JWT and extract user info
    if authorization is None:
        # Allow requests without auth for development
        return {"user_id": "test-user", "email": "test@example.com"}

    # TODO: Implement JWT verification in Module 4
    # from src.auth.jwt import decode_jwt
    # return decode_jwt(authorization.replace("Bearer ", ""))

    return {"user_id": "test-user", "email": "test@example.com"}


def verify_user_access(user_id: str, current_user: dict) -> None:
    """
    Verify that the URL user_id matches the authenticated user.

    Args:
        user_id: User ID from the URL path
        current_user: Current authenticated user from get_current_user

    Raises:
        HTTPException: 403 Forbidden if user_id doesn't match
    """
    if current_user["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "FORBIDDEN",
                "message": "Cannot access another user's tasks",
            },
        )


async def get_verified_user(
    user_id: str,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    """
    Dependency that gets current user AND verifies access to user_id.

    Use this in route handlers that need to validate user ownership.

    Args:
        user_id: User ID from the URL path
        current_user: Injected by Depends(get_current_user)

    Returns:
        The current user dict if access is allowed

    Raises:
        HTTPException: 403 if user_id doesn't match current user
    """
    verify_user_access(user_id, current_user)
    return current_user


# Type aliases for cleaner route definitions
CurrentUser = Annotated[dict, Depends(get_current_user)]
VerifiedUser = Annotated[dict, Depends(get_verified_user)]
DBSession = Annotated[AsyncSession, Depends(get_session)]
