
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from src.api.deps import get_session
from src.main import app
from src.models import Task, Tag, TaskTag

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
TEST_USER = "test-user"

@pytest.mark.asyncio
async def test_debug_create_task():
    # Setup Engine
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=True, # Enable echo to see SQL queries
        connect_args={"check_same_thread": False},
    )
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    # Overrides
    async def override_get_session():
        async with AsyncSession(engine) as session:
            yield session

    def override_get_current_user():
        return {"id": TEST_USER, "email": "test@example.com"}

    app.dependency_overrides[get_session] = override_get_session
    from src.auth.dependencies import get_current_user
    app.dependency_overrides[get_current_user] = override_get_current_user

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as client:
        # Try to create a task
        print("\nSending request...")
        response = await client.post(
            f"/api/{TEST_USER}/tasks",
            json={"title": "Debug Task"},
        )
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Body: {repr(response.text)}")

        # Verify
        assert response.status_code == 201

    await engine.dispose()
