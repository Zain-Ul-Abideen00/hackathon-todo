# Feature Specification: REST API for Task Management

**Feature Branch**: `004-task-api`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description: "REST API for Task Management (Module 3)"

## Clarifications

### Session 2026-01-08

- Q: How should the task list endpoint handle large datasets? → A: Cursor-based pagination using `?cursor=xyz&limit=20`
- Q: Should the API implement rate limiting? → A: Per-user global limit (100 requests/minute per user)
- Q: Should task deletion be permanent or recoverable? → A: Hard delete (permanently remove from database)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Task via API (Priority: P1)

As a user, I can create a new task by sending a POST request with my task details, so that my tasks are stored and associated with my account.

**Why this priority**: Task creation is the fundamental operation that enables all other task management functionality. Without the ability to create tasks, no other operations are meaningful.

**Independent Test**: Can be fully tested by sending a POST request with valid JWT and task data, verifying the response contains the created task with correct fields and a 201 status code.

**Acceptance Scenarios**:

1. **Given** an authenticated user with valid JWT, **When** they send POST `/api/{user_id}/tasks` with `{"title": "Buy groceries"}`, **Then** the system returns 201 with the created task object including `id`, `title`, `completed: false`, `created_at`, and `updated_at`.
2. **Given** an authenticated user with valid JWT, **When** they send POST with `{"title": "Read book", "description": "Finish chapter 5"}`, **Then** the system returns 201 with both title and description saved.
3. **Given** a user without a JWT token, **When** they send POST `/api/{user_id}/tasks`, **Then** the system returns 401 Unauthorized.
4. **Given** a user with valid JWT for a different user_id, **When** they send POST to another user's endpoint, **Then** the system returns 403 Forbidden.

---

### User Story 2 - View All Tasks with Filtering (Priority: P1)

As a user, I can retrieve all my tasks with optional filtering by status and sorting, so that I can see my task list organized according to my needs.

**Why this priority**: Viewing tasks is essential for users to understand their workload and track progress. Combined with filtering, it enables efficient task management.

**Independent Test**: Can be fully tested by creating test tasks, then querying with different filter/sort combinations and verifying the correct tasks are returned in the expected order.

**Acceptance Scenarios**:

1. **Given** an authenticated user with 5 tasks (3 pending, 2 completed), **When** they send GET `/api/{user_id}/tasks`, **Then** the system returns the first page of tasks with pagination metadata (cursor, has_more).
2. **Given** an authenticated user with tasks, **When** they send GET with `?status=pending`, **Then** the system returns only non-completed tasks.
3. **Given** an authenticated user with tasks, **When** they send GET with `?status=completed`, **Then** the system returns only completed tasks.
4. **Given** an authenticated user with tasks, **When** they send GET with `?sort=title`, **Then** the system returns tasks sorted alphabetically by title.
5. **Given** an authenticated user with tasks, **When** they send GET with `?sort=created`, **Then** the system returns tasks sorted by creation date (newest first).

---

### User Story 3 - View Single Task (Priority: P2)

As a user, I can retrieve a specific task by its ID, so that I can see the complete details of one task.

**Why this priority**: While less critical than list view, accessing individual task details supports detailed task management and is required for edit/delete confirmations.

**Independent Test**: Can be fully tested by creating a task, then retrieving it by ID and verifying all fields are returned correctly.

**Acceptance Scenarios**:

