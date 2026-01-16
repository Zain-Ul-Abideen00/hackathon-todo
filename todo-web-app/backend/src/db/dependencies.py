"""FastAPI dependencies for database session injection.

Provides the get_session dependency for use with FastAPI's Depends().
"""

from collections.abc import AsyncGenerator

from sqlmodel.ext.asyncio.session import AsyncSession

from .connection import engine


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields async database sessions.

    Usage:
        @router.get("/tasks")
        async def list_tasks(
            session: AsyncSession = Depends(get_session),
        ) -> list[Task]:
            ...

    Yields:
        AsyncSession instance for database operations.
    """
    async with AsyncSession(engine) as session:
        yield session
