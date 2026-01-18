# Implementation Plan: Chat Persistence & Testing

**Branch**: `009-chat-persistence` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-chat-persistence/spec.md`

## Summary

Implement database persistence for ChatKit conversations using PostgreSQL, replacing the current InMemoryStore with a PostgresStore. Add database models (ChatKitThread, ChatKitItem), create Alembic migration, update the ChatKit server to use PostgresStore, and expand test coverage to ≥80%.

---

## Technical Context

**Language/Version**: Python 3.12+
**Primary Dependencies**: FastAPI, SQLModel, asyncpg, openai-chatkit, openai-agents, LiteLLM
**Storage**: Neon PostgreSQL with Alembic migrations
**Testing**: pytest with pytest-asyncio
**Target Platform**: Linux server (Railway/Render deployment)
**Project Type**: Web application (backend focus)
**Performance Goals**: SSE streaming responses, <5s title generation
**Constraints**: User isolation required, 80% test coverage target
**Scale/Scope**: Multi-user todo app with chat persistence

---

## Constitution Check

*GATE: Verified against constitution.md principles*

| Gate | Status | Notes |
|------|--------|-------|
| XVI. Conversation Persistence | ✅ PASS | Schema matches constitution (chatkit_threads, chatkit_items) |
| III. Database Architecture | ✅ PASS | Using Alembic migrations, SQLModel, JSONB for metadata |
| IV. Authentication | ✅ PASS | User isolation via user_id in all queries |
| VI. TDD | ✅ PASS | Plan includes unit + integration tests, 80% coverage target |
| VII. Type Safety | ✅ PASS | SQLModel with Pydantic validation on all models |
| XII. Agentic Development | ✅ PASS | Using building-with-sqlmodel-async skill |

---

## Project Structure

### Documentation (this feature)

```text
specs/009-chat-persistence/
├── plan.md              # This file
├── research.md          # Phase 0 output (not needed - patterns known)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
todo-web-app/backend/
├── src/
│   ├── models/
│   │   ├── task.py          # Existing Task model
│   │   └── chatkit.py       # [NEW] ChatKitThread, ChatKitItem models
│   ├── chat/
│   │   ├── store.py         # [MODIFY] Add PostgresStore class
│   │   └── server.py        # [MODIFY] Use PostgresStore
│   └── ...
├── alembic/
│   └── versions/
│       └── xxx_add_chatkit_tables.py  # [NEW] Migration
└── tests/
    ├── test_chat.py         # [MODIFY] Expand integration tests
    ├── test_chat_tools.py   # [EXISTING] Already has good coverage
    └── test_postgres_store.py # [NEW] Unit tests for PostgresStore
```

---

## Proposed Changes

### Component 1: Database Models

#### [NEW] [chatkit.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/models/chatkit.py)

Create SQLModel classes for ChatKit persistence:

```python
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone


class ChatKitThread(SQLModel, table=True):
    """Chat conversation thread."""
    __tablename__ = "chatkit_threads"

    id: str = Field(primary_key=True)
    user_id: str | None = Field(default=None, index=True)  # Nullable for anonymous
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    metadata: dict = Field(default={}, sa_column=Column(JSONB, default={}))


