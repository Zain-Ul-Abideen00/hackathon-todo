"""
Tests for JWT authentication module.

Covers:
- T011: JWT verification tests
- Valid token verification
- Expired token handling
- Invalid signature handling
- Missing token handling
- User ID mismatch (403)
"""

import os
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from jose import jwt

# Set test secret before importing auth modules
os.environ["BETTER_AUTH_SECRET"] = "test-secret-key-at-least-32-characters-long"

from src.auth.jwt import ALGORITHM, SECRET_KEY, verify_token
from src.auth.dependencies import get_current_user, validate_user_access


class TestJWTVerification:
    """Tests for JWT token verification."""

    @pytest.fixture
    def valid_payload(self) -> dict:
        """Create a valid JWT payload."""
        return {
            "sub": "test-user-123",
            "email": "test@example.com",
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(days=7),
        }

    @pytest.fixture
    def valid_token(self, valid_payload: dict) -> str:
        """Create a valid JWT token."""
        return jwt.encode(valid_payload, SECRET_KEY, algorithm=ALGORITHM)

    @pytest.fixture
    def expired_token(self) -> str:
        """Create an expired JWT token."""
        payload = {
            "sub": "test-user-123",
            "email": "test@example.com",
            "iat": datetime.now(timezone.utc) - timedelta(days=8),
            "exp": datetime.now(timezone.utc) - timedelta(days=1),
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    @pytest.fixture
    def token_wrong_secret(self, valid_payload: dict) -> str:
        """Create a token signed with wrong secret."""
        return jwt.encode(valid_payload, "wrong-secret-key", algorithm=ALGORITHM)

    def test_verify_valid_token(self, valid_token: str):
        """Test that a valid JWT returns the correct payload."""
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=valid_token
        )

        result = verify_token(credentials)

        assert result["sub"] == "test-user-123"
        assert result["email"] == "test@example.com"

    def test_verify_expired_token(self, expired_token: str):
        """Test that an expired JWT returns 401."""
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=expired_token
        )

        with pytest.raises(HTTPException) as exc_info:
            verify_token(credentials)

        assert exc_info.value.status_code == 401
        assert "Invalid authentication credentials" in exc_info.value.detail

    def test_verify_invalid_signature(self, token_wrong_secret: str):
        """Test that a token with wrong secret returns 401."""
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=token_wrong_secret
        )

        with pytest.raises(HTTPException) as exc_info:
            verify_token(credentials)

        assert exc_info.value.status_code == 401

    def test_verify_missing_subject(self):
        """Test that a token without 'sub' claim returns 401."""
        payload = {
            "email": "test@example.com",
            "exp": datetime.now(timezone.utc) + timedelta(days=7),
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=token
        )

        with pytest.raises(HTTPException) as exc_info:
            verify_token(credentials)

        assert exc_info.value.status_code == 401
        assert "Token missing subject" in exc_info.value.detail

    def test_verify_malformed_token(self):
        """Test that a malformed token returns 401."""
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="not-a-valid-jwt"
        )

        with pytest.raises(HTTPException) as exc_info:
            verify_token(credentials)

        assert exc_info.value.status_code == 401


class TestAuthDependencies:
    """Tests for auth dependency functions."""

    def test_get_current_user(self):
        """Test that get_current_user extracts user info from payload."""
        payload = {"sub": "user-456", "email": "user@test.com"}

        result = get_current_user(payload)

        assert result["id"] == "user-456"
        assert result["email"] == "user@test.com"

    def test_validate_user_access_matching_user(self):
        """Test that validate_user_access allows matching user_id."""
        current_user = {"id": "user-789", "email": "user@test.com"}

        result = validate_user_access("user-789", current_user)

        assert result == current_user

    def test_validate_user_access_mismatch_returns_403(self):
        """Test that mismatched user_id returns 403 Forbidden."""
        current_user = {"id": "user-789", "email": "user@test.com"}

        with pytest.raises(HTTPException) as exc_info:
            validate_user_access("different-user-id", current_user)

        assert exc_info.value.status_code == 403
        assert "Access forbidden" in exc_info.value.detail


class TestSecretConfiguration:
    """Tests for secret configuration handling."""

    def test_missing_secret_raises_500(self):
        """Test that missing BETTER_AUTH_SECRET returns 500."""
        credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="some-token"
        )

        with patch("src.auth.jwt.SECRET_KEY", None):
            with pytest.raises(HTTPException) as exc_info:
                verify_token(credentials)

            assert exc_info.value.status_code == 500
            assert "BETTER_AUTH_SECRET missing" in exc_info.value.detail
