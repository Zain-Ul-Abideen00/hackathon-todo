import pytest
import json
from src.tui import TodoApp
from src.models import Task, TaskStatus

@pytest.mark.asyncio
async def test_complete_task(tmp_path):
    store_file = tmp_path / "tasks.json"
    app = TodoApp(store_path=str(store_file))

    # Pre-populate store (using store instance directly? or just file)
    import json
    task_id = "123e4567-e89b-12d3-a456-426614174000"
    data = [{
        "id": task_id,
        "title": "Task to Complete",
        "description": "",
        "status": "pending",
        "created_at": "2025-12-31T12:00:00Z"
    }]
    store_file.write_text(json.dumps(data))

    async with app.run_test() as pilot:
        # Check initial state
        list_view = app.query_one("ListView")
        assert len(list_view.children) == 1

        # Select item (it's first, so should be highlighted or just press 'c' on it)
        # By default first item is highlighted if focus is on list
        await pilot.press("down") # Ensure focus or rely on auto-focus

        # Press 'c'
        await pilot.press("c")

        # Verify persistence
        new_data = json.loads(store_file.read_text())
        assert new_data[0]["status"] == "completed"

@pytest.mark.asyncio
async def test_delete_task_with_confirmation(tmp_path):
    store_file = tmp_path / "tasks.json"
    app = TodoApp(store_path=str(store_file))

    # Pre-populate
    task_id = "123e4567-e89b-12d3-a456-426614174000"
    data = [{
        "id": task_id,
        "title": "Task to Delete",
        "status": "pending",
        "created_at": "2025-12-31T12:00:00Z"
    }]
    store_file.write_text(json.dumps(data))

    async with app.run_test() as pilot:
        await pilot.press("d")

        # Should show Confirmation Modal
        assert app.query("ConfirmModal")

        # Press confirm (assuming 'y' or button click)
        await pilot.click("#confirm-btn")

        # Start screen should be clear
        assert len(app.query("TaskItem")) == 0

        # Persistence check
        new_data = json.loads(store_file.read_text())
        assert len(new_data) == 0

@pytest.mark.asyncio
async def test_edit_task(tmp_path):
    store_file = tmp_path / "tasks.json"
    app = TodoApp(store_path=str(store_file))
    # Populate
    data = [{"id": "123e4567-e89b-12d3-a456-426614174001", "title": "Old Title", "status": "pending", "created_at": "2025-01-01T00:00:00"}]
    store_file.write_text(json.dumps(data))

    async with app.run_test() as pilot:
        await pilot.press("e")

        # Edit modal should appear with pre-filled value
        assert app.query("TaskModal")
        input = app.query_one("#title-input")
        assert input.value == "Old Title"

        # Change value
        input.value = "New Title"
        await pilot.press("enter") # Assuming enter submits

        # Verify persistence
        new_data = json.loads(store_file.read_text())
        assert new_data[0]["title"] == "New Title"
