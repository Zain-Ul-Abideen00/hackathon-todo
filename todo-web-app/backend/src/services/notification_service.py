from datetime import UTC, datetime
from sqlmodel import select, col
from sqlmodel.ext.asyncio.session import AsyncSession

from src.models.notification import Notification, NotificationCreate

def utc_now() -> datetime:
    """Return current UTC datetime as naive datetime for PostgreSQL compatibility."""
    return datetime.now(UTC).replace(tzinfo=None)

async def create_notification(
    session: AsyncSession,
    user_id: str,
    title: str,
    message: str,
    task_id: int | None = None,
    type: str = "info",
    category: str = "system",
    link: str | None = None,
    commit: bool = True,
) -> Notification:
    """Create a new notification."""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        task_id=task_id,
        type=type,
        category=category,
        link=link,
        is_read=False,
        created_at=utc_now()
    )
    session.add(notification)

    if commit:
        await session.commit()
        await session.refresh(notification)

        # Schedule WebSocket publish as background task to avoid MissingGreenlet error
        # The httpx client in publisher can break SQLAlchemy's greenlet context if awaited inline
        import asyncio
        asyncio.create_task(_publish_notification_event(user_id, task_id))

    return notification


async def _publish_notification_event(user_id: str, task_id: int | None) -> None:
    """Background task to publish notification event for real-time delivery."""
    try:
        from src.events import get_publisher
        publisher = await get_publisher()
        await publisher.publish_task_updated(
            task_id=task_id or 0,
            user_id=user_id,
            action="notification",
        )
    except Exception as e:
        # Fire-and-forget: log but don't fail
        import logging
        logging.getLogger(__name__).warning("Failed to publish notification event: %s", e)

async def list_notifications(
    session: AsyncSession,
    user_id: str,
    limit: int = 50,
    unread_only: bool = False,
) -> dict:
    """List notifications for a user."""
    # Build query
    statement = select(Notification).where(Notification.user_id == user_id)

    if unread_only:
        statement = statement.where(Notification.is_read == False)

    # Order by newest first
    statement = statement.order_by(Notification.created_at.desc())
    statement = statement.limit(limit)

    notifications = (await session.exec(statement)).all()

    # Get total unread count (separate query)
    count_stmt = select(Notification).where(Notification.user_id == user_id, Notification.is_read == False)
    # Using len(all()) for now, count() is more efficient but requires func which is fine
    # For MVP this is acceptable
    from sqlalchemy import func
    count_stmt = select(func.count()).select_from(Notification).where(Notification.user_id == user_id, Notification.is_read == False)
    unread_count = (await session.exec(count_stmt)).one()

    return {
        "items": notifications,
        "unread_count": unread_count
    }

async def get_notification(
    session: AsyncSession,
    notification_id: int,
    user_id: str,
) -> Notification | None:
    """Get a single notification."""
    statement = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user_id
    )
    return (await session.exec(statement)).first()

async def mark_as_read(
    session: AsyncSession,
    notification_id: int,
    user_id: str,
) -> Notification | None:
    """Mark a notification as read."""
    notification = await get_notification(session, notification_id, user_id)
    if not notification:
        return None

    notification.is_read = True
    session.add(notification)
    await session.commit()
    await session.refresh(notification)
    return notification

async def mark_all_as_read(
    session: AsyncSession,
    user_id: str,
) -> int:
    """Mark all notifications as read for a user. Returns count of updated items."""
    # Use update statement for efficiency
    from sqlmodel import update

    statement = (
        update(Notification)
        .where(Notification.user_id == user_id, Notification.is_read == False)
        .values(is_read=True)
    )

    result = await session.exec(statement)
    await session.commit()
    return result.rowcount

async def delete_notification(
    session: AsyncSession,
    notification_id: int,
    user_id: str,
) -> bool:
    """Delete a notification."""
    notification = await get_notification(session, notification_id, user_id)
    if not notification:
        return False

    await session.delete(notification)
    await session.commit()
    return True

async def delete_task_notifications(
    session: AsyncSession,
    task_id: int,
    user_id: str,
) -> int:
    """Delete all 'smart' notifications (overdue, reminders) for a completed task."""
    from sqlmodel import or_

    # Logic: Delete if (category=reminder) OR (category=task AND type=error [Overdue])
    # We purposefully keep 'Task Created' (success) or general info updates.
    statement = select(Notification).where(
        Notification.task_id == task_id,
        Notification.user_id == user_id,
        or_(
            Notification.category == "reminder",
            (Notification.category == "task") & (Notification.type == "error")
        )
    )

    notifications = (await session.exec(statement)).all()
    count = 0

    for n in notifications:
        await session.delete(n)
        count += 1

    if count > 0:
        await session.commit()

    return count
