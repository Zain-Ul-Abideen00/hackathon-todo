# Quickstart: Database Schema Setup (Module 2)

## Prerequisites

- Neon account with project created
- Python 3.12+ with uv installed
- Backend dependencies installed (`uv sync`)
- DATABASE_URL configured in `backend/.env`

## Setup Steps

### 1. Verify Database Connection

```bash
cd todo-web-app/backend

# Test connection (after implementation)
uv run python -c "from src.db.connection import engine; print('Database connection OK')"
```

### 2. Initialize Alembic

```bash
cd todo-web-app/backend
alembic init -t async alembic
```

### 3. Configure Alembic

Edit `alembic/env.py` to import models and use async engine.

### 4. Generate Initial Migration

```bash
alembic revision --autogenerate -m "create_tasks_table"
```

### 5. Apply Migration

```bash
alembic upgrade head
```

### 6. Verify Tables

```bash
# Via Neon console or psql
\dt    # List tables
\d task  # Describe task table
\di    # List indexes
```

### 7. Run Tests

```bash
uv run pytest tests/test_task_crud.py -v
```

## Environment Variables

| Variable | Example | Required |
|----------|---------|----------|
| `DATABASE_URL` | `postgresql://user:pass@host/db?sslmode=require` | ✅ |

## Common Commands

| Action | Command |
|--------|---------|
| Apply migrations | `alembic upgrade head` |
| Rollback one | `alembic downgrade -1` |
| Generate migration | `alembic revision --autogenerate -m "description"` |
| View history | `alembic history` |
| Current revision | `alembic current` |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection timeout | Check Neon project is awake, verify DATABASE_URL |
| SSL error | Add `?sslmode=require` to DATABASE_URL |
| Import errors | Ensure all models imported in `env.py` |
| Stale connection | `pool_pre_ping=True` should handle this |
