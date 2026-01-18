# Feature Specification: Backend Chatbot (ChatKit + MCP + Agent)

**Feature Branch**: `007-backend-chatbot`
**Created**: 2026-01-18
**Status**: Draft
**Input**: User description: "Backend Chatbot with ChatKit, MCP tools, and OpenAI Agents SDK for natural language task management"

## Clarifications

### Session 2026-01-18

- Q: What is the authentication mode for the chat endpoint? → A: Auth required for task operations only - chat accessible without auth, but all 5 MCP tools require valid authentication token
- Q: How should chat threads be persisted? → A: PostgreSQL persistence - create chatkit_threads and chatkit_items tables with Alembic migration, implement PostgresStore class
- Q: What is the maximum message input length? → A: 4000 characters (~1000 tokens) - reject longer messages with helpful error

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Chat Message Exchange (Priority: P1)

As a user, I can send chat messages and receive streaming AI responses that help me manage my tasks through natural language conversation.

**Why this priority**: This is the core functionality enabling all other features. Without real-time chat streaming, the chatbot is unusable.

**Independent Test**: Can be tested by sending a message to the chat endpoint and verifying streaming text responses are returned within acceptable latency.

**Acceptance Scenarios**:

1. **Given** a user with a valid session, **When** they send "Hello, what can you do?", **Then** they receive a streaming response explaining task management capabilities.
2. **Given** a user sends a message, **When** the response starts streaming, **Then** each chunk arrives in under 200ms after the previous chunk.
3. **Given** network disruption mid-stream, **When** connection resumes, **Then** partial response is preserved and error is gracefully handled.

---

### User Story 2 - Add Task via Natural Language (Priority: P1)

As an AI agent, I can call `add_task` to create tasks when a user requests task creation through natural language.

**Why this priority**: Task creation is the primary action users will request, directly enabling productivity.

**Independent Test**: Ask the chatbot "Add a task to buy groceries" and verify a new task appears in the user's task list.

**Acceptance Scenarios**:

1. **Given** a user says "Add a task to finish the report", **When** the agent processes the request, **Then** a task titled "finish the report" is created for that user.
2. **Given** a user says "Create a high priority task to call mom tomorrow", **When** the agent processes, **Then** task is created with priority set appropriately.
3. **Given** a user provides ambiguous input like "Do that thing", **When** the agent cannot determine task details, **Then** it asks for clarification.

---

### User Story 3 - List Tasks via Natural Language (Priority: P1)

As an AI agent, I can call `list_tasks` to retrieve and display a user's tasks when requested.

**Why this priority**: Users need to see their existing tasks to interact with them meaningfully.

**Independent Test**: Ask "What are my tasks?" and verify the response lists all current tasks for the authenticated user.

**Acceptance Scenarios**:

1. **Given** a user has 5 tasks, **When** they ask "Show me my tasks", **Then** all 5 tasks are listed with titles, statuses, and priorities.
2. **Given** a user asks "What tasks are not done?", **When** the agent processes, **Then** only incomplete tasks are returned.
3. **Given** a user has no tasks, **When** they ask for their task list, **Then** the response indicates no tasks exist and offers to create one.

---

### User Story 4 - Complete Task via Natural Language (Priority: P2)

As an AI agent, I can call `complete_task` to mark tasks as done when a user indicates completion.

**Why this priority**: Completing tasks is essential for task management but depends on having tasks first.

**Independent Test**: Say "Mark 'buy groceries' as complete" and verify the task's completed status changes.

**Acceptance Scenarios**:

1. **Given** a user has a task "buy groceries", **When** they say "Complete the buy groceries task", **Then** that task is marked as completed.
2. **Given** multiple tasks with similar names, **When** user says "complete the task", **Then** agent asks which task they mean.
3. **Given** a task is already completed, **When** user asks to complete it again, **Then** agent confirms it's already done and offers to uncomplete it.

---

### User Story 5 - Delete Task via Natural Language (Priority: P2)

As an AI agent, I can call `delete_task` to remove tasks when a user requests deletion.

**Why this priority**: Deletion is important but used less frequently than completion.

**Independent Test**: Say "Delete the 'old meeting notes' task" and verify the task is removed from the list.

**Acceptance Scenarios**:

