---
id: 003
title: Phase 2 Full-Stack Constitution
stage: constitution
date: 2026-01-07
surface: Claude Code
model: claude-opus-4-5-20251101
feature: phase-2-web-app
branch: main
user: Zain-Ul-Abideen00
command: /sp.constitution
labels: [constitution, phase-2, full-stack, next.js, fastapi, better-auth]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - null
---

## Prompt

Create the constitution for Phase 2: Full-Stack Todo Web Application.

## Project Overview
Transform the Phase 1 console app into a multi-user web application with:
- Next.js 16+ frontend with App Router
- FastAPI backend with SQLModel
- Neon PostgreSQL database
- Better Auth + JWT authentication
- Deployed on Vercel (frontend) and Railway/Render (backend)

## Project Structure (Monorepo)
Location: `todo-web-app/` directory
- `todo-web-app/frontend/`: Next.js 16+ App
- `todo-web-app/backend/`: FastAPI + SQLModel
- `todo-web-app/k8s/`: Future Kubernetes configs (Phase 4+)

## Agentic Development Principles
- Use `@better-auth-expert` for auth work
- Use `@nextjs-developer` for frontend work
- Use `@fastapi-pro` for backend API development
- Use `@database-architect` for database schema
- Use `@ui-designer` for UI/UX decisions

## Code Quality Principles
[Comprehensive principles for Frontend, Backend, Database, Auth, Security, Testing, and Performance]

## Response snapshot

Created Phase 2 Full-Stack Todo Web Application constitution with:

**Version Change**: 1.0.0 → 2.0.0 (MAJOR - Full-Stack Web App Transition)

**12 Core Principles**:
1. Next.js 16+ Frontend Architecture (Server Components, async params, Server Actions)
2. FastAPI Backend Architecture (async-first, SQLModel, Pydantic v2)
3. Database Architecture (Neon PostgreSQL, Alembic migrations, indexes)
4. Authentication (Better Auth + JWT, shared secret, user isolation)
5. Security First (input validation, CORS, secrets management)
6. Test-Driven Development (pytest, Vitest, Playwright, 80% coverage)
7. Type Safety & Validation (TypeScript strict, Python type hints)
8. Documentation Standards (docstrings, OpenAPI, conventional commits)
9. Performance & Optimization (lazy loading, image optimization, caching)
10. Accessibility (WCAG 2.1 AA compliance)
11. Tooling & Environment (uv, pnpm, ruff, ESLint)
12. Agentic Development (subagents, skills, MCP servers)

**Added Sections**: Project Structure, Environment Variables, Development Workflow, Deliverables Checklist

## Outcome

- ✅ Impact: MAJOR version bump, complete transition from console to full-stack web app
- 🧪 Tests: N/A (constitution document)
- 📁 Files: `.specify/memory/constitution.md` updated
- 🔁 Next prompts: `/sp.specify` for first feature, `/sp.plan` with agent references
- 🧠 Reflection: Constitution now provides comprehensive guidance for full-stack development with specialized agents

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate template sync requirements in first feature spec
