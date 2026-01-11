"""
Authentication module for JWT verification.

Uses Pattern A (Shared Secret HS256) for stateless JWT verification.

Skill Reference: configuring-better-auth/references/fastapi-jwt-integration.md
Agent Reference: @backend-security-coder
"""

from .jwt import verify_token
from .dependencies import get_current_user, validate_user_access

__all__ = ["verify_token", "get_current_user", "validate_user_access"]
