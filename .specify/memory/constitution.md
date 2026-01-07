<!--
SYNC IMPACT REPORT
- Version change: 1.0.0 -> 2.0.0 (MAJOR: Full-Stack Web App Transition)
- Modified Principles:
  - "Textual Framework First" → REMOVED (Phase 1 only)
  - "Keyboard-Centric Navigation" → REMOVED (Phase 1 only)
  - "Simple Persistence" → REPLACED by "Database Architecture"
- Added Principles:
  - I. Next.js 16+ Frontend Architecture
  - II. FastAPI Backend Architecture
  - III. Database Architecture (Neon PostgreSQL)
  - IV. Authentication (Better Auth + JWT)
  - V. Security First
  - VI. Test-Driven Development (TDD)
  - VII. Type Safety & Validation
  - VIII. Documentation Standards
  - IX. Performance & Optimization
  - X. Accessibility (WCAG 2.1 AA)
  - XI. Tooling & Environment
  - XII. Agentic Development
- Added Sections:
  - Agentic Development (Subagents, Skills, MCP Servers)
  - Project Structure (Monorepo)
  - Environment Variables
- Templates requiring updates:
  ✅ plan-template.md - No changes required (generic structure)
  ✅ spec-template.md - No changes required (generic structure)
  ✅ tasks-template.md - No changes required (generic structure)
-->
# Phase 2: Full-Stack Todo Web Application Constitution

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
- **Indexes**: Create indexes on frequently queried columns (`user_id`, `completed`, `created_at`).
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
- **User Isolation**: Each user MUST only access their own tasks; enforce at both API and query level.
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
- **Rate Limiting**: Implement rate limiting on authentication endpoints.
- **HTTPS Only**: All production traffic MUST use HTTPS.

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

**Rationale**: Performance directly impacts user experience and SEO rankings.

---

### X. Accessibility (WCAG 2.1 AA)

The application MUST meet WCAG 2.1 AA accessibility standards.

- **Semantic HTML**: Use appropriate HTML elements for their intended purpose.
- **Keyboard Navigation**: All interactive elements MUST be keyboard accessible.
- **Focus Management**: Visible focus indicators; logical tab order.
- **ARIA Labels**: Provide labels for screen readers where semantic HTML is insufficient.
- **Color Contrast**: Minimum 4.5:1 contrast ratio for normal text.

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
- `@better-auth-expert`: ALL authentication work (JWT, sessions, providers)
- `@nextjs-developer`: ALL frontend work (React 19, Server Components, App Router)
- `@fastapi-pro`: ALL backend API development (routes, middleware, validation)
- `@database-architect`: Database schema design and Alembic migrations
- `@ui-designer`: UI/UX decisions and premium visual aesthetics

**Skills** (reference in specifications and plans):
- `configuring-better-auth`: Auth implementation patterns and JWT flow
- `building-nextjs-apps`: Next.js 16 patterns, async params, Server Actions
- `building-with-sqlmodel-async`: Async database operations with SQLModel
- `lightswind-ui`: Premium component design patterns

**MCP Servers** (use for tooling and diagnostics):
- `better-auth`: Guided Better Auth configuration and troubleshooting
- `next-devtools`: Next.js runtime diagnostics, error detection, docs access
- `playwright`: E2E browser testing and automation
- `neon`: Database operations and connection management

**Rationale**: Specialized agents ensure expert-level implementation in each domain. MCP servers provide authoritative tooling and documentation.

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

### Backend (FastAPI)
- **Framework**: FastAPI
- **ORM**: SQLModel + asyncpg
- **Validation**: Pydantic v2
- **Migrations**: Alembic
- **Testing**: pytest + pytest-asyncio

### Database
- **Provider**: Neon PostgreSQL
- **Driver**: asyncpg (async)

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
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities, auth config
│   │   └── actions/         # Server Actions
│   ├── tests/               # Vitest tests
│   └── e2e/                 # Playwright E2E tests
│
├── backend/                 # FastAPI + SQLModel
│   ├── src/
│   │   ├── api/             # Route handlers
│   │   ├── models/          # SQLModel models
│   │   ├── services/        # Business logic
│   │   ├── auth/            # JWT verification
│   │   └── db/              # Database session
│   ├── alembic/             # Migrations
│   └── tests/               # pytest tests
│
└── k8s/                     # Future Kubernetes configs (Phase 4+)
```

---

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql+asyncpg://user:password@host/dbname
BETTER_AUTH_SECRET=your-shared-secret-min-32-chars
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
BETTER_AUTH_SECRET=your-shared-secret-min-32-chars
BETTER_AUTH_URL=https://your-frontend-domain.vercel.app
```

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

This constitution supersedes all other development practices for Phase 2. All PRs and code reviews MUST verify compliance with these principles.

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

- [ ] GitHub repo with monorepo structure
- [ ] Working Next.js frontend on Vercel
- [ ] Working FastAPI backend (deployed)
- [ ] Neon PostgreSQL with migrated schema
- [ ] User authentication (signup/signin/signout)
- [ ] Full task CRUD functionality
- [ ] Responsive, premium UI
- [ ] README with setup instructions

---

**Version**: 2.0.0 | **Ratified**: 2025-12-31 | **Last Amended**: 2026-01-07
