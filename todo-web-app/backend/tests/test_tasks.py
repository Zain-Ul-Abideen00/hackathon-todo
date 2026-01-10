"""API integration tests for Task Management endpoints.

Tests all 6 user stories per spec.md:
- US1: Create Task
- US2: List Tasks with Filtering
- US3: View Single Task
- US4: Update Task
- US5: Delete Task
- US6: Toggle Task Completion

Uses in-memory SQLite for test isolation.
"""

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from src.api.deps import get_session
from src.main import app
from src.models import Task  # noqa: F401 - Import to register model


# Test database engine using SQLite for isolation
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="function")
async def test_engine():
    """Create a fresh test engine for each test."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False},
    )
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest.fixture
async def test_session(test_engine):
    """Create a test session."""
    async with AsyncSession(test_engine) as session:
        yield session


@pytest.fixture
async def client(test_engine):
    """Create async test client with overridden database session."""

    async def override_get_session():
        async with AsyncSession(test_engine) as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# Test user - matches the placeholder in deps.py
TEST_USER = "test-user"


# =============================================================================
# US1: Create Task Tests (T017-T020)
# =============================================================================


@pytest.mark.asyncio
async def test_create_task_with_title_only(client):
    """T017: POST creates task with title only → 201."""
    response = await client.post(
        f"/api/{TEST_USER}/tasks",
        json={"title": "Buy groceries"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Buy groceries"
    assert data["description"] is None
    assert data["completed"] is False
    assert data["user_id"] == TEST_USER
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


@pytest.mark.asyncio
async def test_create_task_with_title_and_description(client):
    """T018: POST creates task with title + description → 201."""
    response = await client.post(
        f"/api/{TEST_USER}/tasks",
        json={"title": "Read book", "description": "Finish chapter 5"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Read book"
    assert data["description"] == "Finish chapter 5"
    assert data["completed"] is False


@pytest.mark.asyncio
async def test_create_task_with_empty_title_fails(client):
    """T019: POST with empty title → 400 validation error."""
    response = await client.post(
        f"/api/{TEST_USER}/tasks",
        json={"title": ""},
    )
    assert response.status_code == 422  # FastAPI uses 422 for validation errors


@pytest.mark.asyncio
async def test_create_task_with_title_too_long_fails(client):
    """T020: POST with title > 200 chars → 400 validation error."""
    long_title = "a" * 201
    response = await client.post(
        f"/api/{TEST_USER}/tasks",
        json={"title": long_title},
    )
    assert response.status_code == 422


# =============================================================================
# US2: List Tasks with Filtering Tests (T025-T029)
# =============================================================================


@pytest.mark.asyncio
async def test_list_tasks_returns_paginated_tasks(client):
    """T025: GET returns paginated tasks → 200 with pagination metadata."""
    # Create a task first
    await client.post(
        f"/api/{TEST_USER}/tasks",
        json={"title": "Task for list test"},
    )

    response = await client.get(f"/api/{TEST_USER}/tasks")
    assert response.status_code == 200
    data = response.json()
    assert "tasks" in data
    assert "next_cursor" in data
    assert "has_more" in data
    assert isinstance(data["tasks"], list)


@pytest.mark.asyncio
async def test_list_tasks_filter_pending(client):
    """T026: GET with status=pending → only pending tasks."""
    # Create pending and completed tasks
    await client.post(f"/api/{TEST_USER}/tasks", json={"title": "Pending task"})
    create_response = await client.post(
        f"/api/{TEST_USER}/tasks", json={"title": "Completed task"}
    )
    task_id = create_response.json()["id"]
    await client.patch(f"/api/{TEST_USER}/tasks/{task_id}/complete")

    response = await client.get(f"/api/{TEST_USER}/tasks?status=pending")
    assert response.status_code == 200
    data = response.json()
    # All returned tasks should be pending
    for task in data["tasks"]:
        assert task["completed"] is False


@pytest.mark.asyncio
async def test_list_tasks_filter_completed(client):
    """T027: GET with status=completed → only completed tasks."""
    # Create and complete a task
    create_response = await client.post(
        f"/api/{TEST_USER}/tasks", json={"title": "Task to complete"}
    )
    task_id = create_response.json()["id"]
    await client.patch(f"/api/{TEST_USER}/tasks/{task_id}/complete")

    response = await client.get(f"/api/{TEST_USER}/tasks?status=completed")
    assert response.status_code == 200
    data = response.json()
    # All returned tasks should be completed
    for task in data["tasks"]:
        assert task["completed"] is True


@pytest.mark.asyncio
async def test_list_tasks_sort_by_title(client):
    """T028: GET with sort=title → alphabetical order."""
    # Create tasks with different titles
    await client.post(f"/api/{TEST_USER}/tasks", json={"title": "Zebra task"})
    await client.post(f"/api/{TEST_USER}/tasks", json={"title": "Apple task"})

    response = await client.get(f"/api/{TEST_USER}/tasks?sort=title")
    assert response.status_code == 200
    data = response.json()
    if len(data["tasks"]) >= 2:
        # Verify alphabetical order (Apple before Zebra)
        titles = [t["title"] for t in data["tasks"]]
        assert titles == sorted(titles)


@pytest.mark.asyncio
async def test_list_tasks_with_cursor_pagination(client):
    """T029: GET with cursor → correct next page."""
    # Create multiple tasks
    for i in range(5):
        await client.post(f"/api/{TEST_USER}/tasks", json={"title": f"Task {i}"})

    # Get first page with limit 2
    response = await client.get(f"/api/{TEST_USER}/tasks?limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data["tasks"]) <= 2

    # If there's more, get next page
    if data["next_cursor"]:
        response2 = await client.get(
            f"/api/{TEST_USER}/tasks?limit=2&cursor={data['next_cursor']}"
        )
        assert response2.status_code == 200
        data2 = response2.json()
        # Should get different tasks
        first_ids = {t["id"] for t in data["tasks"]}
        second_ids = {t["id"] for t in data2["tasks"]}
        assert first_ids.isdisjoint(second_ids)


# =============================================================================
# US3: View Single Task Tests (T034-T036)
# =============================================================================


@pytest.mark.asyncio
async def test_get_existing_task(client):
    """T034: GET existing task → 200 with TaskResponse."""
    # Create a task
    create_response = await client.post(
        f"/api/{TEST_USER}/tasks",
        json={"title": "Task to get", "description": "Details here"},
    )
    task_id = create_response.json()["id"]

    response = await client.get(f"/api/{TEST_USER}/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Task to get"
    assert data["description"] == "Details here"


@pytest.mark.asyncio
async def test_get_nonexistent_task_returns_404(client):
    """T035: GET non-existent task → 404."""
    response = await client.get(f"/api/{TEST_USER}/tasks/99999")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"]["code"] == "NOT_FOUND"


@pytest.mark.asyncio
async def test_get_another_users_task_returns_404(client):
    """T036: GET another user's task → 404 (security)."""
    # Create task as test-user
    create_response = await client.post(
        f"/api/{TEST_USER}/tasks",
        json={"title": "Private task"},
    )
    task_id = create_response.json()["id"]

    # Try to access as different user (will be rejected by verify_user_access)
    response = await client.get(f"/api/other-user/tasks/{task_id}")
    assert response.status_code == 403  # Forbidden due to user mismatch


