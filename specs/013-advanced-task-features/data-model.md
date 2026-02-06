# Data Model & API Contracts

## 1. Database Schema (SQLModel)

### Tag System

```python
class Tag(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)  # From BetterAuth
    name: str = Field(max_length=50)
    color: str = Field(default="3B82F6", max_length=7)  # Hex without # (or with, handled by val)
    created_at: datetime = Field(default_factory=utc_now)

class TaskTag(SQLModel, table=True):
    task_id: int = Field(foreign_key="task.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)
```

### Recurrence System

```python
class RecurringPattern(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="task.id", unique=True)
    pattern: str = Field(index=True) # "daily", "weekly", "monthly", "yearly"
    interval: int = Field(default=1)  # Every N periods
    end_date: datetime | None = None
    created_at: datetime = Field(default_factory=utc_now)
```

### Reminder & Notification System

```python
class Reminder(SQLModel, table=True):
    """Configuration: When to remind"""
    id: int | None = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="task.id", index=True)
    user_id: str = Field(index=True) # Denormalized for efficiency
    offset_minutes: int # e.g. 60 (1 hour before), 1440 (1 day)
    triggered: bool = Field(default=False) # Processed by Dapr?

class Notification(SQLModel, table=True):
    """Delivered Alert: Inbox item"""
    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    task_id: int | None = Field(foreign_key="task.id", nullable=True)
    title: str
    message: str
    is_read: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=utc_now)
```

## 2. API Contracts

### Tags API (`/api/tags`)

- `GET /` -> `list[Tag]`
- `POST /` -> `Tag` (Body: `{name, color}`)
- `DELETE /{id}` -> `204 No Content`
- `POST /tasks/{id}/tags/{tag_id}` -> `200 OK` (Assign)
- `DELETE /tasks/{id}/tags/{tag_id}` -> `204 No Content` (Unassign)

### Recurring API (`/api/tasks` extension)

- `POST /tasks` body enhanced:
  ```json
  {
    "title": "...",
    "recurring": { "pattern": "weekly", "interval": 1 }
  }
  ```

### Notifications API (`/api/notifications`)

- `GET /` -> `list[Notification]` (Query: `unread_only=true`)
- `PATCH /{id}/read` -> `Notification` (Mark Read)
- `DELETE /{id}` -> `204` (Delete single)
- `DELETE /` -> `204` (Delete all or Clear Read?)
  - Clarified to "Clear All" in spec.
  - Endpoint: `DELETE /?all=true`

### Reminders API (`/api/reminders` - Internal/Config)

- `POST /tasks/{id}/reminders` -> `Reminder`
- `GET /tasks/{id}/reminders` -> `list[Reminder]`
- `DELETE /reminders/{id}` -> `204`
