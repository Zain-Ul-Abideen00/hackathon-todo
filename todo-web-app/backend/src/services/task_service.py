"""Task CRUD service for Todo Web Application.

Provides async functions for task persistence, user isolation,
and status filtering operations.
"""

from datetime import UTC, datetime

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.models import Task, TaskCreate, TaskUpdate


def utc_now() -> datetime:
    """Return current UTC datetime as naive datetime for PostgreSQL compatibility."""
    return datetime.now(UTC).replace(tzinfo=None)


async def create_task(
    session: AsyncSession,
    task_data: TaskCreate,
    user_id: str,
) -> Task:
    """Create a new task for a user.

    Args:
        session: Database session.
        task_data: Task creation data.
        user_id: Owner's user ID.

    Returns:
        Created task with auto-generated ID and timestamps.
    """
    task = Task(
        user_id=user_id,
        title=task_data.title,
        description=task_data.description,
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task


async def get_task(
    session: AsyncSession,
    task_id: int,
    user_id: str,
) -> Task | None:
    """Get a task by ID, enforcing user ownership.

    Args:
        session: Database session.
        task_id: Task ID to retrieve.
        user_id: Owner's user ID for isolation.

    Returns:
        Task if found and owned by user, None otherwise.
    """
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.exec(statement)
    return result.first()


async def update_task(
    session: AsyncSession,
    task_id: int,
    user_id: str,
    task_data: TaskUpdate,
) -> Task | None:
    """Update a task, enforcing user ownership.

    Args:
        session: Database session.
        task_id: Task ID to update.
        user_id: Owner's user ID for isolation.
        task_data: Fields to update.

    Returns:
        Updated task if found, None otherwise.
    """
    task = await get_task(session, task_id, user_id)
    if not task:
        return None

    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    task.updated_at = utc_now()
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task


async def delete_task(
    session: AsyncSession,
    task_id: int,
    user_id: str,
) -> bool:
    """Delete a task, enforcing user ownership.

    Args:
        session: Database session.
        task_id: Task ID to delete.
        user_id: Owner's user ID for isolation.

    Returns:
        True if deleted, False if not found.
    """
    task = await get_task(session, task_id, user_id)
    if not task:
        return False

    await session.delete(task)
    await session.commit()
    return True


async def list_tasks_by_user(
    session: AsyncSession,
    user_id: str,
    completed: bool | None = None,
) -> list[Task]:
    """List all tasks for a user with optional status filter.

    Args:
        session: Database session.
        user_id: User ID to filter by.
        completed: Optional filter by completion status.

    Returns:
        List of tasks belonging to the user.
    """
    statement = select(Task).where(Task.user_id == user_id)

    if completed is not None:
        statement = statement.where(Task.completed == completed)

    result = await session.exec(statement)
    return list(result.all())


async def list_tasks_paginated(
    session: AsyncSession,
    user_id: str,
    completed: bool | None = None,
    sort_by: str = "created",
    cursor: str | None = None,
    limit: int = 20,
) -> dict:
    """List tasks with cursor-based pagination and sorting.

    Implements FR-014 and FR-015 for pagination.

    Args:
        session: Database session.
        user_id: User ID to filter by.
        completed: Optional filter by completion status.
        sort_by: Sort field - "created" (default, newest first) or "title" (alphabetical).
        cursor: Base64-encoded task_id for pagination.
        limit: Number of tasks per page (1-100, default 20).

    Returns:
        Dict with keys:
        - tasks: List of Task objects
        - next_cursor: Cursor for next page (or None)
        - has_more: Boolean indicating more tasks exist
    """
    import base64

    statement = select(Task).where(Task.user_id == user_id)

    if completed is not None:
        statement = statement.where(Task.completed == completed)

    # Apply sorting
    if sort_by == "title":
        statement = statement.order_by(Task.title.asc(), Task.id.asc())
    else:
        # Default: created (newest first)
        statement = statement.order_by(Task.created_at.desc(), Task.id.desc())

    # Apply cursor-based pagination
    if cursor:
        try:
            decoded_cursor = base64.b64decode(cursor).decode("utf-8")
            cursor_id = int(decoded_cursor)
            # For newest first, get tasks with id < cursor_id
            if sort_by == "created":
                statement = statement.where(Task.id < cursor_id)
            else:
                # For title sort, we need to compare by title then id
                # Simplified: just use id for cursor
                statement = statement.where(Task.id > cursor_id)
        except (ValueError, base64.binascii.Error):
            pass  # Invalid cursor, start from beginning

    # Fetch one extra to check has_more
    statement = statement.limit(limit + 1)

    result = await session.exec(statement)
    tasks = list(result.all())

    # Determine pagination
    has_more = len(tasks) > limit
    if has_more:
        tasks = tasks[:limit]

    # Generate next cursor
    next_cursor = None
    if has_more and tasks:
        last_task_id = tasks[-1].id
        next_cursor = base64.b64encode(str(last_task_id).encode("utf-8")).decode("utf-8")

    return {
        "tasks": tasks,
        "next_cursor": next_cursor,
        "has_more": has_more,
    }


async def toggle_task_completion(
    session: AsyncSession,
    task_id: int,
    user_id: str,
) -> Task | None:
    """Toggle a task's completion status.

    Implements US6: Toggle Task Completion.

    Args:
        session: Database session.
        task_id: Task ID to toggle.
        user_id: Owner's user ID for isolation.

    Returns:
        Updated task with toggled status, or None if not found.
    """
    task = await get_task(session, task_id, user_id)
    if not task:
        return None

    task.completed = not task.completed
    task.updated_at = utc_now()
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task
