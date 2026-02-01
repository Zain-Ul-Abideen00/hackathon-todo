# Feature Specification: Production Containerization

**Feature Branch**: `010-production-containerization`
**Created**: 2026-01-31
**Status**: Draft
**Phase**: 4 (Local Kubernetes Deployment) - Module 1
**Input**: User description: "Production Docker images for backend and frontend"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build Backend Docker Image (Priority: P1)

As a developer, I can build a production-ready Docker image for the FastAPI backend so that the application can be deployed consistently across environments.

**Why this priority**: The backend is the core service that the frontend depends on. Without a containerized backend, Kubernetes deployment cannot proceed.

**Independent Test**: Can be fully tested by running `docker build` and verifying the container starts and responds to health checks.

**Acceptance Scenarios**:

1. **Given** the backend source code exists, **When** I run `docker build -t todo-backend ./backend`, **Then** the build completes successfully without errors.
2. **Given** a built backend image, **When** I run the container with required environment variables, **Then** the application starts and listens on port 8000.
3. **Given** a running backend container, **When** I access the `/api/health` endpoint, **Then** I receive a 200 OK response.
4. **Given** a built backend image, **When** I check the image size, **Then** it is less than 500MB.

---

### User Story 2 - Build Frontend Docker Image (Priority: P2)

As a developer, I can build a production-ready Docker image for the Next.js frontend so that the application can be deployed consistently across environments.

**Why this priority**: The frontend depends on the backend being available but can be containerized independently. It's the user-facing component.

**Independent Test**: Can be fully tested by running `docker build` and verifying the container serves the Next.js application.

**Acceptance Scenarios**:

1. **Given** the frontend source code exists, **When** I run `docker build -t todo-frontend ./frontend`, **Then** the build completes successfully without errors.
2. **Given** a built frontend image, **When** I run the container with required environment variables, **Then** the application starts and listens on port 3000.
3. **Given** a running frontend container, **When** I access the root URL, **Then** I receive the application HTML.
4. **Given** a built frontend image, **When** I check the image size, **Then** it is less than 500MB.

---

### User Story 3 - Secure and Optimized Images (Priority: P3)

As DevOps, the Docker images are optimized for production with security best practices so that deployments are fast, secure, and resource-efficient.

**Why this priority**: Security and optimization are essential for production but build on top of functional images.

**Independent Test**: Can be verified by inspecting image layers, checking user context, and measuring build times.

**Acceptance Scenarios**:

1. **Given** a built image, **When** I inspect the running container, **Then** the process runs as a non-root user.
2. **Given** the Dockerfile, **When** I review the build stages, **Then** there are at least 2 stages (builder and runtime).
3. **Given** source code changes only, **When** I rebuild the image, **Then** dependency layers are cached and build time is reduced.
4. **Given** a built image, **When** I inspect the layers, **Then** no secrets or sensitive files are included.

---

### User Story 4 - Health Check Endpoints (Priority: P4)

As DevOps, health check endpoints are available so that Kubernetes can perform liveness and readiness probes.

**Why this priority**: Health checks are required for Kubernetes probes but the containers must work first.

**Independent Test**: Can be verified by calling the health endpoint and checking the response.

**Acceptance Scenarios**:

1. **Given** the backend is running, **When** I call `/api/health`, **Then** I receive a 200 OK with health status.
2. **Given** the frontend is running, **When** I call the root path, **Then** I receive a valid HTML response (implicit health).

---

### Edge Cases

- What happens when required environment variables are missing?
  - Container should fail to start with a clear error message.
- What happens when the database is unreachable?
  - Backend should start but health check may indicate degraded status.
- What happens during a Docker build with no internet?
  - Build should fail gracefully at the dependency installation step.
- What happens when disk space is low during build?
  - Docker should report insufficient space error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Backend Dockerfile MUST use multi-stage build with separate builder and runtime stages.
- **FR-002**: Frontend Dockerfile MUST use multi-stage build with deps, builder, and runner stages.
- **FR-003**: Both containers MUST run as non-root users for security.
- **FR-004**: Backend container MUST expose port 8000.
- **FR-005**: Frontend container MUST expose port 3000.
- **FR-006**: Backend MUST provide a `/api/health` endpoint returning JSON health status.
- **FR-007**: Both directories MUST have `.dockerignore` files excluding unnecessary files.
- **FR-008**: Backend Dockerfile MUST use `python:3.12-slim` as base image.
- **FR-009**: Frontend Dockerfile MUST use `node:20-alpine` as base image.
- **FR-010**: Frontend MUST use Next.js standalone output mode for minimal image size.
- **FR-011**: Environment variables MUST be configurable at runtime (not baked into image).
- **FR-012**: Docker builds MUST be optimized for layer caching (dependencies before source code).

### Key Entities

- **Backend Image**: FastAPI application container, ~200MB target, serves REST API and ChatKit
- **Frontend Image**: Next.js application container, ~150MB target, serves React UI
- **Health Endpoint**: Backend health check returning service status and dependencies

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Backend Docker image builds successfully in under 5 minutes (clean build).
- **SC-002**: Frontend Docker image builds successfully in under 5 minutes (clean build).
- **SC-003**: Backend image size is less than 500MB (target: <200MB).
- **SC-004**: Frontend image size is less than 500MB (target: <150MB).
- **SC-005**: Containers start within 30 seconds and respond to requests.
- **SC-006**: Rebuild with only source code changes completes in under 60 seconds (cached).
- **SC-007**: Health endpoint responds within 1 second.
- **SC-008**: 100% of containers run as non-root user.

## Assumptions

- Docker Desktop or Docker Engine is installed and running on the development machine.
- The backend has or will have a `/api/health` endpoint (may need to be created).
- pnpm is used for frontend package management.
- uv is used for backend package management (with pip fallback if needed).
- Neon PostgreSQL connection string will be provided via environment variables.
- The application uses Better Auth with JWT tokens for authentication.

## Technical Notes (For Implementation Reference)

> **Note**: These are implementation hints for the planning phase. The specification above remains technology-agnostic.

**Subagent**: `@docker-expert` should be invoked for Dockerfile creation
**Skill Reference**: `production-dockerfile` contains multi-stage build patterns
**Constitution Principle**: XVII. Docker Containerization defines requirements

### Backend Dockerfile Pattern
- Stage 1 (builder): Install uv, copy pyproject.toml and uv.lock, install dependencies
- Stage 2 (runtime): Copy virtual environment and source code, create non-root user, set entrypoint

### Frontend Dockerfile Pattern
- Stage 1 (deps): Install pnpm, copy package.json and pnpm-lock.yaml, install dependencies
- Stage 2 (builder): Copy source, build Next.js in standalone mode
- Stage 3 (runner): Copy standalone output, create nextjs user, set entrypoint

### .dockerignore Patterns
```
node_modules/
.venv/
__pycache__/
.git/
.env*
*.md
tests/
docs/
```
