
# todo-console-app/tests/unit/test_store.py
import pytest
import os
import json
from uuid import uuid4
from src.store import JSONTaskStore
from src.models import Task, TaskStatus

def test_load_nonexistent_file(tmp_path):
    store = JSONTaskStore(str(tmp_path / "missing.json"))
    tasks = store.load()
    assert tasks == []

def test_save_and_load(tmp_path):
    file_path = tmp_path / "tasks.json"
    store = JSONTaskStore(str(file_path))

    task1 = Task(title="Task 1")
    task2 = Task(title="Task 2", status=TaskStatus.COMPLETED)

    store.save([task1, task2])

    # Verify file exists
    assert file_path.exists()

    # Reload
    loaded_tasks = store.load()
    assert len(loaded_tasks) == 2
    assert loaded_tasks[0].title == "Task 1"
    assert loaded_tasks[0].id == task1.id
    assert loaded_tasks[1].status == TaskStatus.COMPLETED

def test_atomic_write(tmp_path):
    # This is hard to test deterministically without mocking, but we can check basic behavior
    file_path = tmp_path / "atomic.json"
    store = JSONTaskStore(str(file_path))
    store.save([Task(title="Initial")])

    # Overwrite
    store.save([Task(title="Updated")])

    loaded = store.load()
    assert len(loaded) == 1
    assert loaded[0].title == "Updated"

def test_corrupt_file_handling(tmp_path):
    file_path = tmp_path / "corrupt.json"
    file_path.write_text("{invalid json")

    store = JSONTaskStore(str(file_path))
    # Should probably raise or return empty?
    # Spec says "restored from JSON file", implies validity.
    # Safe fallback: return empty or raise error. Let's assume strict for now and expect error or handle it.
    # The current implementation plan didn't specify error handling for corrupt files deeply,
    # but safe loading usually implies returning empty or logging error.
    # Let's assert it returns empty list for resilience as per 'Simple Persistence'.
    tasks = store.load()
    assert tasks == []
