import asyncio
import os
import sys

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from src.db.session import async_session_maker
from src.services.notification_service import NotificationService
from src.services.task_service import TaskService
from sqlmodel import select
from src.models.user import User

async def main():
    async with async_session_maker() as session:
        # Get first user
        result = await session.exec(select(User))
        user = result.first()

        if not user:
            print("No users found")
            return

        print(f"Creating notification for user: {user.email}")

        await NotificationService.create_notification(
            session=session,
            user_id=user.id,
            title="Manual Test Notification",
            message="This is a notification created from the backend script."
        )
        await session.commit()
        print("Notification created successfully")

if __name__ == "__main__":
    asyncio.run(main())
