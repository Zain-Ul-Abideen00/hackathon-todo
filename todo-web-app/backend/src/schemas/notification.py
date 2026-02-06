from datetime import datetime
from sqlmodel import SQLModel, Field
from src.models.notification import NotificationBase

class NotificationResponse(NotificationBase):
    """Schema for Notification responses."""
    id: int

class NotificationListResponse(SQLModel):
    items: list[NotificationResponse]
    unread_count: int
