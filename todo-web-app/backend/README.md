# Todo Web App - Backend

## Overview

FastAPI backend for the Todo Web Application with async PostgreSQL support.

## Technology Stack

- **Framework**: FastAPI with async support
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: Neon PostgreSQL (asyncpg driver)
- **Migrations**: Alembic (async template)
- **Auth**: JWT verification (shared secret with Better Auth)
- **Rate Limiting**: slowapi (100 req/min per user)

## Project Structure

```text
backend/
├── src/
│   ├── main.py              # FastAPI app entry point
│   ├── api/
│   │   ├── deps.py          # Dependencies (DB session, auth, rate limiting)
│   │   └── routes/
│   │       ├── health.py    # Health check endpoint
│   │       └── tasks.py     # Task CRUD endpoints
│   ├── models/
│   │   └── task.py          # Task model with indexes
│   ├── schemas/
│   │   ├── common.py        # ErrorResponse, PaginationMeta
│   │   └── task.py          # TaskCreate, TaskUpdate, TaskResponse
│   ├── db/
│   │   ├── connection.py    # Async engine with SSL
│   │   └── dependencies.py  # FastAPI session dependency
│   ├── auth/                # JWT verification (Module 4)
│   └── services/
│       └── task_service.py  # Task CRUD operations
├── alembic/                 # Database migrations
├── tests/                   # pytest tests
└── pyproject.toml           # Dependencies & config
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `BETTER_AUTH_SECRET` | Shared JWT secret (min 32 chars) | ✅ |
| `CORS_ORIGINS` | Allowed frontend origins | ✅ |
| `ENVIRONMENT` | development / production | ✅ |

## Development Commands

```bash
# Install dependencies
uv sync

# Start development server
uv run uvicorn src.main:app --reload

# Run linting
uv run ruff check src/

# Format code
uv run ruff format .

# Run tests
uv run pytest -v
```

## API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

### Task Management

All task endpoints require the `user_id` in the URL path. Rate limited to 100 requests/minute per user.

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/api/{user_id}/tasks` | Create a new task | 201 |
| GET | `/api/{user_id}/tasks` | List tasks with pagination | 200 |
| GET | `/api/{user_id}/tasks/{task_id}` | Get a single task | 200 |
| PUT | `/api/{user_id}/tasks/{task_id}` | Update a task | 200 |
| DELETE | `/api/{user_id}/tasks/{task_id}` | Delete a task | 200 |
| PATCH | `/api/{user_id}/tasks/{task_id}/complete` | Toggle completion | 200 |

### Query Parameters for GET /tasks

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | `all` | Filter: `all`, `pending`, `completed` |
| `sort` | string | `created` | Sort by: `created` (newest first), `title` (alphabetical) |
| `cursor` | string | null | Pagination cursor for next page |
| `limit` | int | 20 | Items per page (1-100) |

### Request/Response Examples

#### Create Task

```bash
curl -X POST http://localhost:8000/api/test-user/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

Response (201):
```json
{
  "id": 1,
  "user_id": "test-user",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-08T16:00:00Z",
  "updated_at": "2026-01-08T16:00:00Z"
}
```

#### List Tasks with Filtering

```bash
curl "http://localhost:8000/api/test-user/tasks?status=pending&sort=title&limit=10"
```

Response (200):
```json
{
  "tasks": [...],
  "next_cursor": "eyJpZCI6MTB9",
  "has_more": true
}
```

#### Toggle Completion

```bash
curl -X PATCH http://localhost:8000/api/test-user/tasks/1/complete
```

## Database Migrations

```bash
# Apply all migrations
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1

# Generate new migration
uv run alembic revision --autogenerate -m "description"

# View current revision
uv run alembic current

# View migration history
uv run alembic history
```

## Task Service API

The task service (`src/services/task_service.py`) provides:

- `create_task(session, task_data, user_id)` - Create new task
- `get_task(session, task_id, user_id)` - Get task with ownership check
- `update_task(session, task_id, user_id, task_data)` - Update task
- `delete_task(session, task_id, user_id)` - Delete task
- `list_tasks_by_user(session, user_id, completed=None)` - List with optional filter
- `list_tasks_paginated(session, user_id, ...)` - Cursor-based pagination with sorting
- `toggle_task_completion(session, task_id, user_id)` - Toggle completed status

All operations enforce user data isolation by requiring `user_id` parameter.

## API Documentation

When the server is running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Related Documentation

- [spec.md](../../specs/004-task-api/spec.md) - API specification
- [plan.md](../../specs/004-task-api/plan.md) - Implementation plan
- [openapi.yaml](../../specs/004-task-api/contracts/openapi.yaml) - OpenAPI contract
