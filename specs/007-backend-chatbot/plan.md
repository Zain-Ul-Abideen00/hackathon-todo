# Implementation Plan: Backend Chatbot (ChatKit + MCP + Agent)

**Branch**: `007-backend-chatbot` | **Date**: 2026-01-18 | **Spec**: [spec.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/specs/007-backend-chatbot/spec.md)
**Input**: Feature specification from `/specs/007-backend-chatbot/spec.md`

## Summary

Implement a ChatKit-powered AI chatbot backend that enables natural language task management. The system uses OpenAI Agents SDK with LiteLLM (Gemini model) and exposes 5 MCP tools that wrap existing `task_service` functions. Chat endpoint supports unauthenticated access for general conversation, but task operations require valid JWT authentication.

## Technical Context

**Language/Version**: Python 3.12+
**Primary Dependencies**: FastAPI, openai-chatkit, openai-agents[litellm], mcp, SQLModel
**Storage**: Neon PostgreSQL (chatkit_threads, chatkit_items tables via Alembic)
**Testing**: pytest + pytest-asyncio
**Target Platform**: Linux/Docker server (Railway/Render deployment)
**Project Type**: Web application (backend only for this module)
**Performance Goals**: First streaming chunk within 2 seconds, complete response within 10 seconds
**Constraints**: 4000 character message limit, user isolation enforced
**Scale/Scope**: Single-user sessions, async database operations

## Constitution Check

*GATE: All checks pass - no violations.*

| Principle | Status | Notes |
|-----------|--------|-------|
| II. FastAPI Backend | ✅ Pass | Async-first design, Pydantic models |
| III. Database Architecture | ✅ Pass | Alembic migration for chatkit tables |
| IV. Authentication | ✅ Pass | JWT verification for task tools, optional for chat |
| V. Security First | ✅ Pass | Input validation, user isolation, rate limiting deferred |
| VI. TDD | ✅ Pass | Tests for tools and endpoint planned |
| VII. Type Safety | ✅ Pass | Pydantic for MCP tools, type hints |
| XII. Agentic Development | ✅ Pass | Using fastapi-pro, mcp-developer, python-pro agents |
| XIII. ChatKit Integration | ✅ Pass | ChatKitServer subclass with SSE |
| XIV. AI Agent Architecture | ✅ Pass | LiteLLM with gemini-2.5-flash |
| XV. MCP Tool Design | ✅ Pass | Wrapping existing task_service |
| XVI. Conversation Persistence | ✅ Pass | PostgresStore implementation |

## Project Structure

### Documentation (this feature)

```text
specs/007-backend-chatbot/
├── spec.md              # Feature specification ✓
├── plan.md              # This file ✓
├── research.md          # Not needed - tech stack defined
├── quickstart.md        # Setup guide (to create)
└── checklists/          # Quality checklists ✓
```

### Source Code (repository root)

```text
todo-web-app/backend/
├── src/
│   ├── chat/                    # NEW: ChatKit integration
│   │   ├── __init__.py          # Module exports
│   │   ├── tools.py             # 5 MCP tools wrapping task_service
│   │   ├── agent.py             # AI agent with LiteLLM
│   │   ├── server.py            # TodoChatKitServer (ChatKitServer subclass)
│   │   ├── store.py             # MemoryStore (persistence in Module 3)
│   │   └── routes.py            # POST /api/chat endpoint
│   ├── services/
│   │   └── task_service.py      # EXISTING - reuse all functions
│   ├── api/
│   │   ├── deps.py              # EXISTING - auth dependencies
│   │   └── routes/              # EXISTING - task routes
│   └── main.py                  # MODIFY - add chat router
├── alembic/                     # FUTURE: Migration for chatkit tables
└── tests/
    ├── test_chat_tools.py       # NEW: Unit tests for MCP tools
    └── test_chat.py             # NEW: Integration tests for chat endpoint
```

**Structure Decision**: Extend existing backend with new `src/chat/` module

---

## Proposed Changes

### Phase 1: Dependencies & Configuration

#### [MODIFY] [pyproject.toml](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/pyproject.toml)

Add new dependencies:
```toml
dependencies = [
    # ... existing
    "openai-chatkit",
    "openai-agents[litellm]",
    "mcp",
]
```

