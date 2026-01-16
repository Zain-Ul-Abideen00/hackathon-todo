"""Task SQLModel entity for Todo Web Application.

Represents a todo task belonging to a user with automatic timestamps
and indexed fields for efficient querying.
"""

from datetime import UTC, datetime

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    """Return current UTC datetime as naive datetime for PostgreSQL compatibility."""
    return datetime.now(UTC).replace(tzinfo=None)


class Task(SQLModel, table=True):
    """A todo task belonging to a user.

    Attributes:
        id: Auto-increment primary key.
        user_id: Better Auth user reference (indexed for filtering).
        title: Required task title (max 200 chars).
        description: Optional task description (max 1000 chars).
        completed: Task completion status, defaults to False.
        created_at: UTC timestamp when task was created.
        updated_at: UTC timestamp when task was last modified.
    """

    __tablename__ = "task"

    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, max_length=255)
    title: str = Field(max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, index=True)  # Deprecated in favor of status
    status: str = Field(default="todo", index=True, max_length=20)
    priority: str = Field(default="medium", index=True, max_length=20)
    due_date: datetime | None = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class TaskCreate(SQLModel):
    """Schema for creating a new task."""

    title: str = Field(max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    status: str = Field(default="todo", max_length=20)
    priority: str = Field(default="medium", max_length=20)
    due_date: datetime | None = None


class TaskUpdate(SQLModel):
    """Schema for updating an existing task."""

    title: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    completed: bool | None = None
    status: str | None = Field(default=None, max_length=20)
    priority: str | None = Field(default=None, max_length=20)
    due_date: datetime | None = None
