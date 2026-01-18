# Todo Web App - Backend

## Overview

This is the **FastAPI** backend for the Todo Web Application, built with:

- **Framework**: FastAPI with async support
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: Neon PostgreSQL (asyncpg driver)
- **Migrations**: Alembic
- **Auth**: JWT verification (shared secret with Better Auth)
- **Validation**: Pydantic v2
- **AI Chat**: OpenAI ChatKit + Agents SDK + LiteLLM (Phase 3)

## Project Structure

```text
backend/
├── src/
│   ├── main.py           # FastAPI app entry point
│   ├── api/              # Route handlers
│   │   ├── deps.py       # Dependency injection
│   │   └── routes/       # Endpoint modules
│   │       └── health.py # Health check
│   ├── models/           # SQLModel entities
│   ├── db/               # Database connection
│   ├── auth/             # JWT verification
│   ├── services/         # Business logic
│   │   └── task_service.py  # Task CRUD operations
│   └── chat/             # Phase 3: AI Chatbot
│       ├── __init__.py   # Module exports
│       ├── server.py     # ChatKitServer subclass
│       ├── agent.py      # AI agent with LiteLLM
│       ├── tools.py      # MCP tools wrapping task_service
│       ├── store.py      # MemoryStore for threads
│       └── routes.py     # /api/chat endpoint
├── alembic/              # Database migrations
├── tests/                # pytest tests
├── pyproject.toml        # Dependencies & Ruff config
└── .env.example          # Environment template
```

## Development Commands

```bash
# Install dependencies
uv sync

# Start development server
uv run uvicorn src.main:app --reload

# Run linting
uv run ruff check .

# Format code
uv run ruff format .

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=src
```

## Key Patterns

### Async Database Operations

```python
from sqlmodel.ext.asyncio.session import AsyncSession

async def get_tasks(session: AsyncSession, user_id: str) -> list[Task]:
    result = await session.exec(
        select(Task).where(Task.user_id == user_id)
    )
    return result.all()
```

### Dependency Injection

```python
from fastapi import Depends
from src.api.deps import get_session, get_current_user

@router.get("/tasks")
async def list_tasks(
    session: AsyncSession = Depends(get_session),
    user: dict = Depends(get_current_user),
) -> list[Task]:
    return await get_tasks(session, user["id"])
```

### JWT Verification

```python
from jose import jwt

def verify_token(token: str) -> dict:
    payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])
    return payload
```

### ChatKit Integration (Phase 3)

```python
from chatkit import ChatKitServer, MemoryStore
from agents import Agent, Runner

class TodoChatKitServer(ChatKitServer[dict]):
    async def respond(self, thread_id, user_message, context):
        async for event in Runner.run_streamed(agent, user_message):
            yield event
```

### MCP Tools Pattern (Phase 3)

```python
from agents import function_tool
from src.services import task_service

@function_tool
async def add_task(title: str, description: str = "") -> dict:
    """Create a new task for the user."""
    # Uses context-injected session and user_id
    task = await task_service.create_task(session, task_data, user_id)
    return {"task_id": task.id, "status": "created", "title": task.title}
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Shared JWT secret (min 32 chars) |
| `CORS_ORIGINS` | Allowed frontend origins |
| `ENVIRONMENT` | development / production |
| `GEMINI_API_KEY` | Gemini API key for LiteLLM (Phase 3) |

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Phase 2 (Task Management)
- `GET /api/tasks` - List user's tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{id}` - Get task by ID
- `PATCH /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/toggle` - Toggle completion

### Phase 3 (AI Chat)
- `POST /api/chat` - Chat with AI assistant (SSE streaming)

## Related Documentation

- [spec.md](../../../specs/002-project-foundation/spec.md) - Feature specification
- [plan.md](../../../specs/002-project-foundation/plan.md) - Implementation plan
- [quickstart.md](../../../specs/002-project-foundation/quickstart.md) - Setup guide
- [007-backend-chatbot](../../../specs/007-backend-chatbot/) - Phase 3 chatbot spec
