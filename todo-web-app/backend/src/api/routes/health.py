"""
Health Check Endpoint.

Provides service health status for monitoring and load balancer checks.
"""

from datetime import UTC, datetime

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str]:
    """
    Health check endpoint.

    Returns:
        Service health status with version and timestamp.

    Response:
        {
            "status": "healthy",
            "version": "0.1.0",
            "timestamp": "2026-01-08T12:00:00Z"
        }
    """
    return {
        "status": "healthy",
        "version": "0.1.0",
        "timestamp": datetime.now(UTC).isoformat(),
    }
