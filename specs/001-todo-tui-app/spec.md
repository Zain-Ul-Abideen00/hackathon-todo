# Feature Specification: Todo TUI App

**Feature Branch**: `001-todo-tui-app`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "Build a 'Todo TUI App' in `todo-console-app`..."

## User Scenarios & Testing

### User Story 1 - Task Dashboard & Navigation (Priority: P1)

As a user, I want to see a list of my tasks and navigate them using the keyboard so that I can quickly review what needs to be done.

**Why this priority**: Core functionality needed to view any data.

**Independent Test**: Launch app, see list (or empty state), use Up/Down arrows to highlight different rows.

**Acceptance Scenarios**:
1. **Given** the app is launched, **When** no tasks exist, **Then** show "No tasks found" message.
2. **Given** a list of tasks, **When** Down Arrow is pressed, **Then** focus moves to the next task.
3. **Given** the last task is focused, **When** Down Arrow is pressed, **Then** focus stays on the last task (or wraps if desired, but standard is stop).

---

### User Story 2 - Add New Task (Priority: P1)

As a user, I want to add a new task with a title and description so that I can track my work.

**Why this priority**: Essential for populating the app.

**Independent Test**: Open "Add" modal/form, enter data, save, see new task in dashboard.

**Acceptance Scenarios**:
1. **Given** dashboard view, **When** 'a' key (or designated add key) is pressed, **Then** show Add Task modal.
2. **Given** Add Task modal, **When** Title and Description are entered and Enter/Save pressed, **Then** task is saved and visible in list.
3. **Given** Add Task modal, **When** Escape is pressed, **Then** cancel logic applies (no task added).

---

### User Story 3 - Task Actions (Edit/Complete/Delete) (Priority: P2)

As a user, I want to mark tasks as done, update details, or remove them so that my list stays relevant.

**Why this priority**: Critical for task lifecycle management.

**Independent Test**: detailed below.

**Acceptance Scenarios**:
1. **Given** a selected task, **When** 'c' is pressed, **Then** task status toggles between Pending/Completed.
2. **Given** a selected task, **When** 'd' is pressed, **Then** a confirmation prompt appears. **When** confirmed, **Then** task is removed.
3. **Given** a selected task, **When** 'e' is pressed, **Then** Edit modal opens with pre-filled data.

---

### User Story 4 - Filtering (Priority: P3)

As a user, I want to filter tasks by status (All/Pending/Completed) so that I can focus on active work.

**Why this priority**: Improves usability for large lists.

**Independent Test**: Toggle filters, verify list content matches status.

**Acceptance Scenarios**:
1. **Given** task list, **When** filter set to 'Pending', **Then** only incomplete tasks show.
2. **Given** task list, **When** filter set to 'Completed', **Then** only finished tasks show.
3. **Given** task list, **When** filter set to 'All', **Then** all tasks show.

---

### User Story 5 - Data Persistence (Priority: P1)

As a user, I want my tasks to be saved to a file so that I don't lose them when I close the app.

**Why this priority**: Non-negotiable requirement for a useful app.

**Independent Test**: Add task, close app, restart app, task is present.

**Acceptance Scenarios**:
1. **Given** app with data, **When** app is closed and reopened, **Then** data is restored from JSON file.
2. **Given** fresh install, **When** app starts, **Then** empty JSON file is created if missing.

## Requirements

### Functional Requirements

- **FR-001**: System MUST use Textual framework for TUI.
- **FR-002**: System MUST support keyboard navigation (Up/Down/Enter/Esc).
- **FR-003**: System MUST persist data to a local JSON file (`tasks.json`) in the current working directory.
- **FR-004**: System MUST validate input (Title required) using Pydantic models.
- **FR-005**: System MUST run on Python 3.12+.
- **FR-006**: System MUST implement 'c' (complete), 'd' (delete), 'e' (edit) shortcuts.
- **FR-007**: System MUST require user confirmation before permanently deleting a task.
- **FR-008**: System MUST display tasks grouped by status (Pending first), then sorted by creation date (oldest first).

### Key Entities

- **Task**:
    - `id` (UUID): Unique identifier.
    - `title` (str): Short summary.
    - `description` (str): Detailed info.
    - `status` (enum): Pending, Completed.
    - `created_at` (datetime): Timestamp.

## Success Criteria

### Measurable Outcomes

- **SC-001**: User can add a task and see it persist after restart.
- **SC-002**: Filter switching updates view in under 200ms.
- **SC-003**: 100% of navigations achievable via keyboard (no mouse required).

## Clarifications

### Session 2025-12-31
- Q: Should deletion be instant, or should it require user confirmation? → A: Require Confirmation (User prompted before removal).
- Q: Where exactly should the data file be stored? → A: Current Working Directory (Portable `tasks.json`).
- Q: How should tasks be ordered by default? → A: Status Grouped (Pending first, then Oldest first).
