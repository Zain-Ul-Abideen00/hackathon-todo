
import asyncio
import os
from datetime import datetime, UTC
from sqlmodel import select, update, delete, col
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db.connection import engine
from src.models import Task, Notification
from src.services.overdue_service import process_overdue_tasks

async def repair_overdue_tasks():
    async with AsyncSession(engine) as session:
        now = datetime.now(UTC).replace(tzinfo=None)
        print(f"Current UTC time: {now}")

        # 1. Find overdue tasks
        stmt = select(Task).where(Task.due_date < now, Task.status != "completed")
        tasks = (await session.exec(stmt)).all()

        print(f"\nFound {len(tasks)} tasks that SHOULD be overdue:")
        task_ids = []
        user_ids = set()

        for t in tasks:
            print(f" - ID={t.id} Title='{t.title}' Due={t.due_date} NotifiedAt={t.overdue_notified_at} UserID={t.user_id}")
            task_ids.append(t.id)
            user_ids.add(t.user_id)

        if not task_ids:
            print("No overdue tasks found.")
            return

        # 2. BULK RESET State
        print("\nRESETTING overdue_notified_at and cleaning notifications...")

        # A. Reset Task flags
        # update(Task).where(col(Task.id).in_(task_ids)).values(...)
        update_stmt = update(Task).where(col(Task.id).in_(task_ids)).values(overdue_notified_at=None)
        await session.exec(update_stmt)

        # B. Delete existing overdue notifications for these tasks
        # Clean up 'error' type notifications linked to these tasks
        delete_stmt = delete(Notification).where(
            col(Notification.task_id).in_(task_ids),
            Notification.type == "error"
        )
        await session.exec(delete_stmt)

        await session.commit()
        print("Reset complete. Commited.")

        # 3. Force Service Run
        # Start a NEW session for the service call to be clean

    print("\nRunning process_overdue_tasks (REAL RUN)...")
    async with AsyncSession(engine) as session:
        count = await process_overdue_tasks(session)
        print(f"Service returned count: {count} (New notifications created)")

        # 4. Verify
        # Check notifications for the users involved
        for uid in user_ids:
            notifs = (await session.exec(select(Notification).where(Notification.user_id == uid, Notification.type == 'error'))).all()
            print(f"User {uid} has {len(notifs)} Error Notifications now.")
            # Print top 3 to verify
            for n in notifs[:3]:
                print(f" - Notif ID={n.id} TaskID={n.task_id} Title='{n.title}'")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(repair_overdue_tasks())
