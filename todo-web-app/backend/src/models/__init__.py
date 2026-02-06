# Database models package (Module 2)
"""SQLModel entities for the Todo Web Application.

Exports:
    - Task: Todo task entity with user ownership
    - TaskCreate: Schema for creating tasks
    - TaskUpdate: Schema for updating tasks
    - Tag: Label for tasks
    - TaskTag: Many-to-many link between Task and Tag
    - RecurringPattern: Pattern for recurring tasks
    - Reminder: Scheduled alert for typical tasks
    - Notification: System notifications for the user
"""

from .chatkit import ChatKitItem, ChatKitThread
from .task_tag import TaskTag
from .task import Task, TaskCreate, TaskUpdate
from .tag import Tag, TagCreate, TagUpdate
from .recurring import RecurringPattern, RecurringCreate, RecurringUpdate
from .reminder import Reminder, ReminderCreate, ReminderUpdate
from .notification import Notification, NotificationCreate, NotificationUpdate

__all__ = [
    "Task",
    "TaskCreate",
    "TaskUpdate",
    "ChatKitThread",
    "ChatKitItem",
    "Tag",
    "TagCreate",
    "TagUpdate",
    "TaskTag",
    "RecurringPattern",
    "RecurringCreate",
    "RecurringUpdate",
    "Reminder",
    "ReminderCreate",
    "ReminderUpdate",
    "Notification",
    "NotificationCreate",
    "NotificationUpdate",
]
