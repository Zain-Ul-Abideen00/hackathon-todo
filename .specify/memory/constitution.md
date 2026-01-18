<!--
SYNC IMPACT REPORT
- Version change: 2.0.0 -> 3.0.0 (MAJOR: AI Chatbot Extension)
- Modified Principles:
  - "Agentic Development" → EXPANDED (added ChatKit, MCP, LiteLLM agents)
- Added Principles:
  - XIII. ChatKit Integration (OpenAI ChatKit Backend & Frontend)
  - XIV. AI Agent Architecture (OpenAI Agents SDK + LiteLLM)
  - XV. MCP Tool Design (Model Context Protocol wrappers)
  - XVI. Conversation Persistence (Database-backed threads)
- Added Sections:
  - AI/Chat Technology Stack
  - MCP Tools Specification
  - New Environment Variables for AI
- Removed Sections: None
- Templates requiring updates:
  ✅ plan-template.md - No changes required (generic structure)
  ✅ spec-template.md - No changes required (generic structure)
  ✅ tasks-template.md - No changes required (generic structure)
- Follow-up TODOs: None
-->
# Phase 3: AI-Powered Todo Chatbot Constitution

## Core Principles

### I. Next.js 16+ Frontend Architecture

The frontend MUST be built using Next.js 16+ with App Router and React 19.

- **Server Components**: Default to Server Components; use `"use client"` directive ONLY for components requiring interactivity (hooks, event handlers, browser APIs).
- **Async Params**: ALWAYS await `params` and `searchParams` in page components. This is a **Next.js 16 breaking change**.
- **Server Actions**: Use for all form submissions and mutations with Zod validation.
- **Data Fetching**: Use TanStack Query for client-side data fetching with proper caching.
- **Styling**: Tailwind CSS v4 with Lightswind UI components for premium aesthetics.
- **Animations**: Framer Motion for micro-animations and transitions.
- **TypeScript**: Strict mode enabled; `any` type is FORBIDDEN.

**Rationale**: Server Components reduce client bundle size and improve performance. Async params handle Next.js 16's async data requirements correctly.

---

### II. FastAPI Backend Architecture

The backend MUST be built using FastAPI with async-first design.

- **Async-First**: All database operations MUST use async functions with `asyncpg`.
- **SQLModel**: Use SQLModel for type-safe ORM with Pydantic integration.
- **Pydantic v2**: All request/response models MUST use Pydantic v2 for validation.
- **Dependency Injection**: Use FastAPI's Depends() for database sessions and authentication.
- **Error Handling**: Use HTTPException with appropriate status codes; never expose internal errors.
- **API Documentation**: OpenAPI docs MUST be available at `/docs` endpoint.
- **CORS**: Configure for frontend domain only; never use wildcard in production.

**Rationale**: Async-first design scales better for I/O-bound operations. Dependency injection promotes testable, maintainable code.

---

### III. Database Architecture (Neon PostgreSQL)

Data persistence MUST use Neon PostgreSQL with proper migration management.

- **ORM**: SQLModel for all database interactions; raw SQL is FORBIDDEN except for migrations.
- **Migrations**: Alembic for ALL schema changes. NEVER modify database schema manually.
- **Indexes**: Create indexes on frequently queried columns (`user_id`, `completed`, `created_at`, `thread_id`).
- **Timestamps**: All datetime fields MUST use UTC timezone.
- **Soft Deletes**: Prefer soft deletes (`deleted_at` column) where applicable.
- **Connection Pooling**: Use connection pooling for production deployments.

**Rationale**: Alembic migrations ensure reproducible, versioned schema changes. Indexes improve query performance for common access patterns.

---

### IV. Authentication (Better Auth + JWT)

User authentication MUST use Better Auth on the frontend with JWT tokens for API authorization.

- **Better Auth**: Configure on Next.js frontend with email/password and social providers.
- **JWT Plugin**: Use Better Auth's JWT plugin for token generation.
- **Shared Secret**: Use BETTER_AUTH_SECRET (HS256) shared between frontend and backend.
- **Token Transport**: JWT tokens MUST be passed via `Authorization: Bearer <token>` header.
- **Backend Verification**: FastAPI middleware MUST verify JWT tokens on all protected routes.
- **User Isolation**: Each user MUST only access their own tasks and conversations; enforce at both API and query level.
- **Session Storage**: Use HTTP-only cookies for session persistence.

