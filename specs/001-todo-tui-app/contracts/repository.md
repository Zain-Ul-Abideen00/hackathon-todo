# Repository Interface: TaskStore

**Module**: `src/store.py`

## Abstract Interface

```python
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from .models import Task

class TaskStore(ABC):
    @abstractmethod
    def load(self) -> List[Task]:
        """Load all tasks from storage."""
        pass

    @abstractmethod
    def save(self, tasks: List[Task]) -> None:
        """Save the current list of tasks to storage."""
        pass

    # Optional helper methods (can be implemented in concrete or abstract base)
    # def add(self, task: Task) -> None: ...
    # def delete(self, task_id: UUID) -> None: ...
```

## Concrete Implementation: `JSONTaskStore`

- **Constructor**: `__init__(self, filepath: str)`
- **Behavior**:
  - `load()`: Read JSON. If file missing/invalid, return empty list. Validate with Pydantic adapter.
  - `save()`: Serialize list using `model_dump_json`, write atomically to `filepath`.

## Functional "API" (Used by TUI)

The TUI will interact with the Store instance.

- `get_all_tasks() -> List[Task]`
- `add_task(title: str, description: str) -> Task`
- `update_task(task: Task) -> None`
- `delete_task(task_id: UUID) -> None`
- `toggle_status(task_id: UUID) -> Task`
