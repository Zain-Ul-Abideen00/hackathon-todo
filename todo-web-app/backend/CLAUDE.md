# Todo Web App - Backend

## Overview

This is the **FastAPI** backend for the Todo Web Application, built with:

- **Framework**: FastAPI with async support
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: Neon PostgreSQL (asyncpg driver)
- **Migrations**: Alembic
- **Auth**: JWT verification (shared secret with Better Auth)
- **Validation**: Pydantic v2

## Project Structure

```text
backend/
├── src/
│   ├── main.py           # FastAPI app entry point
│   ├── api/              # Route handlers
│   │   ├── deps.py       # Dependency injection
│   │   └── routes/       # Endpoint modules
│   │       └── health.py # Health check
│   ├── models/           # SQLModel entities (Module 2)
│   ├── db/               # Database connection (Module 2)
│   ├── auth/             # JWT verification (Module 4)
│   └── services/         # Business logic (Module 3)
├── alembic/              # Database migrations (Module 2)
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
# Module 4 implementation
from jose import jwt

def verify_token(token: str) -> dict:
    payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])
    return payload
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Shared JWT secret (min 32 chars) |
| `CORS_ORIGINS` | Allowed frontend origins |
| `ENVIRONMENT` | development / production |

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Related Documentation

- [spec.md](../../../specs/002-project-foundation/spec.md) - Feature specification
- [plan.md](../../../specs/002-project-foundation/plan.md) - Implementation plan
- [quickstart.md](../../../specs/002-project-foundation/quickstart.md) - Setup guide
