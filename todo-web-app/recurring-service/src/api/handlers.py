"""Recurring Service - Event handlers for task events."""

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


class TaskEventData(BaseModel):
    """Task event data from backend."""

    event_type: str
    task_id: int = 0
    user_id: str = "unknown"
    title: str = "N/A"
    due_date: str | None = None
    priority: str | None = None
    is_recurring: bool = False
    recurrence_pattern: str | None = None
    timestamp: str | None = None  # Optional for graceful handling


@router.post("/tasks/handle")
async def handle_task_event(event: CloudEvent) -> dict:
    """Handle task events from pub/sub.

    Processes TaskCompletedEvent for recurring tasks and
    creates the next occurrence.

    Args:
        event: CloudEvent wrapper with TaskEventData

    Returns:
        Acknowledgment for Dapr
    """
    logger.info(
        "🔄 Received task event: id=%s, type=%s",
        event.id,
        event.type,
    )

    try:
        task_data = TaskEventData(**event.data)

        if task_data.event_type == "TaskCompleted" and task_data.is_recurring:
            logger.info(
                "🔁 Recurring task completed: task_id=%d, title='%s', pattern=%s",
                task_data.task_id,
                task_data.title,
                task_data.recurrence_pattern,
            )
            # TODO: Create next occurrence via backend service invocation
            # For now, just log the intent
            logger.info(
                "📅 Would create next occurrence for recurring task: %s",
                task_data.title,
            )
        else:
            logger.debug(
                "Task event (non-recurring or not completed): %s",
                task_data.event_type,
            )

        return {"status": "SUCCESS"}

    except Exception as e:
        logger.error("Error processing task event: %s", str(e))
        # DROP malformed messages to prevent infinite retries
        return {"status": "DROP"}


@router.get("/tasks/health")
async def tasks_health() -> dict:
    """Health check for task handler."""
    return {"status": "ok", "handler": "tasks"}
