"""WebSocket Service - Event handlers for task update broadcasts."""

import logging
from pydantic import BaseModel

from fastapi import APIRouter

logger = logging.getLogger(__name__)
router = APIRouter()


class CloudEvent(BaseModel):
    """CloudEvents wrapper for Dapr pub/sub messages."""

    id: str
    source: str
    specversion: str = "1.0"
    type: str
    datacontenttype: str = "application/json"
    data: dict


class TaskUpdateData(BaseModel):
    """Task update event data."""

    event_type: str
    task_id: int = 0
    user_id: str = "unknown"
    title: str = "N/A"
    status: str | None = None
    priority: str | None = None
    due_date: str | None = None
    timestamp: str | None = None  # Optional for graceful handling


@router.post("/updates/handle")
async def handle_update_event(event: CloudEvent) -> dict:
    """Handle task update events for WebSocket broadcast.

    Receives task events from pub/sub and broadcasts to
    connected WebSocket clients for real-time UI updates.

    Args:
        event: CloudEvent wrapper with TaskUpdateData

    Returns:
        Acknowledgment for Dapr
    """
    logger.info(
        "📡 Received update event: id=%s, type=%s",
        event.id,
        event.type,
    )

    try:
        update_data = TaskUpdateData(**event.data)

        # Import broadcast function from main
        from src.main import broadcast_to_user

        # Broadcast to user's WebSocket connections
        await broadcast_to_user(
            update_data.user_id,
            {
                "type": "task_update",
                "event": update_data.event_type,
                "task_id": update_data.task_id,
                "title": update_data.title,
                "timestamp": update_data.timestamp,
            },
        )

        logger.info(
            "📤 Broadcast sent: %s for task_id=%d to user=%s",
            update_data.event_type,
            update_data.task_id,
            update_data.user_id[:8] + "...",
        )

        return {"status": "SUCCESS"}

    except Exception as e:
        logger.error("Error broadcasting update: %s", str(e))
        # DROP malformed messages to prevent infinite retries
        return {"status": "DROP"}


@router.get("/updates/health")
async def updates_health() -> dict:
    """Health check for updates handler."""
    return {"status": "ok", "handler": "updates"}
