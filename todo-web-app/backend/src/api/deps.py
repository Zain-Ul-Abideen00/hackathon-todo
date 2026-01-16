"""
API Dependencies Module.

This module contains FastAPI dependency functions for:
- Database session management (re-exported from db.dependencies)
- Authentication/authorization (JWT verification via src.auth)
- Rate limiting (100 req/min per user per FR-016)
- User access verification
"""

from typing import Annotated

from fastapi import Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlmodel.ext.asyncio.session import AsyncSession

from src.auth.dependencies import get_current_user, validate_user_access
from src.auth.jwt import verify_token
from src.db.dependencies import get_session as db_get_session

# Re-export get_session from db.dependencies
get_session = db_get_session


# Rate limiter - key by user_id or IP address
def get_user_identifier(request: Request) -> str:
    """Get user identifier for rate limiting.

    Uses Authorization header user_id if available, otherwise falls back to IP.
    """
    # TODO: Extract user_id from JWT when available
    return get_remote_address(request)


limiter = Limiter(key_func=get_user_identifier)


# Type aliases for cleaner route definitions
CurrentUser = Annotated[dict, Depends(get_current_user)]
DBSession = Annotated[AsyncSession, Depends(get_session)]


# Re-export auth functions for use in routes
__all__ = [
    "get_session",
    "get_current_user",
    "validate_user_access",
    "verify_token",
    "limiter",
    "CurrentUser",
    "DBSession",
]