#### [MODIFY] [.env.example](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/.env.example)

Add Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key
```

---

### Phase 2: MCP Tools Implementation

#### [NEW] [src/chat/__init__.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/chat/__init__.py)

Module exports for chat package.

#### [NEW] [src/chat/tools.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/chat/tools.py)

5 MCP tools wrapping existing `task_service` functions:

```python
from agents import function_tool
from sqlmodel.ext.asyncio.session import AsyncSession
from src.services import task_service
from src.models import TaskCreate, TaskUpdate

@function_tool
async def add_task(title: str, description: str = "") -> dict:
    """Create a new task for the user.

    Args:
        title: Task title (required)
        description: Optional task description
    """
    # Implementation calls task_service.create_task()
    ...

@function_tool
async def list_tasks(status: str = "all") -> list:
    """List user's tasks.

    Args:
        status: Filter - "all", "pending", or "completed"
    """
    # Implementation calls task_service.list_tasks_by_user()
    ...

@function_tool
async def complete_task(task_id: int) -> dict:
    """Mark a task as completed."""
    # Implementation calls task_service.toggle_task_completion()
    ...

@function_tool
async def delete_task(task_id: int) -> dict:
    """Delete a task."""
    # Implementation calls task_service.delete_task()
    ...

@function_tool
async def update_task(task_id: int, title: str = None, description: str = None) -> dict:
    """Update a task's title or description."""
    # Implementation calls task_service.update_task()
    ...
```

**Key Pattern**: Tools receive `user_id` and `session` via context injection, not as parameters.

---

### Phase 3: AI Agent Definition

#### [NEW] [src/chat/agent.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/chat/agent.py)

AI agent with LiteLLM and task management instructions:

```python
import os
from agents import Agent
from agents.extensions.models.litellm_model import LitellmModel
from .tools import add_task, list_tasks, complete_task, delete_task, update_task

model = LitellmModel(
    model="gemini/gemini-2.5-flash",
    api_key=os.getenv("GEMINI_API_KEY")
)

INSTRUCTIONS = """You are a helpful Todo Assistant that manages tasks through natural language.

You can:
- Add new tasks when users mention things they need to do
- List tasks when users ask what's on their list
- Mark tasks complete when users say they finished something
- Delete tasks when users want to remove them
- Update task details when users want to change them

Always confirm actions with friendly, concise responses.
If a user is not authenticated, inform them they need to log in to manage tasks."""

todo_agent = Agent(
    name="Todo Assistant",
    instructions=INSTRUCTIONS,
    model=model,
    tools=[add_task, list_tasks, complete_task, delete_task, update_task]
)
```

---

### Phase 4: ChatKit Server

#### [NEW] [src/chat/store.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/chat/store.py)

MemoryStore for MVP (PostgresStore in Module 3):

```python
from chatkit.store import MemoryStore

# Use in-memory store for Module 1
# Will be replaced with PostgresStore in Module 3
chat_store = MemoryStore()
```

#### [NEW] [src/chat/server.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/chat/server.py)

Custom ChatKitServer with streaming response:

```python
from chatkit.server import ChatKitServer
from chatkit.agents import stream_agent_response, AgentContext
from agents import Runner
from .agent import todo_agent
from .store import chat_store

class TodoChatKitServer(ChatKitServer[dict]):
    async def respond(self, thread, input, context):
        user_message = self._extract_message(input)
        user_id = context.get("user_id")

        # Run agent with streaming
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context
        )

        streamed = Runner.run_streamed(
            todo_agent,
            input=user_message,
            context={"user_id": user_id}
        )

        async for event in stream_agent_response(agent_context, streamed):
            yield event

server = TodoChatKitServer(chat_store)
```

---

### Phase 5: FastAPI Routes

#### [NEW] [src/chat/routes.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/chat/routes.py)

Chat endpoint with optional authentication:

```python
from fastapi import APIRouter, Request, Depends
from fastapi.responses import StreamingResponse, Response
from chatkit.server import StreamingResult
from src.api.deps import get_current_user_optional
from .server import server

router = APIRouter(tags=["Chat"])

MAX_MESSAGE_LENGTH = 4000

