from datetime import UTC, datetime
from sqlalchemy.orm import selectinload
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.models import Task
from src.services.notification_service import create_notification

def utc_now() -> datetime:
    """Return current UTC datetime as naive datetime for PostgreSQL compatibility."""
    return datetime.now(UTC).replace(tzinfo=None)

async def process_overdue_tasks(session: AsyncSession) -> int:
    """
    Check for tasks that are past their due date and haven't been notified yet.
    Sends a critical system notification.
    """
    now = utc_now()

    # query: due_date < now, status != completed, overdue_notified_at is None
    statement = select(Task).where(
        Task.due_date < now,
        Task.status != "completed",
        Task.overdue_notified_at == None
    )

    tasks = (await session.exec(statement)).all()
    count = 0

    for task in tasks:
        # Create notification (no commit to keep session active)
        await create_notification(
            session=session,
            user_id=task.user_id,
            title="Task Overdue",
            message=f"Task '{task.title}' is now overdue!",
            task_id=task.id,
            type="error",
            category="task",
            link=f"/dashboard?taskId={task.id}",
            commit=False
        )

        # Mark as notified
        task.overdue_notified_at = now
        session.add(task)
        count += 1

    if count > 0:
        await session.commit()

    return count
