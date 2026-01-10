# Implementation Plan: REST API for Task Management (Module 3)

## Goal

Implement the complete REST API for task management with all CRUD operations, filtering, sorting, pagination, rate limiting, and proper error handling. This builds on the existing Module 2 foundation (Task model + TaskService).

## Technical Context

| Component | Status | Technology |
|-----------|--------|------------|
| FastAPI App | ✅ Exists | FastAPI 0.115+ |
| Task Model | ✅ Exists | SQLModel (Module 2) |
| TaskService | ✅ Exists | Async CRUD functions (Module 2) |
| Health Router | ✅ Exists | `/api/health` |
| Task Routes | 🔲 New | APIRouter with 6 endpoints |
| Pydantic Schemas | 🔲 New | Request/Response validation |
| Pagination | 🔲 New | Cursor-based with `next_cursor` |
| Rate Limiting | 🔲 New | slowapi or custom (100 req/min) |
| API Tests | 🔲 New | pytest-asyncio with TestClient |

**Agent References:**
- `@fastapi-pro` - API development patterns
- `@backend-developer` - Implementation standards

**Skill References:**
- `api-design-principles` - REST patterns, error handling
- `openapi-spec-generation` - Auto-generated documentation

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| II. FastAPI Backend | ✅ Pass | Async-first with Pydantic v2 |
| V. Security First | ✅ Pass | Input validation, rate limiting |
| VI. TDD | ✅ Pass | Tests for all endpoints |
| VII. Type Safety | ✅ Pass | Pydantic models throughout |
| VIII. Documentation | ✅ Pass | OpenAPI at `/docs` |

> [!NOTE]
> Auth dependency uses placeholder (hardcoded test user) per user request. Module 4 will add real JWT verification.

---

## Proposed Changes

### Schemas Component

#### [NEW] [task.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/schemas/task.py)

Pydantic schemas for API request/response validation:

- `TaskCreate` - Request body for POST (title required, description optional)
- `TaskUpdate` - Request body for PUT/PATCH (all fields optional)
- `TaskResponse` - Single task response with all fields
- `TaskListResponse` - Paginated list with `tasks`, `next_cursor`, `has_more`
- `TaskDeleteResponse` - Confirmation message with deleted task_id

#### [NEW] [common.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/schemas/common.py)

Shared schemas for consistent API responses:

- `ErrorResponse` - Standardized error format with code, message, details
- `PaginationMeta` - Cursor and has_more fields

---

### Routes Component

#### [NEW] [tasks.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/api/routes/tasks.py)

All task management endpoints with APIRouter:

| Method | Endpoint | Function | Status Code |
|--------|----------|----------|-------------|
| GET | `/api/{user_id}/tasks` | `list_tasks` | 200 |
| POST | `/api/{user_id}/tasks` | `create_task` | 201 |
| GET | `/api/{user_id}/tasks/{task_id}` | `get_task` | 200 |
| PUT | `/api/{user_id}/tasks/{task_id}` | `update_task` | 200 |
| DELETE | `/api/{user_id}/tasks/{task_id}` | `delete_task` | 200 |
| PATCH | `/api/{user_id}/tasks/{task_id}/complete` | `toggle_complete` | 200 |

**Query Parameters for GET list:**
- `status`: `all` | `pending` | `completed` (default: `all`)
- `sort`: `created` | `title` (default: `created`)
- `cursor`: Pagination cursor (base64 encoded task_id)
- `limit`: 1-100 (default: 20)

---

### Services Component

#### [MODIFY] [task_service.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/services/task_service.py)

Extend existing service with pagination and sorting:

- Add `list_tasks_paginated()` - Cursor-based pagination with sorting
- Add `toggle_task_completion()` - Toggle completed status

---

### Dependencies Component

#### [MODIFY] [deps.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/api/deps.py)

Add dependencies for:

- `get_session` - Database session injection
- `get_current_user` - Placeholder returning test user dict
- `verify_user_access` - Check URL user_id matches current user
- `RateLimiter` - slowapi or custom implementation

---

### Main App

#### [MODIFY] [main.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/main.py)

- Include tasks router with `/api` prefix
- Add rate limiter middleware
- Add custom exception handlers for validation errors
- Update lifespan to initialize DB engine

---

### Tests Component

#### [NEW] [test_tasks.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/tests/test_tasks.py)

API integration tests using TestClient:

1. **Create Task Tests**
   - Create with title only → 201
   - Create with title + description → 201
   - Create with empty title → 400
   - Create with title > 200 chars → 400

2. **List Tasks Tests**
   - List all tasks → 200 with pagination
   - Filter by status pending → only pending
   - Filter by status completed → only completed
   - Sort by title → alphabetical order
   - Pagination with cursor → correct page

3. **Get Single Task Tests**
   - Get existing task → 200
   - Get non-existent task → 404
   - Get another user's task → 404

4. **Update Task Tests**
   - Update title → 200
   - Update completed → 200
   - Update non-existent → 404

5. **Delete Task Tests**
   - Delete existing → 200 with confirmation
   - Delete non-existent → 404

6. **Toggle Completion Tests**
   - Toggle pending to completed → 200
   - Toggle completed to pending → 200

---

## Verification Plan

### Automated Tests

**Command to run all tests:**
```bash
cd todo-web-app/backend
uv run pytest -v
```

**Run specific API tests:**
```bash
cd todo-web-app/backend
uv run pytest tests/test_tasks.py -v
```

**Run with coverage:**
```bash
cd todo-web-app/backend
uv run pytest --cov=src --cov-report=term-missing
```

### Manual Verification

**1. Start the development server:**
```bash
cd todo-web-app/backend
uv run uvicorn src.main:app --reload
```

**2. Check OpenAPI docs:**
- Open browser to http://localhost:8000/docs
- Verify all 6 task endpoints are documented
- Verify schemas are shown correctly

**3. Test endpoints with curl:**

```bash
# Create task
curl -X POST http://localhost:8000/api/test-user/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task", "description": "Test description"}'

# List tasks
curl http://localhost:8000/api/test-user/tasks

# Get single task (replace 1 with actual ID)
curl http://localhost:8000/api/test-user/tasks/1

# Update task
curl -X PUT http://localhost:8000/api/test-user/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated title"}'

# Toggle completion
curl -X PATCH http://localhost:8000/api/test-user/tasks/1/complete

# Delete task
curl -X DELETE http://localhost:8000/api/test-user/tasks/1
```

**4. Verify rate limiting:**
```bash
# Run 101 requests quickly to trigger rate limit
for i in {1..101}; do curl -s http://localhost:8000/api/test-user/tasks -o /dev/null -w "%{http_code}\n"; done
# Should see 429 after 100 requests
```

---

## Dependencies

- **Module 2 (Database Schema)**: ✅ Complete - Task model and CRUD service exist
- **Module 4 (Auth)**: Deferred - Using placeholder user for now

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Rate limiting package not installed | Medium | Use slowapi or implement custom with in-memory counter |
| Cursor pagination complexity | Low | Use base64-encoded task_id as cursor |
| Test database conflicts | Medium | Use conftest.py fixtures (already exists) |

---

## File Summary

| Action | File Path |
|--------|-----------|
| NEW | `backend/src/schemas/__init__.py` |
| NEW | `backend/src/schemas/task.py` |
| NEW | `backend/src/schemas/common.py` |
| NEW | `backend/src/api/routes/tasks.py` |
| MODIFY | `backend/src/services/task_service.py` |
| MODIFY | `backend/src/api/deps.py` |
| MODIFY | `backend/src/main.py` |
| NEW | `backend/tests/test_tasks.py` |