1. **Given** an authenticated user who owns task with ID 1, **When** they send GET `/api/{user_id}/tasks/1`, **Then** the system returns the complete task object.
2. **Given** an authenticated user, **When** they request a task_id that doesn't exist, **Then** the system returns 404 Not Found.
3. **Given** an authenticated user, **When** they request a task belonging to a different user, **Then** the system returns 404 Not Found (for security, don't reveal if task exists).

---

### User Story 4 - Update Task (Priority: P2)

As a user, I can update my task's title, description, or completion status, so that I can keep my task information current.

**Why this priority**: Updating tasks is essential for maintaining accurate task data as work progresses. Supports partial updates for flexibility.

**Independent Test**: Can be fully tested by creating a task, updating specific fields, and verifying only the specified fields changed while others remain unchanged.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an existing task, **When** they send PUT with `{"title": "Updated title"}`, **Then** only the title is updated and the updated task is returned.
2. **Given** an authenticated user with an existing task, **When** they send PUT with `{"completed": true}`, **Then** the task is marked as completed.
3. **Given** an authenticated user with an existing task, **When** they send PUT with `{"description": "New description"}`, **Then** the description is updated.
4. **Given** an authenticated user, **When** they try to update a non-existent task, **Then** the system returns 404 Not Found.

---

### User Story 5 - Delete Task (Priority: P2)

As a user, I can delete a task I no longer need, so that my task list stays clean and relevant.

**Why this priority**: Deletion completes the CRUD operations and allows users to manage their task list effectively.

**Independent Test**: Can be fully tested by creating a task, deleting it, and verifying it no longer appears in the task list.

**Acceptance Scenarios**:

1. **Given** an authenticated user with an existing task, **When** they send DELETE `/api/{user_id}/tasks/{task_id}`, **Then** the system returns `{"message": "deleted", "task_id": <id>}`.
2. **Given** an authenticated user, **When** they try to delete a non-existent task, **Then** the system returns 404 Not Found.
3. **Given** an authenticated user, **When** they try to delete another user's task, **Then** the system returns 404 Not Found.

---

### User Story 6 - Toggle Task Completion (Priority: P3)

As a user, I can quickly toggle a task's completion status with a single action, so that I can efficiently mark tasks as done or re-open them.

**Why this priority**: While covered by general update, a dedicated toggle endpoint provides a convenient shortcut for the most common task update operation.

**Independent Test**: Can be fully tested by toggling a pending task to completed and back, verifying the status changes correctly each time.

**Acceptance Scenarios**:

1. **Given** an authenticated user with a pending task, **When** they send PATCH `/api/{user_id}/tasks/{task_id}/complete`, **Then** the task becomes completed and the updated task is returned.
2. **Given** an authenticated user with a completed task, **When** they send PATCH to the complete endpoint, **Then** the task becomes pending (toggled back).
3. **Given** an authenticated user, **When** they try to toggle a non-existent task, **Then** the system returns 404 Not Found.

---

### Edge Cases

- What happens when title is empty or exceeds 200 characters? → Return 400 validation error
- What happens when description exceeds 1000 characters? → Return 400 validation error
- What happens when user_id in URL doesn't match JWT user_id? → Return 403 Forbidden
- How does the system handle concurrent updates to the same task? → Last write wins (standard HTTP semantics)
- What happens when an invalid status filter is provided? → Return 400 with valid options
- What happens when an invalid sort parameter is provided? → Return 400 with valid options

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST authenticate all API requests using JWT tokens in the Authorization header
- **FR-002**: System MUST validate that the user_id in the URL matches the authenticated user's ID
- **FR-003**: System MUST support creating tasks with required title (1-200 chars) and optional description (max 1000 chars)
- **FR-004**: System MUST automatically set `completed: false` for newly created tasks
- **FR-005**: System MUST automatically generate `created_at` and `updated_at` timestamps
- **FR-006**: System MUST support filtering tasks by status: `all`, `pending`, or `completed`
- **FR-007**: System MUST support sorting tasks by `created` (default, newest first) or `title` (alphabetical)
- **FR-014**: System MUST implement cursor-based pagination with `?cursor=<token>&limit=<n>` parameters (default limit: 20, max: 100)
- **FR-015**: System MUST return pagination metadata including `next_cursor` and `has_more` in list responses
- **FR-008**: System MUST support partial updates where only specified fields are modified
- **FR-009**: System MUST update the `updated_at` timestamp on every modification
- **FR-010**: System MUST ensure tasks are only visible/modifiable by their owner (user isolation)
- **FR-011**: System MUST provide OpenAPI documentation at `/docs` endpoint
- **FR-012**: System MUST use Pydantic for request/response validation
- **FR-013**: System MUST return appropriate HTTP status codes (201, 200, 400, 401, 403, 404, 500)
- **FR-016**: System MUST implement per-user rate limiting (100 requests/minute) and return 429 Too Many Requests when exceeded
- **FR-017**: System MUST permanently delete tasks (hard delete) when DELETE endpoint is called - no recovery mechanism

### Key Entities

- **Task**: Represents a user's todo item with the following attributes:
  - `id`: Unique identifier (auto-generated)
  - `title`: Task name (1-200 characters, required)
  - `description`: Additional details (0-1000 characters, optional)
  - `completed`: Completion status (boolean, defaults to false)
  - `user_id`: Owner identifier (links to authenticated user)
  - `created_at`: Creation timestamp (auto-generated)
  - `updated_at`: Last modification timestamp (auto-updated)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 API endpoints respond with correct status codes and data structures within 500ms under normal load
- **SC-002**: Users can create, view, update, and delete their tasks without errors
- **SC-003**: No user can access or modify another user's tasks (100% user isolation)
- **SC-004**: Input validation prevents all invalid data from being stored (title length, description length)
- **SC-005**: API documentation is automatically generated and accessible at `/docs`
- **SC-006**: All acceptance scenarios pass automated testing
- **SC-007**: Error responses include clear, actionable messages for developers

## Assumptions

- JWT authentication is already implemented (Module 4 dependency or can be tested with mock JWT)
- Task model already exists in the database (from Module 2: Database Schema)
- FastAPI framework is set up with proper async database sessions
- CORS is configured to allow requests from the frontend application