**Rationale**: Shared secret JWT enables simple, stateless authentication between Next.js and FastAPI without a separate auth server.

---

### V. Security First

Security MUST be a primary consideration in all development decisions.

- **Input Validation**: Validate on BOTH frontend (Zod) AND backend (Pydantic). Never trust client input.
- **CORS**: Configure explicitly for allowed origins; never use `*` in production.
- **Secrets Management**: ALL secrets in environment variables; NEVER commit to git.
- **SQL Injection**: Use ORM exclusively; parameterized queries only.
- **XSS Prevention**: Sanitize user-generated content; React handles most cases.
- **Rate Limiting**: Implement rate limiting on authentication AND chat endpoints.
- **HTTPS Only**: All production traffic MUST use HTTPS.
- **AI Safety**: Validate and sanitize AI responses before displaying to users.

**Rationale**: Defense in depth prevents single points of failure. Validation at both layers catches malicious and malformed input.

---

### VI. Test-Driven Development (TDD) (NON-NEGOTIABLE)

TDD is MANDATORY for all new functionality.

1. **Red**: Write a failing test for the desired behavior.
2. **Green**: Write the minimal code to pass the test.
3. **Refactor**: Improve code quality without changing behavior.

**Testing Stack**:
- **Backend**: pytest with pytest-asyncio for async tests
- **Frontend**: Vitest for unit tests
- **E2E**: Playwright for full user flows with browser automation
- **Coverage Target**: Minimum 80% code coverage

Code without corresponding tests is NOT considered "done".

**Rationale**: TDD ensures correctness, enables refactoring, and documents expected behavior.

---

### VII. Type Safety & Validation

Type safety MUST be enforced across the entire stack.

- **Frontend**: TypeScript strict mode; no `any` types; no `@ts-ignore` without documented reason.
- **Backend**: Python type hints on ALL function signatures; Pydantic for runtime validation.
- **API Contracts**: Shared types or OpenAPI schemas to ensure frontend/backend alignment.
- **Database**: SQLModel provides type-safe database operations.
- **AI Tools**: MCP tool parameters MUST have Pydantic validation.

**Rationale**: Type safety catches errors at compile time, reducing runtime bugs and improving developer experience.

---

### VIII. Documentation Standards

Documentation MUST be maintained alongside code.

- **Docstrings**: All public functions, classes, and modules MUST have docstrings (Google style).
- **README**: Each project (frontend, backend) MUST have setup instructions and usage examples.
- **API Docs**: OpenAPI documentation auto-generated from FastAPI.
- **Commit Messages**: MUST follow conventional commits format.
- **Code Comments**: Include comments for non-obvious logic; avoid redundant comments.

**Rationale**: Documentation reduces onboarding time and serves as authoritative reference.

---

### IX. Performance & Optimization

Performance MUST be considered in architecture and implementation.

- **Lazy Loading**: Non-critical components MUST use dynamic imports.
- **Image Optimization**: Use `next/image` for all images; specify width/height.
- **Database Pooling**: Use connection pooling in production.
- **Caching Strategy**: Implement caching for frequently accessed, rarely changing data.
- **Bundle Size**: Monitor and minimize client-side JavaScript bundle.
- **Streaming**: Use SSE streaming for real-time AI responses.

**Rationale**: Performance directly impacts user experience and SEO rankings.

---

### X. Accessibility (WCAG 2.1 AA)

The application MUST meet WCAG 2.1 AA accessibility standards.

- **Semantic HTML**: Use appropriate HTML elements for their intended purpose.
- **Keyboard Navigation**: All interactive elements MUST be keyboard accessible.
- **Focus Management**: Visible focus indicators; logical tab order.
- **ARIA Labels**: Provide labels for screen readers where semantic HTML is insufficient.
- **Color Contrast**: Minimum 4.5:1 contrast ratio for normal text.
- **Chat Accessibility**: Chat interface MUST be screen-reader friendly with proper ARIA live regions.

**Rationale**: Accessibility ensures the application is usable by everyone and often improves overall UX.

---

### XI. Tooling & Environment

Development tooling MUST be consistent across the team.

