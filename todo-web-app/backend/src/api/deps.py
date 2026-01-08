"""
API Dependencies Module.

This module contains FastAPI dependency functions for:
- Database session management (Module 2)
- Authentication/authorization (Module 4)
- Common request validation
"""

from typing import Annotated

from fastapi import Header  # noqa: F401 - HTTPException will be used in Module 4


async def get_api_key(x_api_key: Annotated[str | None, Header()] = None) -> str | None:
    """
    Placeholder dependency for API key validation.

    Will be replaced with proper JWT authentication in Module 4.
    """
    return x_api_key


async def verify_token(authorization: Annotated[str | None, Header()] = None) -> dict | None:
    """
    Placeholder dependency for JWT token verification.

    Will be implemented in Module 4 with Better Auth integration.

    Args:
        authorization: Bearer token from Authorization header

    Returns:
        Decoded token payload or None if not authenticated

    Raises:
        HTTPException: 401 if token is invalid (after Module 4 implementation)
    """
    if authorization is None:
        return None

    # TODO: Implement JWT verification in Module 4
    # from src.auth.jwt import decode_jwt
    # return decode_jwt(authorization.replace("Bearer ", ""))

    return {"user_id": "placeholder", "email": "placeholder@example.com"}
