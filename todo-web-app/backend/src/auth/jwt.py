"""
JWT verification module using python-jose with HS256 shared secret.

Pattern A: Shared Secret (HS256) - "The Easiest Path"
- Zero network calls from IDP
- Single env var (BETTER_AUTH_SECRET)
- Extremely fast verification

Skill Reference: configuring-better-auth/references/fastapi-jwt-integration.md
Agent Reference: @backend-security-coder
"""

import os
from typing import Any

from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

# HTTPBearer extracts token from Authorization: Bearer <token> header
security = HTTPBearer()

# MUST match the frontend BETTER_AUTH_SECRET
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"


def decode_token_string(token: str) -> dict[str, Any]:
    """
    Verify and decode a raw JWT token string.

    Use this function for direct token verification outside of FastAPI
    dependency injection (e.g., in optional auth scenarios).

    Args:
        token: Raw JWT token string (without "Bearer " prefix)

    Returns:
        dict: Decoded JWT payload containing user claims

    Raises:
        ValueError: If token is invalid or BETTER_AUTH_SECRET not configured
    """
    if not SECRET_KEY:
        raise ValueError("BETTER_AUTH_SECRET not configured")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        if not payload.get("sub"):
            raise ValueError("Token missing subject claim")

        return payload
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")


def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> dict[str, Any]:
    """
    Verify JWT token from Authorization header (FastAPI Dependency).

    This happens locally (CPU only), no network call needed.
    Stateless verification using shared secret.

    Args:
        credentials: HTTP Bearer credentials extracted from header

    Returns:
        dict: Decoded JWT payload containing user claims

    Raises:
        HTTPException: 401 if token is invalid, expired, or missing claims
    """
    if not SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="Authentication not configured: BETTER_AUTH_SECRET missing",
        )

    token = credentials.credentials

    try:
        # Verify signature using the SHARED SECRET
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        # Validate critical claims - 'sub' contains user_id
        if not payload.get("sub"):
            raise HTTPException(status_code=401, detail="Token missing subject claim")

        return payload

    except JWTError as e:
        # Log for debugging (in production, use proper logging)
        print(f"JWT Verification Failed: {e}")
        raise HTTPException(
            status_code=401, detail="Invalid authentication credentials"
        )
