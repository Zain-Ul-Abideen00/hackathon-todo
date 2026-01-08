"""Tests for Task CRUD operations and user isolation.

Tests cover:
- Task persistence (US1)
- User data isolation (US2)
- Status filtering (US4)
"""

import uuid

import pytest

from src.models import TaskCreate, TaskUpdate
from src.services import (
    create_task,
    delete_task,
    get_task,
    list_tasks_by_user,
    update_task,
)


def generate_user_id() -> str:
    """Generate a unique test user ID."""
    return f"test-user-{uuid.uuid4().hex[:8]}"


# ============================================================================
# User Story 1: Task Persistence
# ============================================================================


@pytest.mark.asyncio
async def test_create_task(session):
    """Test creating a task assigns ID and timestamps."""
    user_id = generate_user_id()
    task_data = TaskCreate(title="Buy groceries", description="Milk, eggs, bread")

    task = await create_task(session, task_data, user_id)

    assert task.id is not None
    assert task.user_id == user_id
    assert task.title == "Buy groceries"
    assert task.description == "Milk, eggs, bread"
    assert task.completed is False
    assert task.created_at is not None
    assert task.updated_at is not None


@pytest.mark.asyncio
async def test_create_task_without_description(session):
    """Test creating a task without description stores null."""
    user_id = generate_user_id()
    task_data = TaskCreate(title="Simple task")

    task = await create_task(session, task_data, user_id)

    assert task.id is not None
    assert task.description is None


@pytest.mark.asyncio
async def test_read_task(session):
    """Test reading a task by ID returns correct data."""
    user_id = generate_user_id()
    task_data = TaskCreate(title="Read me")

    created = await create_task(session, task_data, user_id)
    retrieved = await get_task(session, created.id, user_id)

    assert retrieved is not None
    assert retrieved.id == created.id
    assert retrieved.title == "Read me"


@pytest.mark.asyncio
async def test_update_task(session):
    """Test updating task title and description persists changes."""
    user_id = generate_user_id()
    task_data = TaskCreate(title="Original title", description="Original description")

    task = await create_task(session, task_data, user_id)
    original_updated_at = task.updated_at

    update_data = TaskUpdate(title="Updated title", description="Updated description")
    updated = await update_task(session, task.id, user_id, update_data)

    assert updated is not None
    assert updated.title == "Updated title"
    assert updated.description == "Updated description"
    assert updated.updated_at >= original_updated_at


@pytest.mark.asyncio
async def test_update_task_completion_status(session):
    """Test marking a task as completed."""
    user_id = generate_user_id()
    task_data = TaskCreate(title="Complete me")

    task = await create_task(session, task_data, user_id)
    assert task.completed is False

    update_data = TaskUpdate(completed=True)
    updated = await update_task(session, task.id, user_id, update_data)

    assert updated is not None
    assert updated.completed is True


@pytest.mark.asyncio
async def test_delete_task(session):
    """Test deleting a task removes it from database."""
    user_id = generate_user_id()
    task_data = TaskCreate(title="Delete me")

    task = await create_task(session, task_data, user_id)
    deleted = await delete_task(session, task.id, user_id)

    assert deleted is True

    retrieved = await get_task(session, task.id, user_id)
    assert retrieved is None


# ============================================================================
# User Story 2: User Data Isolation
# ============================================================================


@pytest.mark.asyncio
async def test_list_tasks_by_user(session):
    """Test listing tasks returns only user's own tasks."""
    user_a = generate_user_id()
    user_b = generate_user_id()

    # Create tasks for User A
    for i in range(3):
        await create_task(session, TaskCreate(title=f"User A Task {i}"), user_a)

    # Create tasks for User B
    for i in range(2):
        await create_task(session, TaskCreate(title=f"User B Task {i}"), user_b)

    tasks_a = await list_tasks_by_user(session, user_a)
    tasks_b = await list_tasks_by_user(session, user_b)

    assert len(tasks_a) == 3
    assert len(tasks_b) == 2
    assert all(t.user_id == user_a for t in tasks_a)
    assert all(t.user_id == user_b for t in tasks_b)


@pytest.mark.asyncio
async def test_get_task_wrong_user(session):
    """Test accessing another user's task returns None."""
    user_a = generate_user_id()
    user_b = generate_user_id()

    task_data = TaskCreate(title="User A's private task")
    task = await create_task(session, task_data, user_a)

    # User B tries to access User A's task
    retrieved = await get_task(session, task.id, user_b)
    assert retrieved is None


@pytest.mark.asyncio
async def test_update_task_wrong_user(session):
    """Test updating another user's task fails."""
    user_a = generate_user_id()
    user_b = generate_user_id()

    task = await create_task(session, TaskCreate(title="User A's task"), user_a)

    # User B tries to update User A's task
    result = await update_task(session, task.id, user_b, TaskUpdate(title="Hacked"))
    assert result is None

    # Verify task is unchanged
    original = await get_task(session, task.id, user_a)
    assert original.title == "User A's task"


@pytest.mark.asyncio
async def test_delete_task_wrong_user(session):
    """Test deleting another user's task fails."""
    user_a = generate_user_id()
    user_b = generate_user_id()

    task = await create_task(session, TaskCreate(title="User A's task"), user_a)

    # User B tries to delete User A's task
    deleted = await delete_task(session, task.id, user_b)
    assert deleted is False

    # Verify task still exists
    original = await get_task(session, task.id, user_a)
    assert original is not None


@pytest.mark.asyncio
async def test_list_tasks_empty_user(session):
    """Test listing tasks for user with no tasks returns empty list."""
    new_user = generate_user_id()

    tasks = await list_tasks_by_user(session, new_user)
    assert tasks == []


# ============================================================================
# User Story 4: Status Filtering
# ============================================================================


@pytest.mark.asyncio
async def test_filter_by_completed(session):
    """Test filtering tasks by completed status."""
    user_id = generate_user_id()

    # Create completed tasks
    for i in range(5):
        task = await create_task(session, TaskCreate(title=f"Completed {i}"), user_id)
        await update_task(session, task.id, user_id, TaskUpdate(completed=True))

    # Create pending tasks
    for i in range(3):
        await create_task(session, TaskCreate(title=f"Pending {i}"), user_id)

    completed_tasks = await list_tasks_by_user(session, user_id, completed=True)
    pending_tasks = await list_tasks_by_user(session, user_id, completed=False)

    assert len(completed_tasks) == 5
    assert len(pending_tasks) == 3
    assert all(t.completed is True for t in completed_tasks)
    assert all(t.completed is False for t in pending_tasks)


@pytest.mark.asyncio
async def test_filter_combined(session):
    """Test filtering by both user_id and completed status."""
    user_a = generate_user_id()
    user_b = generate_user_id()

    # User A: 2 completed, 1 pending
    task_a1 = await create_task(session, TaskCreate(title="A1"), user_a)
    await update_task(session, task_a1.id, user_a, TaskUpdate(completed=True))
    task_a2 = await create_task(session, TaskCreate(title="A2"), user_a)
    await update_task(session, task_a2.id, user_a, TaskUpdate(completed=True))
    await create_task(session, TaskCreate(title="A3"), user_a)

    # User B: 1 completed
    task_b1 = await create_task(session, TaskCreate(title="B1"), user_b)
    await update_task(session, task_b1.id, user_b, TaskUpdate(completed=True))

    # Filter User A's completed tasks
    result = await list_tasks_by_user(session, user_a, completed=True)

    assert len(result) == 2
    assert all(t.user_id == user_a for t in result)
    assert all(t.completed is True for t in result)
