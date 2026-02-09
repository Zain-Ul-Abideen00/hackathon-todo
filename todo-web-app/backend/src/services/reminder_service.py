from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from src.models.reminder import Reminder
from src.services.notification_service import create_notification, utc_now
from src.services.task_service import get_task
from src.events import get_publisher

async def process_due_reminders(session: AsyncSession):
    """Check for due reminders and generate notifications."""
    now = utc_now()

    # query for due reminders that haven't been triggered
    stmt = select(Reminder).where(Reminder.remind_at <= now, Reminder.triggered == False)
    results = await session.exec(stmt)
    due_reminders = results.all()

    count = 0
    for reminder in due_reminders:
        # Fetch task to get details
        # We assume checking raw task table is faster than get_task which checks ownership?
        # But we need task title.
        # Reminder has task_id.
        # Let's simple fetch task from DB directly or use relationship if eager loaded (it's not).
        from src.models.task import Task
        task = await session.get(Task, reminder.task_id)

        if task and task.status != "completed":
            # Calculate dynamic message and urgency
            msg = f"Reminder for task '{task.title}'."
            notif_type = "info"
            urgency = "upcoming"
            time_until_due = 0

            if task.due_date:
                delta = task.due_date - now
                time_until_due = int(delta.total_seconds())

                if time_until_due < 0:
                    msg = f"Task '{task.title}' is OVERDUE!"
                    notif_type = "error"
                    urgency = "overdue"
                elif time_until_due < 3600:
                    mins = time_until_due // 60
                    msg = f"Task '{task.title}' is due in {mins} minutes."
                    notif_type = "warning"
                    urgency = "soon"
                elif time_until_due < 86400:
                    hours = time_until_due // 3600
                    msg = f"Task '{task.title}' is due in {hours} hours."
                else:
                    days = time_until_due // 86400
                    msg = f"Task '{task.title}' is due in {days} days."

            # Create notification
            await create_notification(
                session=session,
                user_id=reminder.user_id,
                title=f"Reminder: {task.title}",
                message=msg,
                task_id=task.id,
                type=notif_type,
                category="reminder",
                link=f"/dashboard?taskId={task.id}"
            )

            # Publish reminder event to Kafka (fire-and-forget)
            publisher = await get_publisher()
            await publisher.publish_reminder(
                task_id=task.id,
                user_id=reminder.user_id,
                title=task.title,
                due_date=task.due_date,
                time_until_due=time_until_due,
                reminder_id=reminder.id,
                urgency=urgency,
            )

            # Mark triggered
            reminder.triggered = True
            session.add(reminder)
            count += 1

    if count > 0:
        await session.commit()

    return count