@router.post("/chat")
async def chat_endpoint(
    request: Request,
    current_user = Depends(get_current_user_optional)
):
    body = await request.body()

    # Input validation
    if len(body) > MAX_MESSAGE_LENGTH:
        return Response(
            content='{"error": "Message too long. Maximum 4000 characters."}',
            status_code=400,
            media_type="application/json"
        )

    context = {
        "user_id": current_user["sub"] if current_user else None
    }

    result = await server.process(body, context)

    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    return Response(content=result.json, media_type="application/json")
```

#### [MODIFY] [src/main.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/main.py)

Add chat router:

```python
from src.chat.routes import router as chat_router

# In router includes:
app.include_router(chat_router, prefix="/api", tags=["Chat"])
```

#### [MODIFY] [src/api/deps.py](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/src/api/deps.py)

Add optional auth dependency if not exists:

```python
async def get_current_user_optional(
    authorization: str = Header(None)
) -> dict | None:
    """Return user if valid token present, None otherwise."""
    if not authorization:
        return None
    try:
        return await get_current_user(authorization)
    except HTTPException:
        return None
```

---

## Verification Plan

### Automated Tests

#### 1. Unit Tests for MCP Tools

**File**: `tests/test_chat_tools.py`
**Command**: `cd todo-web-app/backend && uv run pytest tests/test_chat_tools.py -v`

Tests to implement:
- `test_add_task_creates_task`: Verify add_task calls task_service.create_task
- `test_list_tasks_returns_user_tasks`: Verify list_tasks filters by user
- `test_complete_task_toggles_status`: Verify complete_task works
- `test_delete_task_removes_task`: Verify delete_task works
- `test_update_task_modifies_fields`: Verify update_task works
- `test_tools_require_user_id`: Verify tools fail gracefully without user

#### 2. Integration Tests for Chat Endpoint

**File**: `tests/test_chat.py`
**Command**: `cd todo-web-app/backend && uv run pytest tests/test_chat.py -v`

Tests to implement:
- `test_chat_endpoint_accepts_post`: Verify POST /api/chat works
- `test_chat_returns_streaming`: Verify SSE streaming response
- `test_chat_without_auth_works`: Verify unauthenticated access works
- `test_chat_with_auth_includes_user`: Verify authenticated requests pass user_id
- `test_chat_rejects_long_messages`: Verify 4000 char limit enforced

#### 3. Existing Tests (Verify No Regression)

**Command**: `cd todo-web-app/backend && uv run pytest -v`

Existing test files:
- `tests/test_auth.py` - Auth dependency tests
- `tests/test_task_crud.py` - Task service tests
- `tests/test_tasks.py` - Task API tests

### Manual Verification

#### 1. Start Development Server

```bash
cd todo-web-app/backend
uv sync
uv run uvicorn src.main:app --reload
```

#### 2. Test Chat Endpoint with curl

```bash
# List threads (should work without auth)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"type":"threads.list","params":{}}'

# Send message (without auth - should work but tools blocked)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"type":"messages.create","params":{"thread_id":"test","content":"Hello"}}'

# With auth token (get from frontend login)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"type":"messages.create","params":{"thread_id":"test","content":"Add a task to test chatbot"}}'
```

#### 3. Verify Swagger Docs

Open http://localhost:8000/docs and verify:
- POST /api/chat endpoint appears
- Request/response schemas documented

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| openai-chatkit | latest | ChatKit server protocol |
| openai-agents[litellm] | latest | Agent SDK + LiteLLM |
| mcp | latest | Model Context Protocol |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Gemini API rate limits | Implement retry logic with exponential backoff |
| Tool execution errors | Graceful error handling with user-friendly messages |
| Session injection for tools | Use context passing pattern, not global state |

---

## Implementation Order

1. **Dependencies**: Add packages to pyproject.toml, install
2. **Tools**: Create `src/chat/tools.py` with 5 MCP tools
3. **Agent**: Create `src/chat/agent.py` with LiteLLM model
4. **Server**: Create `src/chat/server.py` with ChatKitServer
5. **Routes**: Create `src/chat/routes.py` with POST /api/chat
6. **Integration**: Add router to main.py
7. **Tests**: Write unit and integration tests
8. **Verification**: Manual testing with curl