class ChatKitItem(SQLModel, table=True):
    """Message or event in a chat thread."""
    __tablename__ = "chatkit_items"

    id: str = Field(primary_key=True)
    thread_id: str = Field(foreign_key="chatkit_threads.id", index=True)
    type: str  # "message", "tool_call", etc.
    content: dict = Field(default={}, sa_column=Column(JSONB, default={}))
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
```

---

### Component 2: Alembic Migration

#### [NEW] Migration file (auto-generated via `alembic revision --autogenerate`)

Creates tables:
- `chatkit_threads` with columns: id (TEXT PK), user_id (TEXT, indexed), created_at (TIMESTAMPTZ), metadata (JSONB)
- `chatkit_items` with columns: id (TEXT PK), thread_id (TEXT FK with CASCADE), type (TEXT), content (JSONB), created_at (TIMESTAMPTZ)
- Index on `chatkit_items.thread_id` for efficient queries

---

### Component 3: PostgresStore Implementation

#### [MODIFY] [store.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/chat/store.py)

Add PostgresStore class implementing ChatKit Store protocol with database persistence:

- `load_thread()`: Load from DB or create new thread with user_id from context
- `save_thread()`: Upsert thread including metadata (title)
- `add_thread_item()`: Insert item with thread_id FK
- `load_thread_items()`: Paginated query with after cursor
- `load_threads()`: List user's threads with user isolation
- `delete_thread()`: Delete thread (items cascade)

Uses async SQLModel session from existing `get_session` dependency.

---

### Component 4: Server Integration

#### [MODIFY] [server.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/chat/server.py)

Update to use PostgresStore:
- Create PostgresStore instance with session factory
- Update server instantiation: `server = TodoChatKitServer(store=postgres_store)`
- Ensure auto-title generation saves to database via store

---

### Component 5: Model Registration

#### [MODIFY] [models/__init__.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/models/__init__.py)

Add ChatKitThread and ChatKitItem to model exports for Alembic autodiscovery.

---

### Component 6: Test Suite Expansion

#### [NEW] [test_postgres_store.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/tests/test_postgres_store.py)

Unit tests for PostgresStore methods:
- `test_load_thread_creates_new`
- `test_load_thread_returns_existing`
- `test_save_thread_updates_metadata`
- `test_add_thread_item_persists`
- `test_load_threads_user_isolation`
- `test_delete_thread_cascades_items`

#### [MODIFY] [test_chat.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/tests/test_chat.py)

Add integration tests:
- `test_thread_respond_creates_thread`
- `test_thread_persists_after_request`
- `test_user_isolation_between_users`

---

## Verification Plan

### Automated Tests

**Command to run all tests:**
```bash
cd todo-web-app/backend
uv run pytest -v --cov=src --cov-report=term-missing
```

**Individual test files:**
```bash
# Unit tests for PostgresStore
uv run pytest tests/test_postgres_store.py -v

# Integration tests for chat endpoint
uv run pytest tests/test_chat.py -v

# MCP tools tests (existing)
uv run pytest tests/test_chat_tools.py -v
```

**Coverage target:** ≥80% for `src/chat/` module

---

### Manual Verification

1. **Migration verification:**
   ```bash
   cd todo-web-app/backend
   uv run alembic upgrade head
   ```
   - Verify tables `chatkit_threads` and `chatkit_items` exist in database

2. **Persistence verification:**
   - Start backend: `uv run uvicorn src.main:app --reload`
   - Start frontend: `cd ../frontend && pnpm dev`
   - Log in as user, send chat message
   - **Restart backend server**
   - Refresh frontend page
   - Verify conversation history is restored

3. **User isolation verification:**
   - Log in as User A, create conversation
   - Log out, log in as User B
   - Verify User A's conversation is NOT visible

---

## Data Model

### chatkit_threads

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | TEXT | PRIMARY KEY | UUID format: `thread_xxx` |
| user_id | TEXT | INDEX, NULLABLE | NULL for anonymous users |
| created_at | TIMESTAMPTZ | NOT NULL | UTC timezone |
| metadata | JSONB | DEFAULT {} | Contains `title`, preferences |

### chatkit_items

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | TEXT | PRIMARY KEY | UUID format: `message_xxx` |
| thread_id | TEXT | FK → chatkit_threads.id, CASCADE DELETE | Index for queries |
| type | TEXT | NOT NULL | "message", "tool_call", etc. |
| content | JSONB | DEFAULT {} | Message content |
| created_at | TIMESTAMPTZ | NOT NULL | UTC timezone |

---

## Quickstart

### 1. Create models

```bash
# Create src/models/chatkit.py with ChatKitThread and ChatKitItem
```

### 2. Run migration

```bash
cd todo-web-app/backend
uv run alembic revision --autogenerate -m "add_chatkit_tables"
uv run alembic upgrade head
```

### 3. Implement PostgresStore

```bash
# Update src/chat/store.py with PostgresStore class
```

### 4. Update server

```bash
# Update src/chat/server.py to use PostgresStore
```

### 5. Run tests

```bash
uv run pytest -v --cov=src
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Migration failure on production | Test on dev branch first, backup before migration |
| Performance with large threads | Add pagination, index on created_at |
| Session/connection issues | Use existing session factory, connection pooling |
| Breaking existing functionality | Comprehensive tests before deployment |

---

## Complexity Tracking

No constitution violations. Straightforward implementation following established patterns from:
- Existing Task model (SQLModel patterns)
- ChatKit integration guide (PostgresStore reference)
- building-with-sqlmodel-async skill
