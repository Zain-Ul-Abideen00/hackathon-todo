# Tasks: REST API for Task Management (Module 3)

**Input**: Design documents from `/specs/004-task-api/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/openapi.yaml ✅

**Tests**: API integration tests are included per spec requirements (FR-012, SC-006).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `todo-web-app/backend/src/`, `todo-web-app/backend/tests/`

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Create project structure for new API components

- [x] T001 Create schemas package directory at `backend/src/schemas/`
- [x] T002 [P] Create `backend/src/schemas/__init__.py` with exports
- [x] T003 [P] Add slowapi dependency to `backend/pyproject.toml` for rate limiting

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core infrastructure that MUST be complete before any user story endpoints

**⚠️ CRITICAL**: No user story endpoints can work until this phase is complete

- [x] T004 [P] Create `backend/src/schemas/common.py` with ErrorResponse and PaginationMeta schemas
- [x] T005 [P] Create `backend/src/schemas/task.py` with TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskDeleteResponse schemas
- [x] T006 Update `backend/src/schemas/__init__.py` to export all schemas
- [x] T007 Add `get_session` dependency to `backend/src/api/deps.py` for database session injection
- [x] T008 Add `get_current_user` placeholder dependency to `backend/src/api/deps.py` returning test user
- [x] T009 Add `verify_user_access` dependency to `backend/src/api/deps.py` to validate user_id matches current user
- [x] T010 Add rate limiter setup to `backend/src/api/deps.py` using slowapi (100 req/min per user)
- [x] T011 Create empty `backend/src/api/routes/tasks.py` with APIRouter initialization
- [x] T012 Add `list_tasks_paginated()` function to `backend/src/services/task_service.py` with cursor-based pagination and sorting
- [x] T013 Add `toggle_task_completion()` function to `backend/src/services/task_service.py`
- [x] T014 Update `backend/src/main.py` to include tasks router with `/api` prefix
- [x] T015 Add rate limiter middleware to `backend/src/main.py`
- [x] T016 Add custom exception handlers for validation errors in `backend/src/main.py`

**Checkpoint**: Foundation ready - user story endpoints can now be implemented ✅

---

## Phase 3: User Story 1 - Create Task via API (Priority: P1) 🎯 MVP ✅

**Goal**: Enable users to create new tasks via POST request

**Independent Test**: POST `/api/{user_id}/tasks` with `{"title": "Buy groceries"}` returns 201 with complete task object

### Tests for User Story 1

- [x] T017 [P] [US1] Create test for POST creates task with title only → 201 in `backend/tests/test_tasks.py`
- [x] T018 [P] [US1] Create test for POST creates task with title + description → 201 in `backend/tests/test_tasks.py`
- [x] T019 [P] [US1] Create test for POST with empty title → 400 validation error in `backend/tests/test_tasks.py`
- [x] T020 [P] [US1] Create test for POST with title > 200 chars → 400 validation error in `backend/tests/test_tasks.py`

### Implementation for User Story 1

- [x] T021 [US1] Implement `create_task` endpoint in `backend/src/api/routes/tasks.py` with TaskCreate schema
- [x] T022 [US1] Add input validation for title (1-200 chars) and description (max 1000 chars)
- [x] T023 [US1] Connect endpoint to existing `create_task` service function
- [x] T024 [US1] Return 201 status with TaskResponse schema

**Checkpoint**: User Story 1 complete - can create tasks via API ✅

---

## Phase 4: User Story 2 - View All Tasks with Filtering (Priority: P1) ✅

**Goal**: Enable users to retrieve their task list with filtering, sorting, and pagination

**Independent Test**: GET `/api/{user_id}/tasks?status=pending&sort=title` returns filtered, sorted, paginated tasks

### Tests for User Story 2

- [x] T025 [P] [US2] Create test for GET returns paginated tasks → 200 with pagination metadata in `backend/tests/test_tasks.py`
- [x] T026 [P] [US2] Create test for GET with status=pending → only pending tasks in `backend/tests/test_tasks.py`
- [x] T027 [P] [US2] Create test for GET with status=completed → only completed tasks in `backend/tests/test_tasks.py`
- [x] T028 [P] [US2] Create test for GET with sort=title → alphabetical order in `backend/tests/test_tasks.py`
- [x] T029 [P] [US2] Create test for GET with cursor → correct next page in `backend/tests/test_tasks.py`

### Implementation for User Story 2

- [x] T030 [US2] Implement `list_tasks` endpoint in `backend/src/api/routes/tasks.py`
- [x] T031 [US2] Add query parameters: status (all/pending/completed), sort (created/title), cursor, limit
- [x] T032 [US2] Connect endpoint to `list_tasks_paginated` service function
- [x] T033 [US2] Return TaskListResponse with tasks, next_cursor, has_more

**Checkpoint**: User Stories 1 & 2 complete - can create and list tasks ✅

---

## Phase 5: User Story 3 - View Single Task (Priority: P2) ✅

**Goal**: Enable users to retrieve a specific task by ID

**Independent Test**: GET `/api/{user_id}/tasks/1` returns complete task object

### Tests for User Story 3

- [x] T034 [P] [US3] Create test for GET existing task → 200 with TaskResponse in `backend/tests/test_tasks.py`
- [x] T035 [P] [US3] Create test for GET non-existent task → 404 in `backend/tests/test_tasks.py`
- [x] T036 [P] [US3] Create test for GET another user's task → 404 (security) in `backend/tests/test_tasks.py`

### Implementation for User Story 3

- [x] T037 [US3] Implement `get_task` endpoint in `backend/src/api/routes/tasks.py`
- [x] T038 [US3] Connect endpoint to existing `get_task` service function
- [x] T039 [US3] Return 404 for not found or wrong user (don't reveal existence)

**Checkpoint**: User Stories 1-3 complete - CRUD Read operations done ✅

---

## Phase 6: User Story 4 - Update Task (Priority: P2) ✅

**Goal**: Enable users to update task title, description, or completion status

**Independent Test**: PUT `/api/{user_id}/tasks/1` with `{"title": "Updated"}` returns updated task

### Tests for User Story 4

- [x] T040 [P] [US4] Create test for PUT updates title only → 200 in `backend/tests/test_tasks.py`
- [x] T041 [P] [US4] Create test for PUT updates completed → 200 in `backend/tests/test_tasks.py`
- [x] T042 [P] [US4] Create test for PUT non-existent task → 404 in `backend/tests/test_tasks.py`

### Implementation for User Story 4

- [x] T043 [US4] Implement `update_task` endpoint in `backend/src/api/routes/tasks.py` with TaskUpdate schema
- [x] T044 [US4] Connect endpoint to existing `update_task` service function
- [x] T045 [US4] Support partial updates (only update provided fields)

**Checkpoint**: User Stories 1-4 complete - CRUD Update done ✅

---

## Phase 7: User Story 5 - Delete Task (Priority: P2) ✅

**Goal**: Enable users to permanently delete tasks

**Independent Test**: DELETE `/api/{user_id}/tasks/1` returns `{"message": "deleted", "task_id": 1}`

### Tests for User Story 5

- [x] T046 [P] [US5] Create test for DELETE existing task → 200 with confirmation in `backend/tests/test_tasks.py`
- [x] T047 [P] [US5] Create test for DELETE non-existent task → 404 in `backend/tests/test_tasks.py`

### Implementation for User Story 5

- [x] T048 [US5] Implement `delete_task` endpoint in `backend/src/api/routes/tasks.py`
- [x] T049 [US5] Connect endpoint to existing `delete_task` service function
- [x] T050 [US5] Return TaskDeleteResponse with message and task_id

**Checkpoint**: User Stories 1-5 complete - Full CRUD done ✅

---

## Phase 8: User Story 6 - Toggle Task Completion (Priority: P3) ✅

**Goal**: Enable quick toggle of task completion status

**Independent Test**: PATCH `/api/{user_id}/tasks/1/complete` toggles completed status

### Tests for User Story 6

- [x] T051 [P] [US6] Create test for PATCH toggles pending → completed in `backend/tests/test_tasks.py`
- [x] T052 [P] [US6] Create test for PATCH toggles completed → pending in `backend/tests/test_tasks.py`
- [x] T053 [P] [US6] Create test for PATCH non-existent task → 404 in `backend/tests/test_tasks.py`

### Implementation for User Story 6

- [x] T054 [US6] Implement `toggle_complete` endpoint in `backend/src/api/routes/tasks.py`
- [x] T055 [US6] Connect endpoint to `toggle_task_completion` service function
- [x] T056 [US6] Return updated TaskResponse with toggled completed status

**Checkpoint**: All 6 user stories complete ✅

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Verification and documentation

- [x] T057 Run all tests: `uv run pytest -v` in `backend/`
- [ ] T058 Verify OpenAPI docs at http://localhost:8000/docs show all 6 endpoints
- [ ] T059 Test rate limiting returns 429 after 100 requests
- [ ] T060 Run manual curl tests per verification plan in plan.md
- [x] T061 Update `backend/README.md` with new API endpoints documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately ✅
- **Foundational (Phase 2)**: Depends on Setup - **BLOCKS all user stories** ✅
- **User Stories (Phases 3-8)**: All depend on Foundational completion ✅
  - Can proceed sequentially (P1 → P1 → P2 → P2 → P2 → P3)
  - Or in parallel if team capacity allows
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

| Story | Priority | Dependencies | Notes |
|-------|----------|--------------|-------|
| US1 (Create) | P1 | Foundational only | MVP - first to implement ✅ |
| US2 (List) | P1 | Foundational only | Needs `list_tasks_paginated` ✅ |
| US3 (Get Single) | P2 | Foundational only | Uses existing `get_task` ✅ |
| US4 (Update) | P2 | Foundational only | Uses existing `update_task` ✅ |
| US5 (Delete) | P2 | Foundational only | Uses existing `delete_task` ✅ |
| US6 (Toggle) | P3 | Foundational only | Needs `toggle_task_completion` ✅ |

### Within Each User Story

1. Tests first (marked [P] - can run in parallel)
2. Endpoint implementation
3. Service connection
4. Validation and error handling

---

## Parallel Opportunities

### Setup Phase (3 parallel)
```
T001 (create dir) → T002 [P] (__init__.py)
                  → T003 [P] (pyproject.toml)