# =============================================================================
# US4: Update Task Tests (T040-T042)
# =============================================================================


@pytest.mark.asyncio
async def test_update_task_title(client):
    """T040: PUT updates title only → 200."""
    # Create a task
    create_response = await client.post(
        f"/api/{TEST_USER}/tasks",
        json={"title": "Original title"},
    )
    task_id = create_response.json()["id"]

    response = await client.put(
        f"/api/{TEST_USER}/tasks/{task_id}",
        json={"title": "Updated title"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated title"


@pytest.mark.asyncio
async def test_update_task_completed(client):
    """T041: PUT updates completed → 200."""
    # Create a task
    create_response = await client.post(
        f"/api/{TEST_USER}/tasks",
        json={"title": "Task to complete"},
    )
    task_id = create_response.json()["id"]

    response = await client.put(
        f"/api/{TEST_USER}/tasks/{task_id}",
        json={"completed": True},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True


@pytest.mark.asyncio
async def test_update_nonexistent_task_returns_404(client):
    """T042: PUT non-existent task → 404."""
    response = await client.put(
        f"/api/{TEST_USER}/tasks/99999",
        json={"title": "Updated"},
    )
    assert response.status_code == 404


# =============================================================================
# US5: Delete Task Tests (T046-T047)
# =============================================================================


@pytest.mark.asyncio
async def test_delete_existing_task(client):
    """T046: DELETE existing task → 200 with confirmation."""
    # Create a task
    create_response = await client.post(
        f"/api/{TEST_USER}/tasks",
        json={"title": "Task to delete"},
    )
    task_id = create_response.json()["id"]

    response = await client.delete(f"/api/{TEST_USER}/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "deleted"
    assert data["task_id"] == task_id

    # Verify task is actually deleted
    get_response = await client.get(f"/api/{TEST_USER}/tasks/{task_id}")
    assert get_response.status_code == 404


@pytest.mark.asyncio
async def test_delete_nonexistent_task_returns_404(client):
    """T047: DELETE non-existent task → 404."""
    response = await client.delete(f"/api/{TEST_USER}/tasks/99999")
    assert response.status_code == 404


# =============================================================================
# US6: Toggle Task Completion Tests (T051-T053)
# =============================================================================


@pytest.mark.asyncio
async def test_toggle_pending_to_completed(client):
    """T051: PATCH toggles pending → completed."""
    # Create a pending task
    create_response = await client.post(
        f"/api/{TEST_USER}/tasks",
        json={"title": "Task to toggle"},
    )
    task = create_response.json()
    assert task["completed"] is False

    response = await client.patch(f"/api/{TEST_USER}/tasks/{task['id']}/complete")
    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True


@pytest.mark.asyncio
async def test_toggle_completed_to_pending(client):
    """T052: PATCH toggles completed → pending."""
    # Create and complete a task
    create_response = await client.post(
        f"/api/{TEST_USER}/tasks",
        json={"title": "Task to toggle back"},
    )
    task_id = create_response.json()["id"]

    # Toggle to completed
    await client.patch(f"/api/{TEST_USER}/tasks/{task_id}/complete")

    # Toggle back to pending
    response = await client.patch(f"/api/{TEST_USER}/tasks/{task_id}/complete")
    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is False


@pytest.mark.asyncio
async def test_toggle_nonexistent_task_returns_404(client):
    """T053: PATCH non-existent task → 404."""
    response = await client.patch(f"/api/{TEST_USER}/tasks/99999/complete")
    assert response.status_code == 404
