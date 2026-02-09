"""Event models for Dapr pub/sub messaging.

These Pydantic models define the event schemas published to Kafka topics
via Dapr. All events follow CloudEvents-compatible structure with explicit
event_type field for consumer routing.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class BaseEvent(BaseModel):
    """Base class for all events with common fields."""

    event_type: str = Field(..., description="Event type identifier for routing")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow,
        description="ISO8601 event timestamp",
    )

    model_config = {
        "json_encoders": {datetime: lambda v: v.isoformat()},
    }


class TaskCreatedEvent(BaseEvent):
    """Published when a new task is successfully created.

    Topic: task-events
    """

    event_type: str = Field(default="TaskCreated", frozen=True)
    task_id: int = Field(..., description="Database ID of created task")
    user_id: str = Field(..., description="UUID of task owner")
    title: str = Field(..., description="Task title")
    due_date: datetime | None = Field(None, description="Due date if set")
    priority: str | None = Field(None, description="Priority: high, medium, low")


class TaskCompletedEvent(BaseEvent):
    """Published when a task is marked as complete.

    Topic: task-events
    """

    event_type: str = Field(default="TaskCompleted", frozen=True)
    task_id: int = Field(..., description="Database ID of completed task")
    user_id: str = Field(..., description="UUID of task owner")
    title: str = Field(..., description="Task title for notification context")
    completed_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the task was completed",
    )


class TaskDueReminderEvent(BaseEvent):
    """Published when a task approaches its due date.

    Topic: reminder-events
    """

    event_type: str = Field(default="TaskDueReminder", frozen=True)
    task_id: int = Field(..., description="Database ID of task")
    user_id: str = Field(..., description="UUID of task owner")
    title: str = Field(..., description="Task title")
    due_date: datetime = Field(..., description="Task due date")
    time_until_due: int = Field(
        ..., description="Seconds until due (negative if overdue)"
    )
    reminder_id: int = Field(..., description="Database ID of reminder record")
    urgency: str = Field(..., description="overdue, soon, or upcoming")


class TaskUpdateEvent(BaseEvent):
    """Published for real-time multi-client sync.

    This event enables connected WebSocket clients to receive
    immediate updates when tasks are modified.

    Topic: task-updates
    """

    event_type: str = Field(default="TaskUpdated", frozen=True)
    task_id: int = Field(..., description="Database ID of task")
    user_id: str = Field(..., description="UUID of task owner")
    action: str = Field(..., description="create, update, delete, or complete")
    task_data: dict[str, Any] | None = Field(
        None, description="Full task object for create/update actions"
    )