```

### Foundational Phase (4 parallel groups)
```
Group 1: T004 [P], T005 [P] (schemas - parallel)
Group 2: T007-T010 (deps.py - sequential)
Group 3: T011 (tasks router)
Group 4: T012, T013 (service extensions)
Group 5: T014-T016 (main.py updates)
```

### User Story Tests (all parallel within story)
```
US1: T017, T018, T019, T020 [all P]
US2: T025, T026, T027, T028, T029 [all P]
...etc
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup ✅
2. Complete Phase 2: Foundational (CRITICAL) ✅
3. Complete Phase 3: User Story 1 (Create Task) ✅
4. Complete Phase 4: User Story 2 (List Tasks) ✅
5. **STOP and VALIDATE**: Test MVP independently ✅
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready ✅
2. Add US1 (Create) → Test → Deploy/Demo (MVP!) ✅
3. Add US2 (List) → Test → Deploy/Demo ✅
4. Add US3-US5 (CRUD) → Test → Deploy/Demo ✅
5. Add US6 (Toggle) → Test → Deploy/Demo (Complete!) ✅

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Existing Task model and CRUD service from Module 2 - reuse where possible
- Auth uses placeholder (test-user) - Module 4 will add real JWT
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 61 |
| **Completed Tasks** | 57 |
| **Setup Tasks** | 3 ✅ |
| **Foundational Tasks** | 13 ✅ |
| **US1 Tasks** | 8 ✅ |
| **US2 Tasks** | 9 ✅ |
| **US3 Tasks** | 6 ✅ |
| **US4 Tasks** | 6 ✅ |
| **US5 Tasks** | 5 ✅ |
| **US6 Tasks** | 6 ✅ |
| **Polish Tasks** | 1/5 ✅ |
| **Parallel Opportunities** | 35+ |
| **MVP Scope** | Phases 1-4 (33 tasks) ✅ |
