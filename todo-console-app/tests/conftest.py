
# todo-console-app/tests/conftest.py
import pytest
import sys
import os

# Add project root to python path to allow imports like 'from src.models import ...'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

@pytest.fixture
def sample_task_data():
    return {
        "title": "Test Task",
        "description": "Description",
        "status": "pending"
    }

# Add textual app fixture support if needed beyond pytest-textual defaults
