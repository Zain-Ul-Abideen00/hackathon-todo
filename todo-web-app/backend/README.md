# Todo Web App - Backend

## Overview

FastAPI backend for the Todo Web Application with async PostgreSQL support.

## Technology Stack

- **Framework**: FastAPI with async support
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: Neon PostgreSQL (asyncpg driver)
- **Migrations**: Alembic (async template)
- **Auth**: JWT verification (shared secret with Better Auth)

## Project Structure

```text
backend/
├── src/
│   ├── main.py           # FastAPI app entry point
│   ├── api/              # Route handlers
│   ├── models/           # SQLModel entities
│   │   └── task.py       # Task model with indexes
│   ├── db/               # Database connection
│   │   ├── connection.py # Async engine with SSL
│   │   └── dependencies.py # FastAPI session dependency
│   ├── auth/             # JWT verification
│   └── services/         # Business logic
│       └── task_service.py # Task CRUD operations
├── alembic/              # Database migrations
├── tests/                # pytest tests
└── pyproject.toml        # Dependencies & config
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

All operations enforce user data isolation by requiring `user_id` parameter.

## Related Documentation

- [spec.md](../../specs/003-database-schema/spec.md) - Feature specification
- [plan.md](../../specs/003-database-schema/plan.md) - Implementation plan
- [quickstart.md](../../specs/003-database-schema/quickstart.md) - Setup guide
