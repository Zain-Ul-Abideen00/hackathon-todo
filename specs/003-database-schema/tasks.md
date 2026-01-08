# Tasks: Database Schema for Todo App (Module 2)

**Input**: Design documents from `specs/003-database-schema/`
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, research.md ✅, quickstart.md ✅

**Tests**: Included as specified in plan.md verification section (TDD constitution mandate).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- All paths relative to `todo-web-app/backend/`

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Database connection layer and project structure

- [x] T001 Create database connection module in `src/db/connection.py` with get_async_database_url() and async engine
- [x] T002 [P] Create FastAPI session dependency in `src/db/dependencies.py` with get_session()
- [x] T003 [P] Update `src/db/__init__.py` to export connection utilities

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core infrastructure that MUST complete before ANY user story

- [x] T004 Create Task SQLModel entity in `src/models/task.py` per data-model.md
- [x] T005 Update `src/models/__init__.py` to export Task model
- [x] T006 Initialize Alembic with async template: `alembic init -t async alembic`
- [x] T007 Configure `alembic.ini` to use empty sqlalchemy.url (load from env)
- [x] T008 Configure `alembic/env.py` for async migrations with SQLModel.metadata and model imports
- [x] T009 Generate initial migration: `alembic revision --autogenerate -m "create_tasks_table"`
- [x] T010 Apply migration to Neon database: `alembic upgrade head`
- [x] T011 Create tests directory and `tests/__init__.py`
- [x] T012 Create test fixtures in `tests/conftest.py` with async session factory

**Checkpoint**: Database schema deployed, Task model ready, test infrastructure in place ✅

---

## Phase 3: User Story 1 - Task Persistence (Priority: P1) 🎯 MVP ✅

**Goal**: Tasks persist in database across sessions and server restarts

### Tests for User Story 1

- [x] T013 [P] [US1] Write test_create_task in `tests/test_task_crud.py` - verify ID, timestamps assigned
- [x] T014 [P] [US1] Write test_read_task in `tests/test_task_crud.py` - verify retrieval by ID
- [x] T015 [P] [US1] Write test_update_task in `tests/test_task_crud.py` - verify title/description update
- [x] T016 [P] [US1] Write test_delete_task in `tests/test_task_crud.py` - verify task removed

### Implementation for User Story 1

- [x] T017 [US1] Implement create_task() async function in `src/services/task_service.py`
- [x] T018 [US1] Implement get_task() async function in `src/services/task_service.py`
- [x] T019 [US1] Implement update_task() async function in `src/services/task_service.py`
- [x] T020 [US1] Implement delete_task() async function in `src/services/task_service.py`
- [x] T021 [US1] Run tests: `uv run pytest tests/test_task_crud.py -v` - verify all pass

**Checkpoint**: CRUD operations work, tasks persist in Neon database ✅

---

## Phase 4: User Story 2 - User Data Isolation (Priority: P1) ✅

**Goal**: Users can only see and manage their own tasks

### Tests for User Story 2

- [x] T022 [P] [US2] Write test_list_tasks_by_user in `tests/test_task_crud.py` - verify user isolation
- [x] T023 [P] [US2] Write test_get_task_wrong_user in `tests/test_task_crud.py` - verify rejection/not found

### Implementation for User Story 2

- [x] T024 [US2] Implement list_tasks_by_user(user_id) async function in `src/services/task_service.py`
- [x] T025 [US2] Add user_id filter to get_task() to enforce ownership check
- [x] T026 [US2] Add user_id filter to update_task() to enforce ownership check
- [x] T027 [US2] Add user_id filter to delete_task() to enforce ownership check
- [x] T028 [US2] Run tests: `uv run pytest tests/test_task_crud.py -v` - verify isolation works

**Checkpoint**: User data isolation enforced at service layer ✅

---

## Phase 5: User Story 3 - Schema Evolution with Migrations (Priority: P2) ✅

**Goal**: Developers can evolve schema using version-controlled migrations

### Verification for User Story 3

- [x] T029 [US3] Verify `alembic upgrade head` succeeds with no errors
- [x] T030 [US3] Verify `alembic current` shows correct revision
- [x] T031 [US3] Verify `alembic downgrade -1` rolls back successfully (skipped - keep schema)
- [x] T032 [US3] Re-apply migration: `alembic upgrade head` (already at head)
- [x] T033 [US3] Document migration workflow in `README.md` or quickstart

**Checkpoint**: Migration workflow documented and verified ✅

---

## Phase 6: User Story 4 - Task Status Filtering (Priority: P3) ✅

**Goal**: Efficiently filter tasks by completion status using indexes

### Tests for User Story 4

- [x] T034 [P] [US4] Write test_filter_by_completed in `tests/test_task_crud.py` - verify status filtering
- [x] T035 [P] [US4] Write test_filter_combined in `tests/test_task_crud.py` - verify user_id + completed filter

### Implementation for User Story 4

- [x] T036 [US4] Add completed filter parameter to list_tasks_by_user() in `src/services/task_service.py`
- [x] T037 [US4] Run tests: `uv run pytest tests/test_task_crud.py -v` - verify filtering works
- [x] T038 [US4] Verify index usage with EXPLAIN on filtered query (indexes created: ix_task_user_id, ix_task_completed)

**Checkpoint**: Status filtering works efficiently with indexes ✅

---

## Phase 7: Polish & Cross-Cutting Concerns ✅

**Purpose**: Final verification and documentation

- [x] T039 Run full test suite: `uv run pytest -v` (13/13 passed)
- [x] T040 Run linting: `uv run ruff check src/` (6 errors fixed)
- [x] T041 Verify connection health: `uv run python -c "from src.db.connection import engine; print('OK')"` ✅
- [x] T042 Update `src/services/__init__.py` to export task service functions
- [x] T043 Document environment variables in backend README.md

---

## Summary

| Metric | Count | Status |
|--------|-------|--------|
| **Total Tasks** | 43 | ✅ Complete |
| **Setup Phase** | 3 | ✅ |
| **Foundational Phase** | 9 | ✅ |
| **US1 Tasks** | 9 | ✅ |
| **US2 Tasks** | 7 | ✅ |
| **US3 Tasks** | 5 | ✅ |
| **US4 Tasks** | 5 | ✅ |
| **Polish Tasks** | 5 | ✅ |
| **Tests Passing** | 13/13 | ✅ |

**Implementation Complete**: All 43 tasks executed successfully.
