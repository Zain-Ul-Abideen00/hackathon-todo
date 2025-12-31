# Data Model: Todo TUI App

## Entities

### Task

Core unit of work in the application.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | `UUID` | Yes | `uuid4()` | Unique identifier. |
| `title` | `str` | Yes | - | Brief summary of the task. Min length 1. |
| `description` | `str` | No | `""` | Detailed notes. |
| `status` | `str` | Yes | `"pending"` | Status: "pending" or "completed". |
| `created_at` | `datetime`| Yes | `utcnow()`| Creation timestamp. |

## Pydantic Models (`src/models.py`)

```python
from enum import Enum
from uuid import UUID, uuid4
from datetime import datetime
from pydantic import BaseModel, Field

class TaskStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"

class Task(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: str = Field(..., min_length=1)
    description: str = ""
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

## Persistence Schema (`tasks.json`)

The file will store a list of tasks.

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Buy milk",
    "description": "2% organic",
    "status": "pending",
    "created_at": "2025-12-31T12:00:00Z"
  }
]
```
