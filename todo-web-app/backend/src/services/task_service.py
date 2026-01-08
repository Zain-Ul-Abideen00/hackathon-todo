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
