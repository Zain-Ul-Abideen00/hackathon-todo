<!--
SYNC IMPACT REPORT
- Version change: 3.0.0 -> 4.0.0 (MAJOR: Kubernetes Deployment Extension)
- Modified Principles:
  - "Agentic Development" → EXPANDED (added K8s agents, Docker AI, kubectl-ai)
  - "Project Structure" → EXPANDED (added k8s/ directory)
  - "Tooling & Environment" → EXPANDED (added Docker, Helm, Minikube)
- Added Principles:
  - XVII. Docker Containerization (Production Images)
  - XVIII. Helm Chart Architecture (Package Management)
  - XIX. Kubernetes Deployment (Local K8s with Minikube)
  - XX. Environment Configuration Strategy (ConfigMaps/Secrets)
- Added Sections:
  - Infrastructure/Deployment Stack
  - Kubernetes Resource Specifications
  - Minikube-Specific Configuration
- Removed Sections: None
- Templates requiring updates:
  ✅ plan-template.md - No changes required (generic structure)
  ✅ spec-template.md - No changes required (generic structure)
  ✅ tasks-template.md - No changes required (generic structure)
- Follow-up TODOs: None
-->
# Phase 4: Local Kubernetes Deployment Constitution

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
- **Container Security**: Run containers as non-root user; use read-only file systems where possible.
- **K8s Secrets**: NEVER store secrets in ConfigMaps; use Kubernetes Secrets only.

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
- **Infrastructure**: Helm lint for chart validation; kubectl dry-run for manifests

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
- **Helm Charts**: Use typed values.yaml with schema validation where possible.

**Rationale**: Type safety catches errors at compile time, reducing runtime bugs and improving developer experience.

---

### VIII. Documentation Standards

Documentation MUST be maintained alongside code.

- **Docstrings**: All public functions, classes, and modules MUST have docstrings (Google style).
- **README**: Each project (frontend, backend, k8s) MUST have setup instructions and usage examples.
- **API Docs**: OpenAPI documentation auto-generated from FastAPI.
- **Commit Messages**: MUST follow conventional commits format.
- **Code Comments**: Include comments for non-obvious logic; avoid redundant comments.
- **Deployment Docs**: K8s deployment instructions MUST be in README with step-by-step commands.

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
- **Container Size**: Docker images MUST be optimized for minimal size (multi-stage builds).
- **Resource Limits**: All K8s deployments MUST have CPU/memory requests and limits.

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

**Infrastructure** (NEW for Phase 4):
- **Container Runtime**: Docker Desktop or Docker Engine
- **Kubernetes**: Minikube for local development
- **Package Manager**: Helm 3.x for Kubernetes package management
- **kubectl**: Latest stable for K8s CLI operations
- **kubectl-ai**: Optional for AI-assisted K8s operations

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
- `@docker-expert`: Production Dockerfile creation and optimization (NEW)
- `@kubernetes-architect`: Helm chart design and K8s architecture (NEW)
- `@kubernetes-specialist`: Deployment operations and debugging (NEW)
- `@deployment-engineer`: CI/CD patterns and deployment strategies (NEW)

**Skills** (reference in specifications and plans):
- `integrating-chatkit`: ChatKit patterns for frontend and backend
- `building-with-openai-agents`: OpenAI Agents SDK patterns with LiteLLM
- `mcp-builder`: MCP tool implementation patterns
- `building-with-sqlmodel-async`: Async database operations with SQLModel
- `configuring-better-auth`: Auth implementation patterns and JWT flow
- `building-nextjs-apps`: Next.js 16 patterns, async params, Server Actions
- `lightswind-ui`: Premium component design patterns
- `production-dockerfile`: Optimized Docker images with multi-stage builds (NEW)
- `helm-chart-scaffolding`: Helm chart patterns and best practices (NEW)
- `k8s-manifest-generator`: Kubernetes resource generation (NEW)
- `k8s-security-policies`: Security policies for K8s deployments (NEW)

**MCP Servers** (use for tooling and diagnostics):
- `better-auth`: Guided Better Auth configuration and troubleshooting
- `next-devtools`: Next.js runtime diagnostics, error detection, docs access
- `playwright`: E2E browser testing and automation
- `neon`: Database operations and connection management

**AIOps Tools** (Optional for Phase 4):
- `kubectl-ai`: Natural language K8s commands
- Docker AI (Gordon): `docker ai "query"` for container assistance

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

