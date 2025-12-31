
# todo-console-app/src/store.py
import json
import os
import tempfile
from typing import List
from .models import Task

class JSONTaskStore:
    def __init__(self, filepath: str):
        self.filepath = filepath

    def load(self) -> List[Task]:
        """Load tasks from the JSON file. Returns empty list if missing or corrupt."""
        if not os.path.exists(self.filepath):
            return []
        try:
            with open(self.filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [Task.model_validate(item) for item in data]
        except (json.JSONDecodeError, OSError, ValueError):
            # Return empty list on corruption to allow app recovery/reset
            return []

    def save(self, tasks: List[Task]) -> None:
        """Save tasks to JSON file atomically."""
        # Convert to list of dicts using Pydantic's serialization
        content = json.dumps([task.model_dump(mode='json') for task in tasks], indent=2)

        # Ensure directory exists (if not current dir)
        dir_name = os.path.dirname(os.path.abspath(self.filepath))
        # If dir_name is empty (relative path like "tasks.json"), abspath handles it.

        # Atomic write pattern: Write to temp -> Rename
        # delete=False needed for Windows to allow close() before rename()
        try:
            with tempfile.NamedTemporaryFile("w", dir=dir_name, delete=False, encoding="utf-8") as tmp:
                tmp.write(content)
                temp_path = tmp.name

            os.replace(temp_path, self.filepath)
        except OSError:
            # Attempt cleanup if rename fails
            if os.path.exists(temp_path):
                os.remove(temp_path)
            raise
