
# todo-console-app/tests/ui/test_dashboard.py
import pytest
from src.tui import TodoApp

@pytest.mark.asyncio
async def test_app_starts_with_task_list(tmp_path):
    # Use temp path to avoid side effects
    store_file = tmp_path / "tasks.json"
    app = TodoApp(store_path=str(store_file))
    async with app.run_test() as pilot:
        # Check if list view exists and is not None
        list_view = app.query_one("#task-list")
        assert list_view is not None

        # Check title
        assert app.title == "Todo App"

@pytest.mark.asyncio
async def test_empty_state_message(tmp_path):
    store_file = tmp_path / "empty_tasks.json"
    app = TodoApp(store_path=str(store_file))
    async with app.run_test() as pilot:
        # Check empty state label visibility
        lbl = app.query_one("#empty-state")
        assert lbl.display is True
        # Verify text content if possible or just existence
        # Check if renderable contains the text "No tasks found" pattern
        # This is implementation detail dependent, but checking display is key