### XVII. Docker Containerization

Production Docker images MUST follow optimization and security best practices.

**Multi-Stage Builds**:
- **Stage 1 (Builder)**: Install dependencies, build assets
- **Stage 2 (Runtime)**: Copy only necessary artifacts, minimal base image
- **Backend Base**: `python:3.12-slim` for production
- **Frontend Base**: `node:20-alpine` for production

**Security Requirements**:
- **Non-Root User**: All containers MUST run as non-root user
- **Read-Only FS**: Use read-only file systems where possible
- **No Shell Access**: Production images should not include unnecessary shells/tools
- **Secrets**: NEVER bake secrets into images; use environment variables

**Optimization**:
- **Layer Caching**: Order Dockerfile instructions for optimal caching (dependencies before code)
- **`.dockerignore`**: Exclude node_modules, .git, .env files, test fixtures
- **Health Checks**: Include HEALTHCHECK instruction in Dockerfile
- **Size Target**: Backend < 200MB, Frontend < 150MB

**Example Backend Dockerfile Pattern**:
```dockerfile
# Stage 1: Build
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN pip install uv && uv sync --frozen --no-dev

# Stage 2: Runtime
FROM python:3.12-slim AS runtime
WORKDIR /app
RUN useradd -r -u 1000 appuser
COPY --from=builder /app/.venv /app/.venv
COPY src/ ./src/
USER appuser
EXPOSE 8000
HEALTHCHECK CMD curl -f http://localhost:8000/health || exit 1
CMD [".venv/bin/uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Rationale**: Multi-stage builds minimize image size and attack surface. Non-root users prevent privilege escalation.

---

### XVIII. Helm Chart Architecture

Kubernetes deployments MUST use Helm charts for package management.

**Chart Structure** (per service):
```text
k8s/{service}/
├── Chart.yaml              # Chart metadata (name, version, appVersion)
├── values.yaml             # Default configuration values
├── templates/
│   ├── _helpers.tpl        # Template helpers
│   ├── deployment.yaml     # Deployment resource
│   ├── service.yaml        # Service resource
│   ├── configmap.yaml      # ConfigMap for non-secret config
│   ├── secret.yaml         # Secret for sensitive data
│   ├── ingress.yaml        # Ingress (optional, for external access)
│   └── hpa.yaml            # HorizontalPodAutoscaler (optional)
└── .helmignore             # Files to ignore during packaging
```

**Values Configuration**:
- **image.repository**: Container image name
- **image.tag**: Version tag (default to Chart appVersion)
- **image.pullPolicy**: `IfNotPresent` for remote, `Never` for local Minikube
- **replicas**: Number of pod replicas
- **resources.requests/limits**: CPU and memory constraints
- **env**: Non-secret environment variables
- **secrets**: References to Kubernetes secrets

**Best Practices**:
- **Separate charts for frontend and backend**: Independent scaling and deployment
- **values-local.yaml**: Minikube-specific overrides
- **Templating**: Use `{{ .Values.* }}` for all configurable values
- **Labels**: Include standard labels (app, version, environment)

**Validation**:
- **Lint**: `helm lint k8s/{service}/` before deployment
- **Template**: `helm template k8s/{service}/` to preview generated YAML
- **Dry-run**: `helm install --dry-run --debug` for full validation

**Rationale**: Helm charts enable versioned, reproducible, and configurable Kubernetes deployments.

---

### XIX. Kubernetes Deployment

Local Kubernetes deployment MUST use Minikube with proper resource configuration.

**Minikube Setup**:
- **Driver**: Prefer Docker driver for consistency
- **Resources**: Allocate minimum 4GB memory, 2 CPUs for cluster
- **Docker Environment**: Use `eval $(minikube docker-env)` to build images locally
- **Image Pull Policy**: Set to `Never` when using locally-built images

**Required Resources**:

| Resource | Purpose | Key Configuration |
|----------|---------|-------------------|
| Deployment | Pod lifecycle management | replicas, resource limits, probes |
| Service | Internal networking | ClusterIP for internal, NodePort for external |
| ConfigMap | Non-secret environment vars | NEXT_PUBLIC_*, CORS_ORIGINS |
| Secret | Sensitive data | DATABASE_URL, API keys, BETTER_AUTH_SECRET |
| Ingress/NodePort | External access | Use NodePort for Minikube simplicity |

**Probes**:
- **Liveness Probe**: `/health` endpoint, initial delay 30s, period 10s
- **Readiness Probe**: `/health` endpoint, initial delay 5s, period 5s

**Resource Limits** (minimum guidance):
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

**Access Strategy**:
- **NodePort**: Use `minikube service {service-name}` for direct access
- **Tunnel**: Use `minikube tunnel` for LoadBalancer services
- **Port Forward**: `kubectl port-forward svc/{service} {local}:{remote}` for debugging

**Rationale**: Proper resource configuration ensures predictable performance and prevents resource starvation.

---

### XX. Environment Configuration Strategy

Environment configuration MUST use Kubernetes ConfigMaps and Secrets appropriately.

**Backend Environment Variables**:

| Variable | Type | Description |
|----------|------|-------------|
| `DATABASE_URL` | Secret | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret | Shared JWT secret (min 32 chars) |
| `GEMINI_API_KEY` | Secret | LLM API key |
| `CORS_ORIGINS` | ConfigMap | Comma-separated allowed origins |
| `ENVIRONMENT` | ConfigMap | development, staging, production |

**Frontend Environment Variables**:

| Variable | Type | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_API_URL` | ConfigMap | Backend service URL in cluster |
| `NEXT_PUBLIC_CHATKIT_URL` | ConfigMap | Backend chat endpoint |
| `BETTER_AUTH_SECRET` | Secret | Shared JWT secret for signing |

