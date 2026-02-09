"""Event publisher for Dapr pub/sub using httpx.

This module provides fire-and-forget event publishing to Kafka via Dapr's
HTTP API. Events are published asynchronously without blocking the main
operation. Failures are logged but do not fail the calling operation.

Key design decisions:
- Uses httpx instead of dapr-client SDK (per SDD httpx pattern)
- Fire-and-forget: failures logged, not raised
- DAPR_ENABLED toggle for local development without Dapr
- CloudEvents-compatible JSON payloads
"""

import logging
import os
from typing import TYPE_CHECKING

import httpx

if TYPE_CHECKING:
    from .models import BaseEvent

logger = logging.getLogger(__name__)

# Configuration
DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_BASE_URL = f"http://localhost:{DAPR_HTTP_PORT}"
PUBSUB_NAME = "taskpubsub"
DAPR_ENABLED = os.getenv("DAPR_ENABLED", "false").lower() == "true"

# Topic mappings
TOPIC_TASK_EVENTS = "task-events"
TOPIC_REMINDER_EVENTS = "reminder-events"
TOPIC_TASK_UPDATES = "task-updates"


class EventPublisher:
    """Async event publisher for Dapr pub/sub.

    Uses httpx async client for non-blocking event publishing.
    All publish methods are fire-and-forget - errors are logged
    but never raised to the caller.

    Example:
        publisher = EventPublisher()
        await publisher.connect()
        try:
            await publisher.publish_task_created(task)
        finally:
            await publisher.disconnect()
    """

    def __init__(self) -> None:
        """Initialize publisher with httpx client."""
        self._client: httpx.AsyncClient | None = None

    async def connect(self) -> None:
        """Create httpx async client for Dapr communication."""
        if not DAPR_ENABLED:
            logger.info("Dapr disabled - event publishing will be skipped")
            return

        self._client = httpx.AsyncClient(
            base_url=DAPR_BASE_URL,
            timeout=httpx.Timeout(5.0),  # 5 second timeout
        )
        logger.info(
            "Event publisher connected to Dapr at %s",
            DAPR_BASE_URL,
        )

    async def disconnect(self) -> None:
        """Close httpx client gracefully."""
        if self._client:
            await self._client.aclose()
            self._client = None
            logger.info("Event publisher disconnected")

    async def _publish(self, topic: str, event: "BaseEvent") -> bool:
        """Publish event to topic via Dapr.

        Args:
            topic: Kafka topic name
            event: Pydantic event model

        Returns:
            True if published successfully, False otherwise
        """
        if not DAPR_ENABLED:
            logger.debug(
                "Dapr disabled - skipping publish to %s: %s",
                topic,
                event.event_type,
            )
            return True

        if not self._client:
            logger.warning("Publisher not connected - call connect() first")
            return False

        url = f"/v1.0/publish/{PUBSUB_NAME}/{topic}"
        payload = event.model_dump(mode="json")

        try:
            response = await self._client.post(
                url,
                json=payload,
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
            logger.info(
                "Published %s to %s (task_id=%s)",
                event.event_type,
                topic,
                getattr(event, "task_id", "N/A"),
            )
            return True

        except httpx.TimeoutException:
            logger.error(
                "Timeout publishing %s to %s",
                event.event_type,
                topic,
            )
            return False

        except httpx.HTTPStatusError as e:
            logger.error(
                "HTTP error publishing %s to %s: %s",
                event.event_type,
                topic,
                e.response.status_code,
            )
            return False

        except Exception as e:
            logger.error(
                "Unexpected error publishing %s to %s: %s",
                event.event_type,
                topic,
                str(e),
            )
            return False

    async def publish_task_created(
        self,
        task_id: int,
        user_id: str,
        title: str,
        due_date=None,
        priority: str | None = None,
    ) -> bool:
        """Publish TaskCreatedEvent to task-events topic.

        Args:
            task_id: Database ID of created task
            user_id: UUID of task owner
            title: Task title
            due_date: Optional due date
            priority: Optional priority level

        Returns:
            True if published successfully
        """
        from .models import TaskCreatedEvent

        event = TaskCreatedEvent(
            task_id=task_id,
            user_id=user_id,
            title=title,
            due_date=due_date,
            priority=priority,
        )
        return await self._publish(TOPIC_TASK_EVENTS, event)

    async def publish_task_completed(
        self,
        task_id: int,
        user_id: str,
        title: str,
    ) -> bool:
        """Publish TaskCompletedEvent to task-events topic.

        Args:
            task_id: Database ID of completed task
            user_id: UUID of task owner
            title: Task title

        Returns:
            True if published successfully
        """
        from .models import TaskCompletedEvent

        event = TaskCompletedEvent(
            task_id=task_id,
            user_id=user_id,
            title=title,
        )
        return await self._publish(TOPIC_TASK_EVENTS, event)

    async def publish_task_updated(
        self,
        task_id: int,
        user_id: str,
        action: str,
        task_data: dict | None = None,
    ) -> bool:
        """Publish TaskUpdateEvent to task-updates topic for real-time sync.

        Args:
            task_id: Database ID of task
            user_id: UUID of task owner
            action: create, update, delete, or complete
            task_data: Full task object for create/update

        Returns:
            True if published successfully
        """
        from .models import TaskUpdateEvent

        event = TaskUpdateEvent(
            task_id=task_id,
            user_id=user_id,
            action=action,
            task_data=task_data,
        )
        return await self._publish(TOPIC_TASK_UPDATES, event)

    async def publish_reminder(
        self,
        task_id: int,
        user_id: str,
        title: str,
        due_date,
        time_until_due: int,
        reminder_id: int,
        urgency: str,
    ) -> bool:
        """Publish TaskDueReminderEvent to reminder-events topic.

        Args:
            task_id: Database ID of task
            user_id: UUID of task owner
            title: Task title
            due_date: Task due date
            time_until_due: Seconds until due
            reminder_id: Database ID of reminder
            urgency: overdue, soon, or upcoming

        Returns:
            True if published successfully
        """
        from .models import TaskDueReminderEvent

        event = TaskDueReminderEvent(
            task_id=task_id,
            user_id=user_id,
            title=title,
            due_date=due_date,
            time_until_due=time_until_due,
            reminder_id=reminder_id,
            urgency=urgency,
        )
        return await self._publish(TOPIC_REMINDER_EVENTS, event)


# Singleton instance for dependency injection
_publisher: EventPublisher | None = None


async def get_publisher() -> EventPublisher:
    """Get or create singleton EventPublisher instance.

    Returns:
        Configured EventPublisher instance
    """
    global _publisher
    if _publisher is None:
        _publisher = EventPublisher()
        await _publisher.connect()
    return _publisher
