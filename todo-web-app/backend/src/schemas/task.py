"""Task-related Pydantic schemas for API request/response validation."""

from datetime import datetime

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    """Schema for creating a new task.

    Attributes:
        title: Required task title (1-200 characters)
        description: Optional task description (max 1000 characters)
    """

    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: str | None = Field(
        default=None, max_length=1000, description="Optional task description"
    )
    status: str = Field(default="todo", description="Task status (todo, in_progress, completed)")
    priority: str = Field(default="medium", description="Task priority (low, medium, high)")
    due_date: datetime | None = Field(default=None, description="Due date")


class TaskUpdate(BaseModel):
    """Schema for updating an existing task.

    All fields are optional - only provided fields will be updated.

    Attributes:
        title: New title (1-200 characters)
        description: New description (max 1000 characters)
        completed: New completion status
        status: New status
        priority: New priority
        due_date: New due date
    """

    title: str | None = Field(default=None, min_length=1, max_length=200, description="Task title")
    description: str | None = Field(
        default=None, max_length=1000, description="Task description"
    )
    completed: bool | None = Field(default=None, description="Completion status")
    status: str | None = Field(default=None, description="Task status")
    priority: str | None = Field(default=None, description="Task priority")
    due_date: datetime | None = Field(default=None, description="Due date")


class TaskResponse(BaseModel):
    """Schema for task API responses.

    Represents a complete task object returned by the API.
    """

    id: int = Field(..., description="Unique task identifier")
    user_id: str = Field(..., description="Owner's user ID")
    title: str = Field(..., description="Task title")
    description: str | None = Field(default=None, description="Task description")
    completed: bool = Field(..., description="Completion status")
    status: str = Field(..., description="Task status")
    priority: str = Field(..., description="Task priority")
    due_date: datetime | None = Field(default=None, description="Due date")
    created_at: datetime = Field(..., description="Creation timestamp (UTC)")
    updated_at: datetime = Field(..., description="Last modification timestamp (UTC)")

    model_config = {"from_attributes": True}


class TaskListResponse(BaseModel):
    """Schema for paginated task list responses.

    Includes cursor-based pagination metadata per FR-014 and FR-015.
    """

    tasks: list[TaskResponse] = Field(..., description="List of tasks")
    next_cursor: str | None = Field(default=None, description="Cursor for next page")
    has_more: bool = Field(..., description="Whether more tasks exist")


class TaskDeleteResponse(BaseModel):
    """Schema for task deletion confirmation.

    Attributes:
        message: Confirmation message ("deleted")
        task_id: ID of the deleted task
    """

    message: str = Field(default="deleted", description="Confirmation message")
    task_id: int = Field(..., description="Deleted task ID")