**Implementation Pattern**:
```yaml
# ConfigMap for non-secret values
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  CORS_ORIGINS: "http://frontend-service:3000"
  ENVIRONMENT: "development"

# Secret for sensitive values
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
type: Opaque
stringData:
  DATABASE_URL: "postgresql+asyncpg://..."
  BETTER_AUTH_SECRET: "your-secret-min-32-chars"
  GEMINI_API_KEY: "your-api-key"
```

**Critical Rules**:
- NEVER store secrets in ConfigMaps
- NEVER commit Secret manifests with real values to git
- Use `stringData` in manifests, converted to base64 by K8s
- Reference secrets via `secretKeyRef` in deployments

**Rationale**: Proper separation of config and secrets follows K8s best practices and maintains security.

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

### AI/Chat Stack
- **Chat UI**: OpenAI ChatKit
- **Agent SDK**: OpenAI Agents SDK
- **Model Provider**: LiteLLM (Gemini backend)
- **Model**: gemini/gemini-2.5-flash
- **Tools**: MCP wrappers around task_service

### Database
- **Provider**: Neon PostgreSQL
- **Driver**: asyncpg (async)
- **Tables**: users, tasks, chatkit_threads, chatkit_items

### Authentication
- **Frontend**: Better Auth with JWT plugin
- **Backend**: JWT verification middleware
- **Algorithm**: HS256 with shared secret

### Infrastructure/Deployment (NEW for Phase 4)
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes (Minikube for local)
- **Package Management**: Helm 3.x
- **Base Images**: python:3.12-slim, node:20-alpine
- **AIOps**: kubectl-ai (optional), Docker AI (optional)

---

## Project Structure (Monorepo)