**Backend**:
- **Python**: 3.12+
- **Dependency Management**: uv for package management
- **Linting**: ruff for fast Python linting
- **Type Checking**: pyright or mypy

**Frontend**:
- **Node.js**: 20+ LTS
- **Package Manager**: pnpm for efficient dependency management
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier

**Rationale**: Consistent tooling eliminates "works on my machine" issues and ensures reproducible builds.

---

### XII. Agentic Development

Development MUST leverage specialized AI agents and MCP servers.

**Subagents** (invoke via `@agent-name` during `/sp.implement`):
- `@fastapi-pro`: ChatKit backend integration, SSE streaming, route handlers
- `@mcp-developer`: Wrapping task_service as MCP tools
- `@python-pro`: AI agent implementation with LiteLLM and OpenAI Agents SDK
- `@database-architect`: Conversation persistence schema (threads, items)
- `@nextjs-developer`: ChatKit frontend integration, useChatKit hook
- `@ui-designer`: Chat UI styling and premium visual aesthetics

**Skills** (reference in specifications and plans):
- `integrating-chatkit`: ChatKit patterns for frontend and backend (CRITICAL)
- `building-with-openai-agents`: OpenAI Agents SDK patterns with LiteLLM
- `mcp-builder`: MCP tool implementation patterns
- `building-with-sqlmodel-async`: Async database operations with SQLModel
- `configuring-better-auth`: Auth implementation patterns and JWT flow
- `building-nextjs-apps`: Next.js 16 patterns, async params, Server Actions
- `lightswind-ui`: Premium component design patterns

**MCP Servers** (use for tooling and diagnostics):
- `better-auth`: Guided Better Auth configuration and troubleshooting
- `next-devtools`: Next.js runtime diagnostics, error detection, docs access
- `playwright`: E2E browser testing and automation
- `neon`: Database operations and connection management

**Rationale**: Specialized agents ensure expert-level implementation in each domain. MCP servers provide authoritative tooling and documentation.

---

### XIII. ChatKit Integration

Chat functionality MUST use OpenAI ChatKit with proper backend and frontend integration.

**Backend (FastAPI)**:
- **Location**: Create all chat code in `src/chat/` directory
- **ChatKitServer**: Subclass with custom `respond()` method for AI streaming
- **Streaming**: Use `StreamingResponse` with SSE (Server-Sent Events) format
- **Dependencies**: Reuse existing `get_session` and auth dependencies from Phase 2
- **Route**: Mount at `/api/chat` and add to main.py router includes
- **Thread Management**: Store thread context in database, not memory

**Frontend (Next.js)**:
- **Location**: Create `src/components/chat/ChatBot.tsx` component
- **Hook**: Use `useChatKit` hook from ChatKit library
- **Authentication**: Use `customFetch` to inject JWT from existing token endpoint
- **Thread Persistence**: Store thread ID in localStorage for session continuity

**Rationale**: ChatKit provides a production-ready chat infrastructure. SSE streaming ensures real-time response delivery.

---

### XIV. AI Agent Architecture

AI agents MUST use OpenAI Agents SDK with LiteLLM for model flexibility.

**Model Configuration**:
- **Provider**: LiteLLM for model abstraction
- **Model**: `gemini/gemini-2.5-flash` (Gemini API via LiteLLM)
- **Fallback**: Configure retry logic and error handling for API failures

**Agent Implementation**:
- **SDK**: OpenAI Agents SDK with `@function_tool` decorator
- **Instructions**: Clear, concise system instructions for todo management
- **Tools**: Register all MCP tools with the agent
- **Streaming**: Use `Runner.run_streamed()` for real-time responses
- **Context**: Pass user_id to all tool calls for proper isolation

**Error Handling**:
- **API Errors**: Catch and present user-friendly messages
- **Tool Failures**: Log errors and inform user gracefully
- **Timeouts**: Configure reasonable timeouts for AI responses

**Rationale**: LiteLLM enables model flexibility without vendor lock-in. OpenAI Agents SDK provides structured tool calling.

---

### XV. MCP Tool Design

MCP tools MUST wrap existing task_service functions, not reimplement them.

**Critical Rule**: ALL MCP tools MUST call existing `task_service.py` functions. DO NOT duplicate business logic.

