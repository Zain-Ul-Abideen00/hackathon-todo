# Task Checklist: Todo TUI App

**Feature**: Todo TUI App | **Branch**: `001-todo-tui-app` | **Spec**: [spec.md](spec.md)

## Implementation Strategy
- **MVP (Minimal Viable Product)**: Phases 1-4 (Setup, Persistence, Dashboard, Add Task).
- **Full Feature**: Phases 5-6 (Actions, Filters).
- **Methodology**: TDD (Red-Green-Refactor). Tests are required for all logic and UI interactions.
- **Structure**: Source code in `todo-console-app/src/`.

## Dependencies
- **Foundational**: US5 (Persistence) blocks all other stories.
- **US1 (Dashboard)**: Blocks US3 (Actions) and US4 (Filters).
- **US2 (Add)**: Can be parallel to US1 but practically needs US1 to verify.
- **Execution Order**: Phase 1 -> Phase 2 (US5) -> Phase 3 (US1) -> Phase 4 (US2) -> Phase 5 (US3) -> Phase 6 (US4).

---

## Phase 1: Setup
**Goal**: Initialize project structure and dependencies.

- [x] T001 Initialize Python project with `uv` in `todo-console-app/` <!-- id: 14 -->
- [x] T002 Add dependencies (`textual`, `pydantic`) and dev dependencies (`pytest`, `pytest-asyncio`, `pytest-textual`) <!-- id: 15 -->
- [x] T003 Create source directory structure `todo-console-app/src/` and `todo-console-app/tests/` <!-- id: 16 -->
- [x] T004 Create `conftest.py` for text fixtures in `todo-console-app/tests/conftest.py` <!-- id: 17 -->

## Phase 2: User Story 5 - Persistence (P1)
**Goal**: Enable data storage so tasks can be saved/loaded. This is the foundation.

- [x] T005 [US5] Create unit tests for `Task` model in `todo-console-app/tests/unit/test_models.py` <!-- id: 18 -->
- [x] T006 [US5] Implement `Task` (and `TaskStatus`) model in `todo-console-app/src/models.py` <!-- id: 19 -->
- [x] T007 [US5] Create unit tests for `JSONTaskStore` (load/save/atomic) in `todo-console-app/tests/unit/test_store.py` <!-- id: 20 -->
- [x] T008 [US5] Implement `JSONTaskStore` with atomic write logic in `todo-console-app/src/store.py` <!-- id: 21 -->

## Phase 3: User Story 1 - Dashboard & Navigation (P1)
**Goal**: View the list of tasks (requires US5).

- [x] T009 [US1] Create UI tests for App startup and list rendering in `todo-console-app/tests/ui/test_dashboard.py` <!-- id: 22 -->
- [x] T010 [US1] Implement `TaskItem` widget for individual rows in `todo-console-app/src/tui.py` <!-- id: 23 -->
- [x] T011 [US1] Implement `TodoApp` class and `on_mount` data loading in `todo-console-app/src/tui.py` <!-- id: 24 -->
- [x] T012 [US1] Implement `src/main.py` entry point <!-- id: 25 -->

## Phase 4: User Story 2 - Add Task (P1)
**Goal**: Add new items to the list.

- [x] T013 [US2] Create UI tests for "Add Task" modal interaction in `todo-console-app/tests/ui/test_add_task.py` <!-- id: 26 -->
- [x] T014 [US2] Implement `AddTaskModal` screen in `todo-console-app/src/tui.py` <!-- id: 27 -->
- [x] T015 [US2] Bind 'a' key to open modal and implement save callback in `todo-console-app/src/tui.py` <!-- id: 28 -->

## Phase 5: User Story 3 - Task Actions (P2)
**Goal**: Edit, Complete, and Delete tasks.

- [x] T016 [US3] Create UI tests for Delete (w/ confirmation) and Complete toggles in `todo-console-app/tests/ui/test_actions.py` <!-- id: 29 -->
- [x] T017 [US3] Implement Confirmation Modal screen in `todo-console-app/src/tui.py` <!-- id: 30 -->
- [x] T018 [US3] Implement 'd' key handler with modal confirmation in `todo-console-app/src/tui.py` <!-- id: 31 -->
- [x] T019 [US3] Implement 'c' key handler for status toggle in `todo-console-app/src/tui.py` <!-- id: 32 -->
- [x] T020 [US3] [P] Implement Edit Modal (reuse/extend Add Modal) and 'e' key handler in `todo-console-app/src/tui.py` <!-- id: 33 -->

## Phase 6: User Story 4 - Filtering (P3)
**Goal**: Filter view by Pending/Completed/All.

- [x] T021 [US4] Create UI tests for filtering logic in `todo-console-app/tests/ui/test_filters.py` <!-- id: 34 -->
- [x] T022 [US4] Implement filter tabs/keys and view update logic in `todo-console-app/src/tui.py` <!-- id: 35 -->

## Final Phase: Polish & Quality
**Goal**: Ensure compliance and smooth UX.

- [x] T023 Run full test suite and ensure 100% pass rate <!-- id: 36 -->
- [x] T024 Verify Keyboard Navigation (Manual check against SC-003) <!-- id: 37 -->
- [x] T025 Update `README.md` with usage instructions <!-- id: 38 -->
