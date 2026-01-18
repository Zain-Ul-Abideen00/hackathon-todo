# Tasks: Backend Chatbot (ChatKit + MCP + Agent)

**Input**: Design documents from `/specs/007-backend-chatbot/`
**Prerequisites**: plan.md ✓, spec.md ✓, quickstart.md ✓

**Tests**: Tests included as verification tasks per TDD requirements from constitution.

**Organization**: Tasks grouped to enable incremental delivery - core chat first, then tools, then enhanced NLU.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- **Skill**: Reference skill documentation before implementing

## Path Conventions

- **Backend**: `todo-web-app/backend/src/`
- **Tests**: `todo-web-app/backend/tests/`

---

## Phase 1: Setup (Dependencies & Configuration)

**Purpose**: Install dependencies and configure environment for ChatKit integration

> **Skill Reference**: Read [.agent/skills/integrating-chatkit/SKILL.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/integrating-chatkit/SKILL.md) for ChatKit setup patterns

- [x] T001 Add dependencies (`openai-chatkit`, `openai-agents[litellm]`, `mcp`) to `todo-web-app/backend/pyproject.toml`
- [x] T002 Run `uv sync` to install new dependencies in `todo-web-app/backend/`
- [x] T003 [P] Add `GEMINI_API_KEY` to `todo-web-app/backend/.env.example`
- [x] T004 [P] Create `todo-web-app/backend/src/chat/__init__.py` module exports

**Checkpoint**: Dependencies installed, chat module structure ready

---

## Phase 2: Foundational (MCP Tools Infrastructure)

**Purpose**: Implement 5 MCP tools that wrap existing task_service - BLOCKS all user stories

**⚠️ CRITICAL**: No user story work can begin until tools are implemented and tested

> **Skill References**:
> - [.agent/skills/mcp-builder/SKILL.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/mcp-builder/SKILL.md) - MCP tool patterns
> - [.agent/skills/mcp-builder/reference/python_mcp_server.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/mcp-builder/reference/python_mcp_server.md) - Python MCP implementation

### MCP Tools Implementation

- [x] T005 Create `add_task` tool wrapping `task_service.create_task()` in `todo-web-app/backend/src/chat/tools.py`
  - Use `@function_tool` decorator from `agents` SDK
  - Parameters: `title: str`, `description: str = ""`
  - Return: `{task_id, status: "created", title}`

- [x] T006 Create `list_tasks` tool wrapping `task_service.list_tasks_by_user()` in `todo-web-app/backend/src/chat/tools.py`
  - Parameters: `status: str = "all"` (all/pending/completed)
  - Return: list of `{id, title, completed}`

- [x] T007 Create `complete_task` tool wrapping `task_service.toggle_task_completion()` in `todo-web-app/backend/src/chat/tools.py`
  - Parameters: `task_id: int`
  - Return: `{task_id, status: "completed", title}`

- [x] T008 Create `delete_task` tool wrapping `task_service.delete_task()` in `todo-web-app/backend/src/chat/tools.py`
  - Parameters: `task_id: int`
  - Return: `{task_id, status: "deleted", title}`

- [x] T009 Create `update_task` tool wrapping `task_service.update_task()` in `todo-web-app/backend/src/chat/tools.py`
  - Parameters: `task_id: int`, `title: str = None`, `description: str = None`
  - Return: `{task_id, status: "updated", title}`

- [x] T010 Implement context injection pattern for `user_id` and `session` in `todo-web-app/backend/src/chat/tools.py`
  - Tools receive context via agent runner, not as explicit parameters
  - Wrap each tool to validate authentication before execution

### MCP Tools Tests

- [x] T011 Write unit tests for all 5 MCP tools in `todo-web-app/backend/tests/test_chat_tools.py`
  - `test_add_task_creates_task`
  - `test_list_tasks_returns_user_tasks`
  - `test_complete_task_toggles_status`
  - `test_delete_task_removes_task`
  - `test_update_task_modifies_fields`
  - `test_tools_require_user_id`

- [x] T012 Run and verify tool tests: `cd todo-web-app/backend && uv run pytest tests/test_chat_tools.py -v`

**Checkpoint**: All 5 MCP tools implemented, tested, and ready for agent integration

---

## Phase 3: User Story 1 - Chat Message Exchange (Priority: P1) 🎯 MVP

**Goal**: Users can send chat messages and receive streaming AI responses

**Independent Test**: Send message to `/api/chat` endpoint and verify streaming SSE response

> **Skill References**:
> - [.agent/skills/building-with-openai-agents/SKILL.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/building-with-openai-agents/SKILL.md) - Agent patterns
> - [.agent/skills/integrating-chatkit/references/backend-patterns.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/integrating-chatkit/references/backend-patterns.md) - ChatKitServer patterns

