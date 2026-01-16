# Quickstart: Task API Implementation

## Prerequisites

- [ ] Python 3.12+ installed
- [ ] uv package manager installed
- [ ] Neon PostgreSQL database configured
- [ ] Module 2 (Database Schema) completed

## Quick Setup

```bash
# Navigate to backend
cd todo-web-app/backend

# Sync dependencies
uv sync

# Copy environment file (if not exists)
cp .env.example .env

# Run database migrations
uv run alembic upgrade head

# Start development server
uv run uvicorn src.main:app --reload
```

## Verify Installation

1. **API Docs**: Open http://localhost:8000/docs
2. **Health Check**: `curl http://localhost:8000/api/health`
3. **Run Tests**: `uv run pytest -v`

## Development Workflow

### 1. Create Schemas
```bash
# Create schemas directory
mkdir -p src/schemas
touch src/schemas/__init__.py
touch src/schemas/task.py
touch src/schemas/common.py
```

### 2. Create Task Routes
```bash
touch src/api/routes/tasks.py
# Add router to main.py
```

### 3. Run Tests During Development
```bash
# Run specific test
uv run pytest tests/test_tasks.py -v -k "test_create"

# Run with output
uv run pytest -v -s

# Run with coverage
uv run pytest --cov=src
```

## Testing Endpoints

### Create Task
```bash
curl -X POST http://localhost:8000/api/test-user/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "My first task"}'
```

### List Tasks
```bash
curl http://localhost:8000/api/test-user/tasks
```

### Update Task
```bash
curl -X PUT http://localhost:8000/api/test-user/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Delete Task
```bash
curl -X DELETE http://localhost:8000/api/test-user/tasks/1
```

## Common Issues

### Database Connection Failed
- Check `DATABASE_URL` in `.env`
- Ensure Neon PostgreSQL is running
- Run `uv run alembic upgrade head` to apply migrations

### Import Errors
- Check `src/schemas/__init__.py` exports
- Verify `src/api/routes/__init__.py` includes tasks router

### Tests Failing
- Check `conftest.py` async fixtures
- Ensure test database is configured
- Run `uv run pytest -v -s` for detailed output
