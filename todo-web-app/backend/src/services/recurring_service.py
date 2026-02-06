from datetime import UTC, datetime, timedelta
from dateutil.relativedelta import relativedelta
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.models import Task, RecurringPattern, TaskTag

def utc_now() -> datetime:
    """Return current UTC datetime as naive datetime for PostgreSQL compatibility."""
    return datetime.now(UTC).replace(tzinfo=None)

async def generate_next_task(
    session: AsyncSession,
    original_task: Task,
    pattern: RecurringPattern
) -> Task | None:
    """Generate the next instance of a recurring task.

    Args:
        session: Database session.
        original_task: The completed task.
        pattern: The recurrence pattern.

    Returns:
        The newly created Task, or None if skipped (e.g. past end_date).
    """
    # Cache all necessary properties before potential commits expire the objects
    # This prevents "MissingGreenlet" errors from lazy loading after commit
    original_id = original_task.id
    user_id = original_task.user_id
    title = original_task.title
    description = original_task.description
    priority = original_task.priority
    org_due_date = original_task.due_date

    # Cache pattern props
    pattern_str = pattern.pattern
    interval = pattern.interval
    end_date = pattern.end_date

    # Determine base date
    if not org_due_date:
        base_date = utc_now()
    else:
        base_date = org_due_date

    # Calculate next date
    next_date = base_date
    if pattern_str == "daily":
        next_date += timedelta(days=interval)
    elif pattern_str == "weekly":
        next_date += timedelta(weeks=interval)
    elif pattern_str == "monthly":
        next_date += relativedelta(months=interval)
    elif pattern_str == "yearly":
        next_date += relativedelta(years=interval)

    # Check end_date
    if end_date and next_date > end_date:
        return None

    # Update pattern last_generated
    pattern.last_generated = utc_now()
    session.add(pattern)

    # Clone task
    new_task = Task(
        user_id=user_id,
        title=title,
        description=description,
        status="todo",
        priority=priority,
        due_date=next_date,
        tags=[] # Handled manually deeply
    )

    # We need to add the new task first to get an ID?
    # Or just add to session.
    session.add(new_task)
    await session.commit()
    await session.refresh(new_task)

    # Copy tags
    # Need to fetch tags if they are not loaded?
    # original_task.tags might be lazy loaded.
    # We can just copy the links from TaskTag

    stmt = select(TaskTag).where(TaskTag.task_id == original_id)
    old_links = (await session.exec(stmt)).all()

    for link in old_links:
        new_link = TaskTag(task_id=new_task.id, tag_id=link.tag_id)
        session.add(new_link)

    # Also clone the RecurringPattern for the NEW task?
    # Recurrence usually implies the new task is ALSO recurring.
    # So we need to link the SAME pattern?
    # But RecurringPattern has unique task_id. 1:1.
    # So we must create a COPY of the pattern for the new task.
    # OR we change logic: master task holds pattern, instances link to master?
    # Simpler for now: Copy pattern to new task so it continues correctly.

    new_pattern = RecurringPattern(
        task_id=new_task.id,
        pattern=pattern_str,
        interval=interval,
        end_date=end_date,
        last_generated=None
    )
    session.add(new_pattern)

    # Create notification for new task
    from src.services.notification_service import create_notification
    await create_notification(
        session=session,
        user_id=user_id,
        title="Recurring Task Created",
        message=f"New instance of '{title}' has been generated.",
        task_id=new_task.id,
        type="success",
        category="task",
        link=f"/dashboard?taskId={new_task.id}"
    )

    await session.commit()
    return new_task

async def process_task_completion(
    session: AsyncSession,
    task: Task
) -> Task | None:
    """Check if task is recurring and generate next instance if so."""
    # Ensure recurring_pattern is loaded
    # It might fail if not loaded. Safest to query it.
    stmt = select(RecurringPattern).where(RecurringPattern.task_id == task.id)
    result = await session.exec(stmt)
    pattern = result.first()

    print(f"🔄 Processing completion for Task {task.id}. Pattern found: {pattern}")

    if not pattern:
        print(f"ℹ️ Task {task.id} is not recurring.")
        return None

    # Generate next
    print(f"🔄 Generating next task for pattern {pattern.pattern} interval {pattern.interval}...")
    return await generate_next_task(session, task, pattern)
