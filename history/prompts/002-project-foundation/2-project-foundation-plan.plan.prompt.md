---
id: 2
title: Project Foundation Implementation Plan
stage: plan
date: 2026-01-08
surface: agent
model: gemini-2.5-pro
feature: 002-project-foundation
branch: 002-project-foundation
user: developer
command: /sp-plan
labels: ["module-1", "foundation", "planning", "fastapi", "docker", "biome", "ruff"]
links:
  spec: specs/002-project-foundation/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-project-foundation/plan.md
  - specs/002-project-foundation/research.md
  - specs/002-project-foundation/data-model.md
  - specs/002-project-foundation/quickstart.md
  - specs/002-project-foundation/contracts/openapi.md
tests:
  - null
---

## Prompt

@[/sp-plan] Implementation Plan for Module 1: Project Foundation

Use @monorepo-architect for structure decisions.
Use @tooling-engineer for tooling configuration.
Reference skill: monorepo-management

## Frontend Setup (todo-web-app/frontend/)
1. Initialize Next.js 16+: npx create-next-app@canary ./ --typescript --tailwind --eslint (if not initialized)
2. Add and initialize Lightswind UI: pnpm add lightswind && npx lightswind@latest init (if not initialized)
3. Configure Biome for linting/formatting
4. Create lib/ structure for utilities
5. Create CLAUDE.md and GEMINI.md with frontend-specific context

## Backend Setup (todo-web-app/backend/)
1. Initialize with uv: uv init (if not initialized)
2. Add dependencies: fastapi, uvicorn, sqlmodel, python-dotenv, alembic, asyncpg, python-jose[cryptography], httpx
3. Configure Ruff (ruff.toml)
4. Create folder structure: src/api/, src/models/, src/db/, src/auth/
5. Create CLAUDE.md and GEMINI.md with backend-specific context

## Root Configuration
1. Create docker-compose.yml (frontend:3000, backend:8000)
2. Create .env.example with all required variables
3. Update root CLAUDE.md with Phase 2 overview

## Verification
- Frontend: `cd frontend && pnpm dev` → http://localhost:3000
- Backend: `cd backend && uvicorn src.main:app --reload` → http://localhost:8000/docs
- Docker: `docker-compose up --build` → Both services running

## Response snapshot

Created implementation plan with Phase 0 (research) and Phase 1 (design) artifacts:
- **research.md**: Gap analysis showing frontend complete, backend needs FastAPI stack
- **data-model.md**: N/A for Module 1 (no DB entities)
- **contracts/openapi.md**: Health check endpoint specification
- **quickstart.md**: Developer setup guide
- **plan.md**: Comprehensive implementation plan with proposed changes and 5 verification tests

Ran agent context update script to incorporate new technologies.

## Outcome

- ✅ Impact: Complete implementation plan for Module 1 foundation setup
- 🧪 Tests: 5 verification tests defined (backend startup, health check, frontend startup, linters, docker)
- 📁 Files: 5 spec artifacts created (plan.md, research.md, data-model.md, quickstart.md, contracts/openapi.md)
- 🔁 Next prompts: /sp.tasks after plan approval
- 🧠 Reflection: Frontend already complete saves significant implementation work

## Evaluation notes (flywheel)

- Failure modes observed: None - workflow followed correctly
- Graders run and results (PASS/FAIL): Constitution check - PASS
- Prompt variant (if applicable): Standard /sp-plan workflow
- Next experiment (smallest change to try): None needed - successful execution
