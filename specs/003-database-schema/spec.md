# Feature Specification: Database Schema for Todo App (Module 2)

**Feature Branch**: `003-database-schema`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description: "Database Schema for Todo App - Persistent storage for user tasks with Neon PostgreSQL, SQLModel ORM, and Alembic migrations"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Task Persistence (Priority: P1)

As a user, I want my tasks to be saved in the database so that they persist across sessions and device restarts.

**Why this priority**: Core functionality - without persistence, the application cannot function as a usable todo app. All other features depend on reliable data storage.

**Independent Test**: Can be fully tested by creating a task via API, restarting the server, and verifying the task is still retrievable. Delivers the fundamental value of data durability.

**Acceptance Scenarios**:

1. **Given** a user has created a task, **When** the server restarts, **Then** the task is still available when queried
2. **Given** a user creates a task with title "Buy groceries" and description "Milk, eggs, bread", **When** the task is saved, **Then** it is assigned a unique auto-incrementing ID
3. **Given** a user creates a task, **When** viewing the task, **Then** created_at and updated_at timestamps are populated with UTC time
4. **Given** a user creates a task without a description, **When** the task is saved, **Then** the description is stored as null/empty

---

### User Story 2 - User Data Isolation (Priority: P1)

As a user, I can only see and manage tasks that belong to me, ensuring my data is private and secure.

**Why this priority**: Security requirement - user data isolation is critical for a multi-user application. Without this, users could access each other's data.

**Independent Test**: Can be tested by creating tasks for User A and User B, then querying as User A and verifying only User A's tasks are returned.

**Acceptance Scenarios**:

1. **Given** User A has 3 tasks and User B has 2 tasks, **When** User A queries their tasks, **Then** only User A's 3 tasks are returned
2. **Given** User A attempts to access User B's task by ID, **When** the query is processed, **Then** the request is rejected or returns not found
3. **Given** a new user with no tasks, **When** querying their tasks, **Then** an empty list is returned

---

### User Story 3 - Schema Evolution with Migrations (Priority: P2)

As a developer, I can evolve the database schema using version-controlled migrations that can be applied and rolled back safely.

**Why this priority**: Developer experience and maintainability - migrations enable safe schema changes in production without data loss.

**Independent Test**: Can be tested by running migration upgrade, verifying schema changes, then running downgrade to verify rollback works.

**Acceptance Scenarios**:

1. **Given** the initial database state, **When** running `alembic upgrade head`, **Then** all tables and indexes are created successfully
2. **Given** a new migration is generated, **When** running upgrade, **Then** the database schema reflects the changes
3. **Given** a migration has been applied, **When** running `alembic downgrade -1`, **Then** the previous schema state is restored
4. **Given** a clean database, **When** viewing migration history, **Then** all migrations are shown in chronological order

---

### User Story 4 - Task Status Filtering (Priority: P3)

As a user, I want to efficiently filter my tasks by completion status so I can focus on pending work or review completed items.

**Why this priority**: User experience enhancement - while not core functionality, efficient filtering improves productivity.

**Independent Test**: Can be tested by creating completed and pending tasks, then querying with status filter and verifying correct results are returned.

**Acceptance Scenarios**:

1. **Given** a user has 5 completed and 3 pending tasks, **When** filtering by completed=true, **Then** only the 5 completed tasks are returned
2. **Given** a user has tasks, **When** filtering by completed=false, **Then** only pending tasks are returned
3. **Given** the tasks table has many rows, **When** filtering by user_id and completed status, **Then** the query uses indexes for efficient retrieval

---

### Edge Cases

- What happens when a task title exceeds 200 characters? → Validation error returned before database insert
- What happens when a task description exceeds 1000 characters? → Validation error returned before database insert
- What happens when the database connection is unavailable? → Appropriate error response with retry guidance
- What happens when attempting to create a task with a non-existent user_id? → Foreign key constraint prevents creation
- What happens during concurrent task creation by the same user? → Each task gets a unique ID; no data corruption

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST connect to Neon PostgreSQL database using async connection pooling
- **FR-002**: System MUST define a Task entity with id (auto-increment primary key), user_id, title, description, completed status, created_at, and updated_at fields
- **FR-003**: System MUST enforce title length maximum of 200 characters
- **FR-004**: System MUST enforce description length maximum of 1000 characters (optional field)
- **FR-005**: System MUST default completed status to false for new tasks
- **FR-006**: System MUST automatically set created_at timestamp on task creation (UTC)
- **FR-007**: System MUST automatically update updated_at timestamp on task modification (UTC)
- **FR-008**: System MUST create an index on tasks.user_id for efficient user filtering
- **FR-009**: System MUST create an index on tasks.completed for efficient status filtering
- **FR-010**: System MUST support CRUD operations (Create, Read, Update, Delete) for tasks via pytest-verified functions
- **FR-011**: System MUST support database schema migrations via Alembic
- **FR-012**: All database operations MUST be asynchronous using asyncpg driver
- **FR-013**: System MUST filter all task queries by authenticated user_id to enforce data isolation

### Key Entities

- **Task**: Represents a todo item belonging to a user. Contains title (required, max 200 chars), description (optional, max 1000 chars), completion status, and automatic timestamps. Linked to User via user_id foreign key.

- **User (Reference Only)**: Managed by Better Auth. Contains id (string primary key), email (unique), and name. The Task entity references users by user_id but does not define the User table.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Database connection is established within 2 seconds of application startup
- **SC-002**: All CRUD operations complete within 100ms for single-record operations under normal load
- **SC-003**: User can query their tasks and receive only their own data (100% data isolation)
- **SC-004**: All migrations can be applied and rolled back without data loss or schema corruption
- **SC-005**: 100% of CRUD operation tests pass in pytest suite
- **SC-006**: Queries filtering by user_id utilize the database index (verified via query plan)
- **SC-007**: Application handles database connection failures gracefully with appropriate error responses

## Assumptions

- Better Auth manages user authentication and provides user_id for task ownership
- Neon PostgreSQL is pre-configured and accessible via DATABASE_URL environment variable
- Python 3.12+ runtime environment with uv package manager
- SQLModel is used as the ORM layer (combines SQLAlchemy + Pydantic)
- asyncpg is the PostgreSQL driver for async operations
- Development uses local pytest for verification; production uses the same schema

## Out of Scope

- User table management (handled by Better Auth)
- Authentication and authorization logic (Module 4)
- API endpoint implementation (Module 3)
- Frontend integration
- Real-time synchronization
- Task categories, tags, or priorities (future enhancement)
- Task archival or soft delete (future enhancement)
