# Quickstart: Chat Persistence & Testing

## Prerequisites

- Python 3.12+ with uv installed
- PostgreSQL database (Neon) with connection string
- Backend server running locally
- Alembic configured

## Step-by-Step Setup

### 1. Create Database Models

Create `src/models/chatkit.py`:

```python
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone


class ChatKitThread(SQLModel, table=True):
    __tablename__ = "chatkit_threads"
    id: str = Field(primary_key=True)
    user_id: str | None = Field(default=None, index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    metadata: dict = Field(default={}, sa_column=Column(JSONB, default={}))


class ChatKitItem(SQLModel, table=True):
    __tablename__ = "chatkit_items"
    id: str = Field(primary_key=True)
    thread_id: str = Field(foreign_key="chatkit_threads.id", index=True)
    type: str
    content: dict = Field(default={}, sa_column=Column(JSONB, default={}))
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
```

### 2. Update Model Exports

Edit `src/models/__init__.py`:

```python
from .task import Task
from .chatkit import ChatKitThread, ChatKitItem

__all__ = ["Task", "ChatKitThread", "ChatKitItem"]
```

### 3. Generate Migration

```bash
cd todo-web-app/backend
uv run alembic revision --autogenerate -m "add_chatkit_tables"
```

### 4. Apply Migration

```bash
uv run alembic upgrade head
```

### 5. Implement PostgresStore

Update `src/chat/store.py` to add PostgresStore class (see plan.md for implementation).

### 6. Update Server

Update `src/chat/server.py` to use PostgresStore instead of InMemoryStore.

### 7. Run Tests

```bash
# Run all tests with coverage
uv run pytest -v --cov=src --cov-report=term-missing

# Run specific test files
uv run pytest tests/test_postgres_store.py -v
uv run pytest tests/test_chat.py -v
```

## Verification Checklist

- [ ] Tables `chatkit_threads` and `chatkit_items` exist in database
- [ ] Sending a chat message creates a thread in the database
- [ ] Restarting the server preserves conversation history
- [ ] User A cannot see User B's threads
- [ ] Test coverage ≥80% for chat module

## Common Commands

```bash
# Start development server
cd todo-web-app/backend
uv run uvicorn src.main:app --reload

# Check database tables
psql $DATABASE_URL -c "\\dt chatkit*"

# Run single test
uv run pytest tests/test_postgres_store.py::TestPostgresStore::test_load_thread_creates_new -v

# Generate coverage report
uv run pytest --cov=src/chat --cov-report=html
```

## Troubleshooting

**Migration fails:**
- Ensure DATABASE_URL is set correctly
- Check that ChatKitThread and ChatKitItem are imported in models/__init__.py

**Tests fail with session errors:**
- Run `uv sync` to install dependencies
- Ensure test database is accessible

**Conversations not persisting:**
- Verify PostgresStore is being used (check server.py)
- Check for errors in server logs
