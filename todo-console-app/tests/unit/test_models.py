
# todo-console-app/tests/unit/test_models.py
import pytest
from uuid import UUID
from datetime import datetime
from src.models import Task, TaskStatus

def test_task_creation_defaults():
    task = Task(title="Buy Milk")
    assert task.title == "Buy Milk"
    assert task.description == ""
    assert task.status == TaskStatus.PENDING
    assert isinstance(task.id, UUID)
    assert isinstance(task.created_at, datetime)

def test_task_full_init():
    task = Task(title="Test", description="Desc", status=TaskStatus.COMPLETED)
    assert task.title == "Test"
    assert task.description == "Desc"
    assert task.status == TaskStatus.COMPLETED

def test_task_validation_title_required():
    with pytest.raises(ValueError):
        Task(title="")

def test_task_status_enum():
    task = Task(title="Test", status="completed")
    assert task.status == TaskStatus.COMPLETED
