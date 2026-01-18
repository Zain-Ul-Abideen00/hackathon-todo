"""
Unit tests for MCP chat tools.

Tests the 5 MCP tools that wrap task_service functions:
- add_task
- list_tasks
- complete_task
- delete_task
- update_task
"""

import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch


class MockContext:
    """Mock context wrapper for testing tools."""

    def __init__(self, user_id: str | None = None, session: AsyncMock | None = None):
        self.context = {
            "user_id": user_id,
            "session": session,
        }


@pytest.fixture
def mock_session():
    """Create a mock database session."""
    return AsyncMock()


@pytest.fixture
def mock_context_authenticated(mock_session):
    """Create an authenticated context with user_id."""
    return MockContext(user_id="test-user-123", session=mock_session)


@pytest.fixture
def mock_context_unauthenticated():
    """Create an unauthenticated context (no user_id)."""
    return MockContext(user_id=None, session=None)


def parse_result(result) -> dict:
    """Parse tool result, handling both dict and string returns."""
    if isinstance(result, dict):
        return result
    if isinstance(result, str):
        try:
            return json.loads(result)
        except json.JSONDecodeError:
            return {"raw": result}
    return {"raw": str(result)}


class TestAddTask:
    """Tests for add_task MCP tool."""

    @pytest.mark.asyncio
    async def test_add_task_creates_task(self, mock_context_authenticated, mock_session):
        """Test that add_task creates a task via task_service."""
        from src.chat.tools import add_task

        # Mock task_service.create_task
        mock_task = MagicMock()
        mock_task.id = 1
        mock_task.title = "Buy groceries"

        with patch("src.chat.tools.task_service.create_task", new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_task

            result = await add_task.on_invoke_tool(
                mock_context_authenticated,
                '{"title": "Buy groceries", "description": "Get milk and eggs"}',
            )

            data = parse_result(result)
            assert "status" in data or "task_id" in data or "created" in str(data)

    @pytest.mark.asyncio
    async def test_add_task_requires_user_id(self, mock_context_unauthenticated):
        """Test that add_task returns error without authentication."""
        from src.chat.tools import add_task

        result = await add_task.on_invoke_tool(
            mock_context_unauthenticated,
            '{"title": "Test task"}',
        )

        data = parse_result(result)
        assert "error" in data, "Should return error dict when not authenticated"


class TestListTasks:
    """Tests for list_tasks MCP tool."""

    @pytest.mark.asyncio
    async def test_list_tasks_returns_user_tasks(self, mock_context_authenticated, mock_session):
        """Test that list_tasks returns tasks for the user."""
        from src.chat.tools import list_tasks

        # Mock task_service.list_tasks_by_user
        mock_tasks = [
            MagicMock(id=1, title="Task 1", completed=False, priority="medium"),
            MagicMock(id=2, title="Task 2", completed=True, priority="high"),
        ]

        with patch("src.chat.tools.task_service.list_tasks_by_user", new_callable=AsyncMock) as mock_list:
            mock_list.return_value = mock_tasks

            result = await list_tasks.on_invoke_tool(
                mock_context_authenticated,
                '{"status": "all"}',
            )

            data = parse_result(result)
            assert "tasks" in data or "count" in data

    @pytest.mark.asyncio
    async def test_list_tasks_requires_user_id(self, mock_context_unauthenticated):
        """Test that list_tasks returns error without authentication."""
        from src.chat.tools import list_tasks

        result = await list_tasks.on_invoke_tool(
            mock_context_unauthenticated,
            '{}',
        )

        data = parse_result(result)
        assert "error" in data, "Should return error dict when not authenticated"


class TestCompleteTask:
    """Tests for complete_task MCP tool."""

    @pytest.mark.asyncio
    async def test_complete_task_toggles_status(self, mock_context_authenticated, mock_session):
        """Test that complete_task toggles task completion."""
        from src.chat.tools import complete_task

        mock_task = MagicMock()
        mock_task.id = 1
        mock_task.title = "Test task"
        mock_task.completed = True

        with patch("src.chat.tools.task_service.toggle_task_completion", new_callable=AsyncMock) as mock_toggle:
            mock_toggle.return_value = mock_task

            result = await complete_task.on_invoke_tool(
                mock_context_authenticated,
                '{"task_id": 1}',
            )

            data = parse_result(result)
            assert "status" in data or "completed" in str(data)

    @pytest.mark.asyncio
    async def test_complete_task_requires_user_id(self, mock_context_unauthenticated):
        """Test that complete_task returns error without authentication."""
        from src.chat.tools import complete_task

        result = await complete_task.on_invoke_tool(
            mock_context_unauthenticated,
            '{"task_id": 1}',
        )

        data = parse_result(result)
        assert "error" in data, "Should return error dict when not authenticated"


class TestDeleteTask:
    """Tests for delete_task MCP tool."""

    @pytest.mark.asyncio
    async def test_delete_task_removes_task(self, mock_context_authenticated, mock_session):
        """Test that delete_task removes a task."""
        from src.chat.tools import delete_task

        mock_task = MagicMock()
        mock_task.id = 1
        mock_task.title = "Task to delete"

        with patch("src.chat.tools.task_service.get_task", new_callable=AsyncMock) as mock_get:
            with patch("src.chat.tools.task_service.delete_task", new_callable=AsyncMock) as mock_del:
                mock_get.return_value = mock_task
                mock_del.return_value = True

                result = await delete_task.on_invoke_tool(
                    mock_context_authenticated,
                    '{"task_id": 1}',
                )

                data = parse_result(result)
                assert "status" in data or "deleted" in str(data)

    @pytest.mark.asyncio
    async def test_delete_task_requires_user_id(self, mock_context_unauthenticated):
        """Test that delete_task returns error without authentication."""
        from src.chat.tools import delete_task

        result = await delete_task.on_invoke_tool(
            mock_context_unauthenticated,
            '{"task_id": 1}',
        )

        data = parse_result(result)
        assert "error" in data, "Should return error dict when not authenticated"


class TestUpdateTask:
    """Tests for update_task MCP tool."""

    @pytest.mark.asyncio
    async def test_update_task_modifies_fields(self, mock_context_authenticated, mock_session):
        """Test that update_task modifies task fields."""
        from src.chat.tools import update_task

        mock_task = MagicMock()
        mock_task.id = 1
        mock_task.title = "Updated title"

        with patch("src.chat.tools.task_service.update_task", new_callable=AsyncMock) as mock_update:
            mock_update.return_value = mock_task

            result = await update_task.on_invoke_tool(
                mock_context_authenticated,
                '{"task_id": 1, "title": "Updated title"}',
            )

            data = parse_result(result)
            assert "status" in data or "updated" in str(data)

    @pytest.mark.asyncio
    async def test_update_task_requires_user_id(self, mock_context_unauthenticated):
        """Test that update_task returns error without authentication."""
        from src.chat.tools import update_task

        result = await update_task.on_invoke_tool(
            mock_context_unauthenticated,
            '{"task_id": 1, "title": "New title"}',
        )

        data = parse_result(result)
        assert "error" in data, "Should return error dict when not authenticated"


class TestToolsRequireUserID:
    """Test that all tools properly validate user authentication."""

    @pytest.mark.asyncio
    async def test_all_tools_require_user_id(self, mock_context_unauthenticated):
        """Test that all tools return auth error without user_id."""
        from src.chat.tools import add_task, list_tasks, complete_task, delete_task, update_task

        tools = [
            (add_task, '{"title": "Test"}'),
            (list_tasks, '{}'),
            (complete_task, '{"task_id": 1}'),
            (delete_task, '{"task_id": 1}'),
            (update_task, '{"task_id": 1, "title": "New"}'),
        ]

        for tool, args in tools:
            result = await tool.on_invoke_tool(mock_context_unauthenticated, args)
            data = parse_result(result)
            assert "error" in data, f"{tool.name} should return error dict when not authenticated"