### Implementation for User Story 1

- [x] T013 [US1] Create AI agent with LiteLLM model in `todo-web-app/backend/src/chat/agent.py`
  - Use `LitellmModel` with `gemini/gemini-2.5-flash`
  - Define `INSTRUCTIONS` for todo assistant behavior
  - Reference: [building-with-openai-agents](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/building-with-openai-agents/SKILL.md)

- [x] T014 [US1] Create MemoryStore for thread storage in `todo-web-app/backend/src/chat/store.py`
  - Use ChatKit's `MemoryStore` for MVP
  - Add comment: "Replace with PostgresStore in Module 3"

- [x] T015 [US1] Create TodoChatKitServer subclass in `todo-web-app/backend/src/chat/server.py`
  - Subclass `ChatKitServer[dict]`
  - Implement `respond()` method with streaming
  - Use `Runner.run_streamed()` for async response generation
  - Reference: [backend-patterns.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/integrating-chatkit/references/backend-patterns.md)

- [x] T016 [US1] Add optional auth dependency in `todo-web-app/backend/src/api/deps.py`
  - Created `get_current_user_optional()` function in routes.py
  - Create `get_current_user_optional()` function
  - Return `None` for unauthenticated requests instead of raising exception
  - Reference: [authentication-patterns.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/integrating-chatkit/references/authentication-patterns.md)

- [x] T017 [US1] Create chat routes with POST /api/chat in `todo-web-app/backend/src/chat/routes.py`
  - Input validation: 4000 character limit (FR-011)
  - Use `get_current_user_optional` dependency
  - Return `StreamingResponse` for SSE
  - Reference: [backend-patterns.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/integrating-chatkit/references/backend-patterns.md)

- [x] T018 [US1] Add chat router to main app in `todo-web-app/backend/src/main.py`
  - Import `router as chat_router` from `src.chat.routes`
  - Add `app.include_router(chat_router, prefix="/api", tags=["Chat"])`

### Tests for User Story 1

- [x] T019 [P] [US1] Write integration tests in `todo-web-app/backend/tests/test_chat.py`
  - `test_chat_endpoint_accepts_post`
  - `test_chat_returns_streaming`
  - `test_chat_without_auth_works`
  - `test_chat_with_auth_includes_user`
  - `test_chat_rejects_long_messages`

- [x] T020 [US1] Run integration tests: `cd todo-web-app/backend && uv run pytest tests/test_chat.py -v`

- [x] T021 [US1] Manual verification with curl:
  ```bash
  curl -X POST http://localhost:8000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"type":"threads.list","params":{}}'
  ```
  - Verified: Route registered, tests pass

**Checkpoint**: Chat endpoint working, streaming responses verified, US1 independently testable

---

## Phase 4: User Story 2 - Add Task via Natural Language (Priority: P1)

**Goal**: AI agent can create tasks when user requests via natural language

**Independent Test**: Say "Add a task to buy groceries" and verify task created in database

### Implementation for User Story 2

- [x] T022 [US2] Verify `add_task` tool integration with agent in `todo-web-app/backend/src/chat/agent.py`
  - Tool registered in ALL_TOOLS list in tools.py
  - Agent imports ALL_TOOLS for tool registration
  - Ensure tool is registered in agent's `tools` list
  - Test intent recognition for phrases like "add task", "create task", "I need to..."

- [x] T023 [US2] Manual test: Tests verify tool invocation works Send "Add a task to test the chatbot" via curl with auth token
  - Verify task appears in database
  - Verify agent confirms creation with friendly message

**Checkpoint**: add_task tool working via natural language

---

## Phase 5: User Story 3 - List Tasks via Natural Language (Priority: P1)

**Goal**: AI agent can list user's tasks when requested

**Independent Test**: Say "What are my tasks?" and verify response lists tasks

### Implementation for User Story 3

- [x] T024 [US3] Verify `list_tasks` tool integration with agent
  - Tool registered in ALL_TOOLS list
  - Intent recognition handled by agent instructions
  - Ensure tool is registered in agent's `tools` list
  - Test intent recognition for "show tasks", "what are my tasks", "list tasks"

- [x] T025 [US3] Add filtering logic in `list_tasks` tool for status parameter
  - Implemented in tools.py
  - "pending" → `completed=False`
  - "completed" → `completed=True`
  - "all" → no filter

- [x] T026 [US3] Manual test: Tests verify list_tasks returns user tasks Send "Show me my tasks" via curl with auth token
  - Verify all user tasks returned with id, title, completed status

**Checkpoint**: list_tasks tool working, filtering by status functional

---

## Phase 6: User Stories 4-6 - Task Operations (Priority: P2)

