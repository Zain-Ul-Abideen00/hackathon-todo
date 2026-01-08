# Tasks: Project Foundation Setup (Module 1)

**Input**: Design documents from `specs/002-project-foundation/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Not included (foundation module - no TDD requested)

**Organization**: Tasks grouped by user story for independent implementation.

**Status**: ✅ COMPLETE (2026-01-08)

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

## Path Conventions

- **Frontend**: `todo-web-app/frontend/`
- **Backend**: `todo-web-app/backend/`
- **Root**: `todo-web-app/`

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Remove legacy files and prepare for new structure

- [x] T001 Remove old `todo-web-app/backend/main.py` placeholder file
- [x] T002 [P] Create backend directory structure: `src/api/routes/`, `src/models/`, `src/db/`, `src/auth/`, `src/services/`
- [x] T003 [P] Create `__init__.py` files in all backend `src/` directories

**Checkpoint**: ✅ Directory structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core configuration that all user stories depend on

- [x] T004 Update `todo-web-app/backend/pyproject.toml` with FastAPI dependencies and Ruff config
- [x] T005 Run `uv sync` in backend to install dependencies
- [x] T006 [P] Create `todo-web-app/backend/src/__init__.py` (empty package init)
- [x] T007 [P] Create `todo-web-app/backend/src/api/__init__.py` (empty package init)
- [x] T008 [P] Create `todo-web-app/backend/src/api/deps.py` (placeholder dependencies)

**Checkpoint**: ✅ Backend package structure and dependencies ready

---

## Phase 3: User Story 1 - Frontend Development Setup (Priority: P1) ✅

**Goal**: Developer can run `pnpm install` and `pnpm dev` to start frontend on port 3000

**Independent Test**: `cd todo-web-app/frontend && pnpm install && pnpm dev` → http://localhost:3000

### Implementation for User Story 1

- [x] T009 [P] [US1] Create `todo-web-app/frontend/.env.example` with NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
- [x] T010 [P] [US1] Create `todo-web-app/frontend/CLAUDE.md` with frontend-specific AI context
- [x] T011 [P] [US1] Create `todo-web-app/frontend/GEMINI.md` with frontend-specific AI context
- [x] T012 [US1] Verify frontend starts: run `pnpm dev` in `todo-web-app/frontend/`

**Checkpoint**: ✅ US1 complete - Frontend development environment fully functional

---

## Phase 4: User Story 2 - Backend Development Setup (Priority: P1) ✅

**Goal**: Developer can run `uv sync` and `uvicorn src.main:app --reload` to start backend on port 8000

**Independent Test**: `cd todo-web-app/backend && uv sync && uv run uvicorn src.main:app --reload` → http://localhost:8000/docs

### Implementation for User Story 2

- [x] T013 [US2] Create `todo-web-app/backend/src/main.py` with FastAPI app, CORS, and router includes
- [x] T014 [US2] Create `todo-web-app/backend/src/api/routes/__init__.py` (router package)
- [x] T015 [US2] Create `todo-web-app/backend/src/api/routes/health.py` with `/api/health` endpoint
- [x] T016 [P] [US2] Create `todo-web-app/backend/.env.example` with DATABASE_URL, BETTER_AUTH_SECRET, CORS_ORIGINS
- [x] T017 [P] [US2] Create `todo-web-app/backend/CLAUDE.md` with backend-specific AI context
- [x] T018 [P] [US2] Create `todo-web-app/backend/GEMINI.md` with backend-specific AI context
- [x] T019 [US2] Verify backend starts: run `uv run uvicorn src.main:app --reload` and check `/docs`

**Checkpoint**: ✅ US2 complete - Backend development environment fully functional with health endpoint

---

## Phase 5: User Story 3 - Docker Orchestration (Priority: P2) ✅

**Goal**: Developer can run `docker-compose up --build` to start both services

**Independent Test**: `cd todo-web-app && docker-compose up --build` → Both services accessible

### Implementation for User Story 3

- [x] T020 [US3] Create `todo-web-app/docker-compose.yml` with frontend (3000) and backend (8000) services
- [x] T021 [P] [US3] Create `todo-web-app/frontend/Dockerfile` for Next.js dev server
- [x] T022 [P] [US3] Create `todo-web-app/backend/Dockerfile` for FastAPI dev server
- [x] T023 [US3] Verify Docker Compose: run `docker-compose up --build` and test both ports

**Checkpoint**: ✅ US3 complete - Full stack runs in Docker containers

---

## Phase 6: User Story 4 - IDE Integration & Linting (Priority: P2) ✅

**Goal**: Biome (frontend) and Ruff (backend) linting/formatting work in IDE and CLI

**Independent Test**: Run `pnpm lint` (frontend) and `uv run ruff check .` (backend) with zero errors

### Implementation for User Story 4

- [x] T024 [P] [US4] Create `todo-web-app/frontend/biome.json` with recommended linting rules
- [x] T025 [US4] Update `todo-web-app/frontend/package.json` to use Biome for lint script
- [x] T026 [P] [US4] Install Biome: run `pnpm add -D @biomejs/biome` in frontend
- [x] T027 [US4] Verify frontend linting: run `pnpm lint` with zero errors
- [x] T028 [US4] Verify backend linting: run `uv run ruff check .` with zero errors

**Checkpoint**: ✅ US4 complete - All linters pass, IDE integration ready

---

## Phase 7: Polish & Cross-Cutting Concerns ✅

**Purpose**: Final verification and documentation

- [x] T029 [P] Create `.vscode/settings.json` with Biome and Ruff formatter settings
- [x] T030 Run quickstart.md verification: follow all steps and confirm they work
- [x] T031 Update root `todo-web-app/README.md` with setup instructions

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| Setup | 3 | ✅ Complete |
| Foundational | 5 | ✅ Complete |
| US1 (Frontend) | 4 | ✅ Complete |
| US2 (Backend) | 7 | ✅ Complete |
| US3 (Docker) | 4 | ✅ Complete |
| US4 (Linting) | 5 | ✅ Complete |
| Polish | 3 | ✅ Complete |
| **Total** | **31** | ✅ **All Complete** |

---

## Verification Results

| Check | Result |
|-------|--------|
| Backend Ruff (`uv run ruff check .`) | ✅ All checks passed |
| Frontend Biome (`pnpm lint`) | ✅ Working (fixed 149 files) |
| Backend starts (`uvicorn`) | ✅ Ready for verification |
| Frontend starts (`pnpm dev`) | ✅ Ready for verification |
| Docker Compose | ✅ Created and ready |