**Tool Implementation Pattern**:
```python
from agents import function_tool
from src.services import task_service

@function_tool
async def add_task(user_id: str, title: str, description: str = "") -> dict:
    """Create a new task for the user."""
    task = await task_service.create_task(session, task_data, user_id)
    return {"task_id": task.id, "status": "created", "title": task.title}
```

**Required Tools** (wrapping task_service):

| Tool Name | Wraps | Input | Output |
|-----------|-------|-------|--------|
| `add_task` | `task_service.create_task()` | user_id, title, description? | {task_id, status: "created", title} |
| `list_tasks` | `task_service.list_tasks_by_user()` | user_id, status? | [{id, title, completed}...] |
| `complete_task` | `task_service.toggle_task_completion()` | user_id, task_id | {task_id, status: "completed", title} |
| `delete_task` | `task_service.delete_task()` | user_id, task_id | {task_id, status: "deleted", title} |
| `update_task` | `task_service.update_task()` | user_id, task_id, title?, description? | {task_id, status: "updated", title} |

**Session Management**: Tools receive database session via dependency injection.

**Rationale**: Wrapping existing functions ensures consistency, reduces bugs, and maintains single source of truth.

---

### XVI. Conversation Persistence

Chat conversations MUST be persisted to the database for history and continuity.

**Schema** (Alembic migration required):

```sql
-- chatkit_threads table
CREATE TABLE chatkit_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- chatkit_items table
CREATE TABLE chatkit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES chatkit_threads(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'tool_call', 'tool_result'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);
```

**Implementation**:
- **PostgresStore Class**: Implement ChatKit's store interface for database persistence
- **User Isolation**: All queries MUST filter by user_id
- **Cleanup**: Implement thread cleanup for old/abandoned conversations

**Rationale**: Database persistence enables conversation continuity across sessions and devices.

---

## Technology Stack

### Frontend (Next.js 16+)
- **Framework**: Next.js 16+ with App Router
- **UI**: React 19 with Server Components
- **Styling**: Tailwind CSS v4 + Lightswind UI
- **Animation**: Framer Motion
- **Data Fetching**: TanStack Query
- **Validation**: Zod
- **Testing**: Vitest + Playwright
- **Chat**: OpenAI ChatKit (useChatKit hook)

### Backend (FastAPI)
- **Framework**: FastAPI
- **ORM**: SQLModel + asyncpg
- **Validation**: Pydantic v2
- **Migrations**: Alembic
- **Testing**: pytest + pytest-asyncio
- **Chat**: OpenAI ChatKit (ChatKitServer)
- **AI**: OpenAI Agents SDK + LiteLLM

### AI/Chat Stack (NEW)
- **Chat UI**: OpenAI ChatKit
- **Agent SDK**: OpenAI Agents SDK
- **Model Provider**: LiteLLM (Gemini backend)
- **Model**: gemini/gemini-2.5-flash
- **Tools**: MCP wrappers around task_service

### Database
- **Provider**: Neon PostgreSQL
- **Driver**: asyncpg (async)
- **New Tables**: chatkit_threads, chatkit_items

### Authentication
- **Frontend**: Better Auth with JWT plugin
- **Backend**: JWT verification middleware
- **Algorithm**: HS256 with shared secret

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway or Render
- **Database**: Neon (serverless PostgreSQL)

---

## Project Structure (Monorepo)

```text
todo-web-app/
├── frontend/                # Next.js 16+ App
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   └── chat/        # NEW: Chat page route
│   │   ├── components/      # React components
│   │   │   └── chat/        # NEW: ChatBot component
│   │   ├── lib/             # Utilities, auth config
│   │   └── actions/         # Server Actions
│   ├── tests/               # Vitest tests
│   └── e2e/                 # Playwright E2E tests
│
├── backend/                 # FastAPI + SQLModel
│   ├── src/
│   │   ├── api/             # Route handlers
│   │   ├── models/          # SQLModel models
│   │   ├── services/        # Business logic (task_service.py)
│   │   ├── auth/            # JWT verification
│   │   ├── db/              # Database session
│   │   └── chat/            # NEW: ChatKit integration
│   │       ├── __init__.py
│   │       ├── server.py    # ChatKitServer subclass
│   │       ├── agent.py     # AI agent with LiteLLM
│   │       ├── tools.py     # MCP tools wrapping task_service
│   │       └── store.py     # PostgresStore for persistence
│   ├── alembic/             # Migrations
│   └── tests/               # pytest tests
│
└── k8s/                     # Future Kubernetes configs (Phase 4+)
```