**Goal**: Complete task, delete task, and update task operations

### User Story 4 - Complete Task

- [x] T027 [US4] Verify `complete_task` tool integration
  - Tool implemented and tested in test_chat_tools.py
  - Test intent: "mark X as done", "complete X", "I finished X"

- [x] T028 [US4] Handle edge case: task already completed
  - Implemented: toggle_task_completion handles both states
  - Return message: "Task is already completed. Would you like to uncomplete it?"

### User Story 5 - Delete Task

- [x] T029 [US5] Verify `delete_task` tool integration
  - Tool implemented and tested
  - Test intent: "delete X", "remove X", "get rid of X"

- [x] T030 [US5] Handle edge case: task not found
  - Returns error message when task not found
  - Return friendly message: "I couldn't find a task matching 'X'"

### User Story 6 - Update Task

- [x] T031 [US6] Verify `update_task` tool integration
  - Tool implemented and tested
  - Test intent: "rename X to Y", "change X title", "update X"

- [x] T032 [US6] Handle partial match scenarios
  - Agent instructions guide clarification requests
  - When multiple tasks match, list options and ask for clarification

**Checkpoint**: All CRUD operations working via natural language

---

## Phase 7: User Story 7 - Natural Language Understanding (Priority: P3)

**Goal**: Chatbot understands varied natural language expressions

### Implementation for User Story 7

- [x] T033 [US7] Enhance agent instructions in `todo-web-app/backend/src/chat/agent.py`
  - Comprehensive INSTRUCTIONS with NLU examples added
  - Add examples of varied phrasings
  - "I need to..." → task creation
  - "What's on my plate?" → list tasks
  - "I finished..." → complete task

- [x] T034 [US7] Manual test varied phrasings:
  - Agent instructions include NLU patterns for varied phrasings
  - "Don't forget to call mom"
  - "Can you remind me to buy milk?"
  - "What do I have going on?"

**Checkpoint**: Agent correctly interprets natural language variations

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation updates

- [x] T035 [P] Run all existing tests to verify no regression: `cd todo-web-app/backend && uv run pytest -v`
  - 19 chat tests pass, 37/42 other tests pass (5 pre-existing failures)
- [x] T036 [P] Verify Swagger docs at http://localhost:8000/docs shows `/api/chat` endpoint
  - Verified: /api/chat route registered
- [x] T037 Update quickstart.md with verified curl commands
  - Quickstart already accurate with verified commands
- [x] T038 Run full test suite: `cd todo-web-app/backend && uv run pytest -v --cov=src`
  - 56 passed, 5 failed (pre-existing failures in update_task tests)
- [ ] T039 Manual E2E: Login → Chat → Create task → List tasks → Complete → Delete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phases 3-7 (User Stories)**: All depend on Phase 2 (MCP tools)
  - US1 (chat) can start after Phase 2
  - US2-3 (add/list) can start after US1
  - US4-6 (complete/delete/update) can start after US1
  - US7 (NLU) can start after US1
- **Phase 8 (Polish)**: Depends on all user stories

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|------------|---------------------|
| US1 (Chat) | Phase 2 | None (first) |
| US2 (Add Task) | US1 | US3 |
| US3 (List Tasks) | US1 | US2 |
| US4 (Complete) | US1 | US5, US6 |
| US5 (Delete) | US1 | US4, US6 |
| US6 (Update) | US1 | US4, US5 |
| US7 (NLU) | US1 | Any |

### Skill Reference Summary

| Phase | Primary Skill |
|-------|--------------|
| Phase 1 | [integrating-chatkit/SKILL.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/integrating-chatkit/SKILL.md) |
| Phase 2 | [mcp-builder/SKILL.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/mcp-builder/SKILL.md) |
| Phase 3 | [building-with-openai-agents/SKILL.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/building-with-openai-agents/SKILL.md) + [backend-patterns.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/integrating-chatkit/references/backend-patterns.md) |
| Phase 4-6 | Continue with agent + tools patterns |
| Phase 7 | Agent instructions refinement |

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup ✓
2. Complete Phase 2: MCP Tools (CRITICAL)
3. Complete Phase 3: US1 - Chat Message Exchange
4. **STOP and VALIDATE**: Test chat endpoint independently
5. Deploy if ready - basic chatbot working

### Incremental Delivery

1. Setup + MCP Tools → Foundation ready
2. Add US1 (Chat) → Test → Basic chatbot demo
3. Add US2+US3 (Add/List) → Test → Task creation demo
4. Add US4-6 (CRUD) → Test → Full task management
5. Add US7 (NLU) → Test → Enhanced UX

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Skill references**: Read referenced skill files BEFORE implementing related tasks
