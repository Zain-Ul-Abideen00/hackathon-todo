"""
FastAPI dependencies for authentication.

Provides injectable dependencies for protected routes:
- get_current_user: Extract user info from verified JWT
- validate_user_access: Ensure user can only access their own resources

Agent Reference: @backend-security-coder
"""

from fastapi import Depends, HTTPException

from .jwt import verify_token


def get_current_user(payload: dict = Depends(verify_token)) -> dict:
    """
    Extract current user from verified JWT payload.

    Use as a FastAPI dependency to protect routes:

    ```python
    @router.get("/protected")
    async def protected_route(user: dict = Depends(get_current_user)):
        return {"user_id": user["id"]}
    ```

    Args:
        payload: Verified JWT payload from verify_token

    Returns:
        dict: User info with 'id' and 'email' keys
    """
    return {
        "id": payload["sub"],
        "email": payload.get("email"),
    }


def validate_user_access(
    user_id: str,
    current_user: dict = Depends(get_current_user),
) -> dict:
    """
    Validate that the current user can access resources for user_id.

    Enforces user isolation - users can only access their own resources.
    Use in routes with user_id path parameter.

    ```python
    @router.get("/users/{user_id}/tasks")
    async def get_tasks(
        user_id: str,
        current_user: dict = Depends(lambda: validate_user_access(user_id))
    ):
        return await get_user_tasks(user_id)
    ```

    Args:
        user_id: User ID from URL path parameter
        current_user: Current authenticated user

    Returns:
        dict: Current user info if access is allowed

    Raises:
        HTTPException: 403 Forbidden if user_id doesn't match token
    """
    if current_user["id"] != user_id:
        raise HTTPException(
            status_code=403,
            detail="Access forbidden: Cannot access resources for another user",
        )
    return current_user
