
# todo-console-app/tests/ui/test_filters.py
import pytest
import json
from src.tui import TodoApp

@pytest.mark.asyncio
async def test_filter_tasks(tmp_path):
    store_file = tmp_path / "tasks.json"
    app = TodoApp(store_path=str(store_file))

    # Populate mixed tasks
    data = [
        {"id": "123e4567-e89b-12d3-a456-426614174001", "title": "Pending 1", "status": "pending", "created_at": "2025-01-01T10:00:00"},
        {"id": "123e4567-e89b-12d3-a456-426614174002", "title": "Done 1", "status": "completed", "created_at": "2025-01-01T11:00:00"},
        {"id": "123e4567-e89b-12d3-a456-426614174003", "title": "Pending 2", "status": "pending", "created_at": "2025-01-01T12:00:00"}
    ]
    store_file.write_text(json.dumps(data))

    async with app.run_test() as pilot:
        # Default: Pending first? Requirements say "Grouped by status (Pending First)".
        # Usually Dashboard shows ALL unless filtered.
        # But sorting requirement FR-008 says: "Grouped by status (Pending first), then sorted by creation date".
        # This applies to the list order.
        # US4 is about "Filtering" (showing ONLY pending or ONLY completed).

        # Initial: All tasks shown
        assert len(app.query("TaskItem")) == 3

        # Switch to "Pending" tab
        await pilot.click("#tab-pending")
        assert len(app.query("TaskItem")) == 2
        assert "Done 1" not in [t.todo_task.title for t in app.query("TaskItem")]

        # Switch to "Completed" tab
        await pilot.click("#tab-completed")
        assert len(app.query("TaskItem")) == 1
        assert "Done 1" in [t.todo_task.title for t in app.query("TaskItem")]

        # Switch back to "All"
        await pilot.click("#tab-all")
        assert len(app.query("TaskItem")) == 3
