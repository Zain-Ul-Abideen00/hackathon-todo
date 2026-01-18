# Feature Specification: Conversation Persistence & Testing

**Feature Branch**: `009-chat-persistence`
**Created**: 2026-01-18
**Status**: Draft
**Input**: User description: "Conversation Persistence & Testing - Store chat conversations in database, resume after restart, guest vs authenticated user handling with localStorage fallback, auto-title generation, and comprehensive test suite"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticated User Chat Persistence (Priority: P1)

As an authenticated user, I want my chat conversations to be stored in the database so that I can resume them after server restart or from any device.

**Why this priority**: Core feature enabling the chatbot to be useful long-term. Without persistence, users lose context every session, making the assistant less valuable.

**Independent Test**: Can be fully tested by logging in, sending messages, restarting the backend server, and verifying conversation history is restored.

**Acceptance Scenarios**:

1. **Given** an authenticated user sends a message, **When** the message is processed, **Then** the message is saved to the `chatkit_items` table with correct `thread_id` and `user_id`
2. **Given** an authenticated user has existing conversations, **When** they log in from a new device or after server restart, **Then** their conversation history loads automatically
3. **Given** an authenticated user has multiple conversations, **When** they list threads, **Then** only their own threads are returned (user isolation)
4. **Given** an authenticated user sends a message, **When** the response streams, **Then** both user message and assistant response are persisted atomically

---

### User Story 2 - Guest User Local Storage Fallback (Priority: P1)

As a guest (unauthenticated) user, I want my chat history saved in browser localStorage so I can continue conversations within the same browser session.

**Why this priority**: Allows users to try the chatbot before signing up, improving conversion. Essential UX for onboarding.

**Independent Test**: Can be tested by using the chatbot without logging in, refreshing the page, and verifying the conversation persists in localStorage.

**Acceptance Scenarios**:

1. **Given** a guest user sends a message, **When** the message is processed, **Then** the thread_id is saved to `localStorage` under key `chatkit_thread_anonymous`
2. **Given** a guest user refreshes the page, **When** the chat widget loads, **Then** the existing thread is restored from localStorage
3. **Given** a guest user's conversation, **When** they sign in, **Then** their anonymous thread remains in localStorage (not migrated - new authenticated thread created)
4. **Given** a guest user, **When** they clear browser data, **Then** their chat history is lost (expected behavior)

---

### User Story 3 - Auto-Title Generation (Priority: P2)

As a user, I want conversation threads to have auto-generated titles so I can identify and navigate between different conversations.

**Why this priority**: Improves UX for users with multiple conversations. Not blocking core functionality but enhances usability.

**Independent Test**: Send a message to a new thread and verify a meaningful title (3-5 words) is generated and displayed.

**Acceptance Scenarios**:

1. **Given** a new thread without a title, **When** the first user message is processed, **Then** an async task generates a 3-5 word title summarizing the conversation topic
2. **Given** a thread with an auto-generated title, **When** the user views thread list, **Then** the title is displayed instead of "New Thread"
3. **Given** title generation fails, **When** the system encounters an error, **Then** a fallback title is used (e.g., truncated first message) and no error is shown to user
4. **Given** a thread update with new title, **When** the title is saved, **Then** a `ThreadUpdatedEvent` is sent to the frontend via SSE

---

### User Story 4 - Thread Restoration on Login (Priority: P2)

As an authenticated user returning to the app, I want to automatically resume my most recent conversation so I can continue where I left off.

**Why this priority**: Reduces friction for returning users. Enhances continuity of experience.

**Independent Test**: Log out, log back in, and verify the most recent thread is automatically loaded.

**Acceptance Scenarios**:

1. **Given** an authenticated user opens the chat widget, **When** they have previous conversations, **Then** the most recent thread is automatically loaded
2. **Given** an authenticated user with no previous conversations, **When** they open the chat widget, **Then** a new thread is created with the start screen prompts
3. **Given** the localStorage has a thread_id, **When** the user authenticates, **Then** the system fetches the latest thread from the database (not localStorage)

