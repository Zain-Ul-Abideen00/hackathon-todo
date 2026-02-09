"""Dapr Pub/Sub Event Handlers.

This module contains handlers for Dapr pub/sub events from Kafka topics.
Dapr delivers events via POST to subscribed endpoints.
"""

import logging
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(tags=["handlers"])


class CloudEvent(BaseModel):
    """CloudEvents specification for Dapr pub/sub.

    Dapr wraps all pub/sub messages in CloudEvents format.
    https://cloudevents.io/
    """

    id: str = Field(..., description="Unique event ID")
    source: str = Field(..., description="Event source (producer)")
    specversion: str = Field(default="1.0", description="CloudEvents version")
    type: str = Field(..., description="Event type")
    datacontenttype: str = Field(default="application/json")
    data: dict[str, Any] = Field(..., description="Event payload")
    time: str | None = Field(None, description="Event timestamp")


class ReminderEventData(BaseModel):
    """TaskDueReminderEvent payload from backend."""

    event_type: str = Field(default="TaskDueReminder")
    task_id: int
    user_id: str
    title: str
    due_date: str | None = None
    time_until_due: int = 0
    reminder_id: int | None = None
    urgency: str = "upcoming"
    timestamp: str | None = None  # Optional for graceful handling


class NotificationResult(BaseModel):
    """Result of notification delivery."""

    success: bool
    channel: str
    message: str


@router.post("/reminders/handle")
async def handle_reminder_event(event: CloudEvent) -> dict:
    """Handle TaskDueReminderEvent from Kafka via Dapr.

    This endpoint is called by Dapr when a message is published
    to the reminder-events topic. The subscription is defined
    in dapr/subscriptions/reminders.yaml.

    Args:
        event: CloudEvent wrapper containing ReminderEventData

    Returns:
        Acknowledgment for Dapr (success or retry)
    """
    logger.info(
        "Received reminder event: id=%s, type=%s",
        event.id,
        event.type,
    )

    try:
        # Parse event data
        reminder_data = ReminderEventData(**event.data)

        logger.info(
            "Processing reminder: task_id=%d, user_id=%s, urgency=%s",
            reminder_data.task_id,
            reminder_data.user_id,
            reminder_data.urgency,
        )

        # Deliver notification through available channels
        results = await deliver_notification(reminder_data)

        # Log results
        for result in results:
            if result.success:
                logger.info("Notification sent via %s: %s", result.channel, result.message)
            else:
                logger.warning("Notification failed via %s: %s", result.channel, result.message)

        # Return success to Dapr (ACK)
        return {"status": "SUCCESS"}

    except Exception as e:
        logger.error("Error processing reminder event: %s", str(e))
        # Return DROP to prevent infinite retries on malformed messages
        return {"status": "DROP"}


async def deliver_notification(data: ReminderEventData) -> list[NotificationResult]:
    """Deliver notification through multiple channels.

    Currently supports:
    - Console logging (always enabled)
    - Future: Email, Push, SMS

    Args:
        data: Reminder event data

    Returns:
        List of delivery results per channel
    """
    results = []

    # Console channel (always works)
    urgency_emoji = {
        "overdue": "🚨",
        "soon": "⚠️",
        "upcoming": "📅",
    }.get(data.urgency, "📌")

    console_message = (
        f"{urgency_emoji} REMINDER: {data.title} "
        f"(Task #{data.task_id}, User: {data.user_id[:8]}...)"
    )

    logger.info(console_message)
    results.append(NotificationResult(
        success=True,
        channel="console",
        message=console_message,
    ))

    # TODO: Add email channel
    # if email_enabled:
    #     await send_email(data.user_id, data.title, data.urgency)

    # TODO: Add push notification channel
    # if push_enabled:
    #     await send_push(data.user_id, data.title, data.urgency)

    return results


class TaskEventData(BaseModel):
    """TaskCreatedEvent or TaskCompletedEvent payload from backend."""

    event_type: str
    task_id: int = 0
    user_id: str = "unknown"
    title: str = "N/A"
    due_date: str | None = None
    priority: str | None = None
    timestamp: str | None = None  # Optional for graceful handling


@router.post("/tasks/handle")
async def handle_task_event(event: CloudEvent) -> dict:
    """Handle TaskCreatedEvent and TaskCompletedEvent from Kafka via Dapr.

    This endpoint is called by Dapr when a message is published
    to the task-events topic. Used for logging and future analytics.

    Args:
        event: CloudEvent wrapper containing TaskEventData

    Returns:
        Acknowledgment for Dapr (success or retry)
    """
    logger.info(
        "🎯 Received TASK event: id=%s, type=%s",
        event.id,
        event.type,
    )

    try:
        # Parse event data
        task_data = TaskEventData(**event.data)

        event_emoji = "✅" if task_data.event_type == "TaskCompleted" else "📝"
        logger.info(
            "%s Task %s: task_id=%d, title='%s', user=%s",
            event_emoji,
            task_data.event_type,
            task_data.task_id,
            task_data.title,
            task_data.user_id[:8] + "...",
        )

        # 📧 Email placeholder - future enhancement
        # TODO: Implement actual email sending via SMTP/SendGrid/etc.
        logger.info(
            "📧 [PLACEHOLDER] Would send email to user %s: '%s' - %s",
            task_data.user_id[:8] + "...",
            task_data.title,
            task_data.event_type,
        )

        # Return success to Dapr (ACK)
        return {"status": "SUCCESS"}

    except Exception as e:
        logger.error("Error processing task event: %s", str(e))
        # DROP malformed messages to prevent infinite retries
        return {"status": "DROP"}


@router.get("/reminders/health")
async def reminders_health() -> dict:
    """Health check for reminder handler."""
    return {"status": "ok", "handler": "reminders"}