1. **Given** a user has a task "old meeting notes", **When** they say "Remove the old meeting notes task", **Then** that task is deleted.
2. **Given** user says "delete all my tasks", **When** the agent receives this, **Then** it asks for confirmation before bulk deletion.
3. **Given** task doesn't exist, **When** user tries to delete it, **Then** agent responds that the task was not found.

---

### User Story 6 - Update Task via Natural Language (Priority: P2)

As an AI agent, I can call `update_task` to modify task details when a user requests changes.

**Why this priority**: Editing tasks allows users to maintain accurate task lists.

**Independent Test**: Say "Change the priority of 'report' to high" and verify the task's priority updates.

**Acceptance Scenarios**:

1. **Given** a task titled "write report", **When** user says "Rename 'write report' to 'finish Q4 report'", **Then** the task title is updated.
2. **Given** a task with low priority, **When** user says "Make the grocery task urgent", **Then** priority changes to high.
3. **Given** user provides partial match, **When** multiple tasks match, **Then** agent lists matching tasks and asks which to update.

---

### User Story 7 - Natural Language Understanding (Priority: P3)

As a user, the chatbot understands varied natural language expressions for task management operations.

**Why this priority**: Enhanced UX but core functionality works with basic phrases.

**Independent Test**: Test multiple phrasings like "I need to...", "Don't forget to...", "Can you add..." and verify correct intent detection.

**Acceptance Scenarios**:

1. **Given** user says "I need to pick up dry cleaning", **When** agent processes, **Then** it understands this as a task creation request.
2. **Given** user says "What's on my plate?", **When** agent processes, **Then** it understands this as a list tasks request.
3. **Given** user says "I finished the laundry", **When** agent processes, **Then** it understands this as a complete task request.

---

### Edge Cases

- What happens when the user is not authenticated? Agent responds that authentication is required.
- What happens when database is unavailable? Agent returns a friendly error asking to try again later.
- What happens with extremely long messages? Input is truncated or rejected with a helpful message.
- What happens with concurrent requests from the same user? Sessions handle concurrent requests without data corruption.
- What happens when the LLM API (Gemini) is unavailable? Graceful error with retry suggestion.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose a `POST /api/chat` endpoint that handles the ChatKit protocol.
- **FR-002**: System MUST stream AI responses using Server-Sent Events (SSE) format.
- **FR-003**: System MUST implement 5 MCP tools: `add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`.
- **FR-004**: MCP tools MUST wrap the existing `task_service` functions for database operations.
- **FR-005**: Agent MUST use LiteLLM with the `gemini/gemini-2.5-flash` model for LLM capabilities.
- **FR-006**: System MUST allow unauthenticated access to the chat endpoint, but all task-related MCP tools (add_task, list_tasks, complete_task, delete_task, update_task) MUST require valid authentication. Unauthenticated users attempting task operations receive a "login required" message.
- **FR-007**: Agent MUST provide friendly confirmation messages after successful task operations.
- **FR-008**: Agent MUST return helpful error messages when operations fail.
- **FR-009**: System MUST enforce user isolation - users can only access their own tasks.
- **FR-010**: System MUST use `openai-chatkit`, `openai-agents[litellm]`, and `mcp` packages.
- **FR-011**: System MUST reject chat messages exceeding 4000 characters with a helpful error message indicating the limit.

### Key Entities

- **ChatThread**: Represents a conversation session. Persisted in `chatkit_threads` table with fields: id (UUID primary key), user_id (indexed), created_at, metadata (JSONB).
- **ChatMessage**: Individual message within a thread. Persisted in `chatkit_items` table with fields: id (UUID), thread_id (foreign key), type, content (JSONB), created_at.
- **Agent**: AI entity with instructions, tools, and model configuration.
- **MCPTool**: Function callable by the agent that wraps task_service operations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Chat endpoint responds with first streaming chunk within 2 seconds of request.
- **SC-002**: All 5 MCP tools execute task operations correctly with 100% accuracy.
- **SC-003**: 90% of natural language task requests are correctly understood without clarification.
- **SC-004**: Streaming responses complete delivery within 10 seconds for typical interactions.
- **SC-005**: Error responses are returned within 1 second when operations fail.
- **SC-006**: System correctly rejects unauthenticated requests to protected tools when auth is required.