---

### User Story 5 - Database Persistence Models (Priority: P1)

As a developer, I want proper database models for ChatKit threads and items so that conversations can be reliably stored and queried.

**Why this priority**: Technical foundation required for all persistence features.

**Independent Test**: Run Alembic migration and verify tables are created with correct schema.

**Acceptance Scenarios**:

1. **Given** the migration script, **When** `alembic upgrade head` is run, **Then** `chatkit_threads` and `chatkit_items` tables are created successfully
2. **Given** the ChatKitThread model, **When** inspecting the table, **Then** it has columns: `id` (TEXT PK), `user_id` (TEXT, indexed), `created_at` (TIMESTAMPTZ), `metadata` (JSONB)
3. **Given** the ChatKitItem model, **When** inspecting the table, **Then** it has columns: `id` (TEXT PK), `thread_id` (TEXT FK with CASCADE delete), `type` (TEXT), `content` (JSONB), `created_at` (TIMESTAMPTZ)
4. **Given** a thread is deleted, **When** the delete cascades, **Then** all associated items are also deleted

---

### User Story 6 - PostgresStore Implementation (Priority: P1)

As a developer, I need a PostgresStore class that implements the ChatKit Store protocol so threads and items are persisted to the database.

**Why this priority**: Required to enable database persistence instead of in-memory storage.

**Independent Test**: Unit test the PostgresStore methods against a test database.

**Acceptance Scenarios**:

1. **Given** the PostgresStore, **When** `load_thread()` is called for a new thread_id, **Then** a new thread is created in the database with user_id from context
2. **Given** the PostgresStore, **When** `save_thread()` is called, **Then** the thread metadata (including title) is upserted
3. **Given** the PostgresStore, **When** `add_thread_item()` is called, **Then** the item is inserted with proper thread_id reference
4. **Given** the PostgresStore, **When** `load_threads()` is called with user_id context, **Then** only threads belonging to that user are returned
5. **Given** an anonymous user (null user_id), **When** `load_threads()` is called, **Then** an empty list is returned (no history for guests)

---

### User Story 7 - User Isolation (Priority: P1)

As a system owner, I want conversations to be isolated per user so that users cannot access each other's chat history.

**Why this priority**: Security and privacy requirement. Critical for production deployment.

**Independent Test**: Create threads for two different users and verify each user only sees their own threads.

**Acceptance Scenarios**:

1. **Given** User A has conversations, **When** User B lists threads, **Then** User A's threads are not visible
2. **Given** User A's thread_id, **When** User B tries to load that thread, **Then** a new thread is created for User B (not User A's data)
3. **Given** the API endpoint, **When** a request is made without authentication, **Then** no persistent threads are returned

---

### User Story 8 - Unit Tests for MCP Tools (Priority: P2)

As a developer, I want unit tests for the chatbot MCP tools so that tool functionality is verified in isolation.

**Why this priority**: Ensures reliability of task management actions through the chatbot.

**Independent Test**: Run pytest on the tools test module.

**Acceptance Scenarios**:

1. **Given** the `add_task` tool test, **When** executed, **Then** it verifies task creation with mocked session
2. **Given** the `list_tasks` tool test, **When** executed, **Then** it verifies correct filtering and response format
3. **Given** the `complete_task` tool test, **When** executed, **Then** it verifies status change is persisted
4. **Given** all tool tests, **When** coverage is measured, **Then** tool function coverage is ≥80%

---

### User Story 9 - Integration Tests for Chat Endpoint (Priority: P2)

As a developer, I want integration tests for the `/chatkit` endpoint so that the API contract is verified.

**Why this priority**: Ensures the endpoint works correctly with real HTTP requests.

**Independent Test**: Run pytest on the chat integration test module.

**Acceptance Scenarios**:

1. **Given** a `thread.respond` request, **When** sent with valid auth, **Then** the response streams SSE events
2. **Given** a `threads.list` request, **When** sent with valid auth, **Then** the response includes user's threads
3. **Given** a request without auth, **When** sent to protected actions, **Then** appropriate error response returned
4. **Given** an invalid request body, **When** sent, **Then** 400 error with descriptive message

---

### User Story 10 - End-to-End Chat Flow Test (Priority: P3)

As a developer, I want an E2E test that verifies the complete chat flow: Login → Chat → Create task → Verify task exists.

**Why this priority**: Validates the full integration of auth, chat, and task management.

**Independent Test**: Run the E2E test using the browser subagent or pytest with live services.

**Acceptance Scenarios**:

1. **Given** a test user, **When** they log in, send "Create a task to buy groceries", **Then** the chatbot responds confirming task creation
2. **Given** the task was created via chat, **When** querying the tasks API, **Then** the "buy groceries" task exists
3. **Given** the full flow, **When** executed, **Then** all steps complete within 30 seconds

---

### Edge Cases

- What happens when the database connection fails during message save? (Graceful error message, retry logic)
- How does the system handle concurrent messages from the same user? (Thread locking or queue)
- What happens if localStorage is full? (Fallback to session-only mode)
- How does the system handle extremely long conversations (>1000 messages)? (Pagination)
- What happens if title generation takes too long? (Timeout, fallback title)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist chat threads to PostgreSQL using the `chatkit_threads` table
- **FR-002**: System MUST persist chat items to PostgreSQL using the `chatkit_items` table with foreign key to thread
- **FR-003**: System MUST implement user isolation - users can only access their own threads
- **FR-004**: System MUST store thread_id in localStorage for guest users under key `chatkit_thread_{user_id|anonymous}`
- **FR-005**: System MUST auto-generate thread titles using LLM after first user message
- **FR-006**: System MUST restore the most recent thread for authenticated users on login
- **FR-007**: System MUST return empty thread list for anonymous/guest users from database
- **FR-008**: System MUST cascade delete items when a thread is deleted
- **FR-009**: System MUST implement the ChatKit Store protocol methods: `load_thread`, `save_thread`, `add_thread_item`, `load_thread_items`, `load_threads`, `delete_thread`
- **FR-010**: System MUST emit `ThreadUpdatedEvent` when thread title is generated
- **FR-011**: System MUST support thread pagination with `after` cursor and `limit` parameters
- **FR-012**: System MUST provide unit tests for all MCP tools with ≥80% coverage
- **FR-013**: System MUST provide integration tests for the `/chatkit` endpoint

### Key Entities

- **ChatKitThread**: Represents a conversation. Key attributes: id (UUID), user_id (string, nullable for guests), created_at (timestamp), metadata (JSONB containing title, user preferences)
- **ChatKitItem**: Represents a message or event in a thread. Key attributes: id (UUID), thread_id (FK), type (string - "message", "tool_call", etc.), content (JSONB), created_at (timestamp)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authenticated users can resume conversations across server restarts 100% of the time
- **SC-002**: Guest user conversations are preserved in localStorage across page refreshes
- **SC-003**: User isolation is enforced - 0% cross-user data leakage in security tests
- **SC-004**: Auto-generated titles appear within 5 seconds of first message
- **SC-005**: Database migration applies successfully with zero errors
- **SC-006**: Unit test coverage for chat module is ≥80%
- **SC-007**: All integration tests pass for chat endpoint
- **SC-008**: E2E test (Login → Chat → Create task → Verify) completes successfully

---

## Assumptions

- The existing ChatKit backend infrastructure (server.py, routes.py) is in place and functional
- Better Auth is configured and providing user sessions with `session.token`
- LiteLLM with Gemini is configured for title generation
- The Alembic migration system is set up and working
- The frontend ChatBot component exists and can be updated
