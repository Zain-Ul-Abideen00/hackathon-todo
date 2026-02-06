from datetime import UTC, datetime
from sqlmodel import Field, SQLModel, Relationship

def utc_now() -> datetime:
    """Return current UTC datetime as naive datetime for PostgreSQL compatibility."""
    return datetime.now(UTC).replace(tzinfo=None)

class NotificationBase(SQLModel):
    user_id: str = Field(index=True)
    task_id: int | None = Field(default=None, foreign_key="task.id", nullable=True)
    title: str
    message: str
    type: str = Field(default="info", max_length=20) # info, success, warning, error
    category: str = Field(default="system", max_length=20) # system, reminder, task, achievement
    link: str | None = Field(default=None, max_length=500)
    is_read: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=utc_now)

class Notification(NotificationBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    task: "Task" = Relationship(
        back_populates="notifications",
        sa_relationship_kwargs={"lazy": "selectin"}
    )

class NotificationCreate(SQLModel):
    title: str
    message: str
    task_id: int | None = None

class NotificationUpdate(SQLModel):
    is_read: bool | None = None