```text
todo-web-app/
├── frontend/                # Next.js 16+ App
│   ├── Dockerfile           # NEW: Production multi-stage build
│   ├── .dockerignore        # NEW: Docker build exclusions
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   └── chat/        # Chat page route
│   │   ├── components/      # React components
│   │   │   └── chat/        # ChatBot component
│   │   ├── lib/             # Utilities, auth config
│   │   └── actions/         # Server Actions
│   ├── tests/               # Vitest tests
│   └── e2e/                 # Playwright E2E tests
│
├── backend/                 # FastAPI + SQLModel
│   ├── Dockerfile           # NEW: Production multi-stage build
│   ├── .dockerignore        # NEW: Docker build exclusions
│   ├── src/
│   │   ├── api/             # Route handlers
│   │   ├── models/          # SQLModel models
│   │   ├── services/        # Business logic (task_service.py)
│   │   ├── auth/            # JWT verification
│   │   ├── db/              # Database session
│   │   └── chat/            # ChatKit integration
│   │       ├── __init__.py
│   │       ├── server.py    # ChatKitServer subclass
│   │       ├── agent.py     # AI agent with LiteLLM
│   │       ├── tools.py     # MCP tools wrapping task_service
│   │       └── store.py     # PostgresStore for persistence
│   ├── alembic/             # Migrations
│   └── tests/               # pytest tests
│
└── k8s/                     # Kubernetes configurations
    ├── local/               # Phase 4: Minikube (local K8s)
    │   ├── backend/         # Backend Helm chart
    │   │   ├── Chart.yaml
    │   │   ├── values.yaml
    │   │   └── templates/
    │   │       ├── _helpers.tpl
    │   │       ├── deployment.yaml
    │   │       ├── service.yaml
    │   │       ├── configmap.yaml
    │   │       └── secret.yaml
    │   ├── frontend/        # Frontend Helm chart
    │   │   ├── Chart.yaml
    │   │   ├── values.yaml
    │   │   └── templates/
    │   │       ├── _helpers.tpl
    │   │       ├── deployment.yaml
    │   │       ├── service.yaml
    │   │       └── configmap.yaml
    │   └── values-local.yaml  # Minikube-specific overrides
    └── cloud/               # Phase 5: DOKS (DigitalOcean Kubernetes)
        └── ...              # Cloud-specific configs (Phase 5)
```

---

## Environment Variables

### Backend (.env) - Existing
```bash
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname
BETTER_AUTH_SECRET=your-shared-secret-min-32-chars
CORS_ORIGINS=https://your-frontend-domain.vercel.app
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (.env.local) - Existing
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
BETTER_AUTH_SECRET=your-shared-secret-min-32-chars
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-frontend-domain.vercel.app
NEXT_PUBLIC_CHATKIT_URL=http://localhost:8000/api/chat
NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=localhost
```

### Kubernetes Secrets (NEW for Phase 4)
```yaml
# NEVER commit real values - use kubectl create secret or sealed-secrets
apiVersion: v1
kind: Secret
metadata:
  name: backend-secrets
type: Opaque
stringData:
  DATABASE_URL: "<neon-connection-string>"
  BETTER_AUTH_SECRET: "<32-char-secret>"
  GEMINI_API_KEY: "<gemini-api-key>"
```

### Kubernetes ConfigMaps (NEW for Phase 4)
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
data:
  CORS_ORIGINS: "http://frontend-service.default.svc.cluster.local:3000"
  ENVIRONMENT: "development"

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
data:
  NEXT_PUBLIC_API_URL: "http://backend-service.default.svc.cluster.local:8000"
  NEXT_PUBLIC_CHATKIT_URL: "http://backend-service.default.svc.cluster.local:8000/api/chat"
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

### Phase 4 Workflow Extensions
1. **Dockerize**: Build production images with multi-stage Dockerfiles
2. **Chart**: Create Helm charts with `helm create` and customize
3. **Validate**: Run `helm lint` and `helm template` for validation
4. **Deploy**: Deploy to Minikube with `helm install`
5. **Test**: Verify with `kubectl get pods`, `kubectl logs`, browser access

### Commit Requirements
- Each commit SHOULD represent a logical unit of work
- Commits MUST include tests for functionality added
- The Red-Green-Refactor cycle SHOULD be visible in commit history
- Use conventional commit format: `type(scope): description`

---

## Governance

This constitution supersedes all other development practices for Phase 4. All PRs and code reviews MUST verify compliance with these principles.

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

### Phase 3 (Inherited - COMPLETE)
- [x] ChatKit backend at `/api/chat`
- [x] 5 MCP tools wrapping task_service
- [x] AI agent with Gemini via LiteLLM
- [x] ChatKit frontend component
- [x] Conversation persistence tables (chatkit_threads, chatkit_items)
- [x] Chat accessible from dashboard or `/chat`
- [x] Tests with 80% coverage
- [x] Demo video (under 90 seconds)

### Phase 4 (NEW)
- [ ] Production Dockerfile for backend (multi-stage)
- [ ] Production Dockerfile for frontend (multi-stage)
- [ ] Helm chart for backend with templates
- [ ] Helm chart for frontend with templates
- [ ] Minikube deployment working
- [ ] Frontend accessible via browser
- [ ] Chatbot functional in K8s environment
- [ ] README with deployment instructions
- [ ] Demo video (under 90 seconds)

---

**Version**: 4.0.0 | **Ratified**: 2025-12-31 | **Last Amended**: 2026-01-31