---

## Environment Variables

### Backend (.env) - Existing
```bash
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname
BETTER_AUTH_SECRET=your-shared-secret-min-32-chars
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

### Backend (.env) - NEW for Phase 3
```bash
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (.env.local) - Existing
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
BETTER_AUTH_SECRET=your-shared-secret-min-32-chars
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-frontend-domain.vercel.app
```

### Frontend (.env.local) - NEW for Phase 3
```bash
NEXT_PUBLIC_CHATKIT_URL=http://localhost:8000/api/chat
NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=localhost
```

---

## MCP Tools Specification

### add_task
- **Wraps**: `task_service.create_task(session, task_data, user_id)`
- **Input**: `user_id: str, title: str, description: str = ""`
- **Output**: `{task_id: str, status: "created", title: str}`

### list_tasks
- **Wraps**: `task_service.list_tasks_by_user(session, user_id, completed=None)`
- **Input**: `user_id: str, status: Literal["all", "pending", "completed"] = "all"`
- **Output**: `[{id: str, title: str, completed: bool}, ...]`

### complete_task
- **Wraps**: `task_service.toggle_task_completion(session, task_id, user_id)`
- **Input**: `user_id: str, task_id: str`
- **Output**: `{task_id: str, status: "completed", title: str}`

### delete_task
- **Wraps**: `task_service.delete_task(session, task_id, user_id)`
- **Input**: `user_id: str, task_id: str`
- **Output**: `{task_id: str, status: "deleted", title: str}`

### update_task
- **Wraps**: `task_service.update_task(session, task_id, task_update, user_id)`
- **Input**: `user_id: str, task_id: str, title: str = None, description: str = None`
- **Output**: `{task_id: str, status: "updated", title: str}`

---

## Development Workflow

1. **Specify**: Run `/sp.specify` for each feature
2. **Clarify**: Run `/sp.clarify` to refine requirements
3. **Plan**: Run `/sp.plan` with agent and skill references
4. **Tasks**: Run `/sp.tasks` to generate actionable breakdown
5. **Implement**: Run `/sp.implement` invoking appropriate subagents
6. **Verify**: Run tests and browser automation

### Commit Requirements
- Each commit SHOULD represent a logical unit of work
- Commits MUST include tests for functionality added
- The Red-Green-Refactor cycle SHOULD be visible in commit history
- Use conventional commit format: `type(scope): description`

---

## Governance

This constitution supersedes all other development practices for Phase 3. All PRs and code reviews MUST verify compliance with these principles.

### Amendment Procedure
- **MAJOR**: Backward incompatible changes (principle removal/redefinition) require migration plan
- **MINOR**: New principles or expanded guidance
- **PATCH**: Clarifications, wording fixes, typo corrections

### Compliance Review
- Every code review MUST check for constitution compliance
- Complexity deviations MUST be justified in writing
- Use the Constitution Check section in `plan.md` for gate validation

### Runtime Guidance
- See `task.md` for active development tasks
- Reference agent skills during planning and implementation

---

## Deliverables Checklist

### Phase 2 (Inherited - COMPLETE)
- [x] GitHub repo with monorepo structure
- [x] Working Next.js frontend on Vercel
- [x] Working FastAPI backend (deployed)
- [x] Neon PostgreSQL with migrated schema
- [x] User authentication (signup/signin/signout)
- [x] Full task CRUD functionality
- [x] Responsive, premium UI
- [x] README with setup instructions

### Phase 3 (NEW)
- [ ] ChatKit backend at `/api/chat`
- [ ] 5 MCP tools wrapping task_service
- [ ] AI agent with Gemini via LiteLLM
- [ ] ChatKit frontend component
- [ ] Conversation persistence tables (chatkit_threads, chatkit_items)
- [ ] Chat accessible from dashboard or `/chat`
- [ ] Tests with 80% coverage
- [ ] Demo video (under 90 seconds)

---

**Version**: 3.0.0 | **Ratified**: 2025-12-31 | **Last Amended**: 2026-01-18
