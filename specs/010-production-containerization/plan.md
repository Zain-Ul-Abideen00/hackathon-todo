# Implementation Plan: Production Containerization

**Branch**: `010-production-containerization` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/010-production-containerization/spec.md`

## Summary

Create production-ready Docker images for both backend (FastAPI) and frontend (Next.js) with multi-stage builds, security hardening (non-root users), and optimization for Kubernetes deployment. The backend Dockerfile will use **environment variable PORT** (default 8000) for platform flexibility (works on both Hugging Face Spaces and Kubernetes). The frontend needs a complete rewrite from development to production mode with standalone output.

## Technical Context

**Language/Version**: Python 3.12, Node.js 20
**Primary Dependencies**: FastAPI, uvicorn, Next.js 16+, pnpm
**Storage**: Neon PostgreSQL (external, not containerized)
**Testing**: Docker build verification, container health checks
**Target Platform**: Local Kubernetes (Minikube)
**Project Type**: Web application (monorepo)
**Performance Goals**: Image size <200MB backend, <150MB frontend
**Constraints**: Non-root execution, runtime env vars, layer caching
**Scale/Scope**: Single replica per service initially

## Constitution Check

*GATE: Must pass before implementation. Re-check after completion.*

| Principle | Status | Notes |
|-----------|--------|-------|
| XVII. Docker Containerization | ✅ Pass | Multi-stage, non-root, health checks, size targets |
| V. Security First | ✅ Pass | Non-root user, no secrets in image, runtime env vars |
| XI. Tooling & Environment | ✅ Pass | python:3.12-slim, node:20-alpine, uv, pnpm |
| IX. Performance & Optimization | ✅ Pass | Layer caching, minimal image size |

## Project Structure

### Documentation (this feature)

```text
specs/010-production-containerization/
├── spec.md              # Feature specification ✅
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Deployment guide
└── checklists/
    └── requirements.md  # Quality checklist ✅
```

### Source Code Changes

```text
todo-web-app/
├── backend/
│   ├── Dockerfile           # [MODIFY] Use PORT env var (default 8000)
│   └── .dockerignore        # [EXISTS] Already comprehensive
├── frontend/
│   ├── Dockerfile           # [MODIFY] Complete rewrite for production
│   ├── .dockerignore        # [NEW] Create from scratch
│   └── next.config.ts       # [MODIFY] Add output: 'standalone'
└── docker-compose.yml       # [NEW] Optional local testing
```

---

## Proposed Changes

### Backend

#### [MODIFY] [Dockerfile](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/backend/Dockerfile)

Update the existing production Dockerfile to use **environment variable PORT** for platform flexibility:

- Add `ENV PORT=8000` (default for K8s, HF auto-sets to 7860)
- Change `EXPOSE 7860` → `EXPOSE ${PORT}`
- Update health check to use dynamic port
- Change CMD to use `${PORT}` variable
- Keep all other multi-stage build optimizations

**Result**: Same Dockerfile works on both Hugging Face Spaces (PORT=7860) and Kubernetes (PORT=8000)

---

### Frontend

#### [MODIFY] [Dockerfile](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/frontend/Dockerfile)

Complete rewrite from development to production multi-stage build:

**Stage 1: deps** - Install dependencies
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
```

**Stage 2: builder** - Build Next.js in standalone mode
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build
```

**Stage 3: runner** - Minimal production image
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

#### [NEW] [.dockerignore](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/frontend/.dockerignore)

Create comprehensive Docker ignore file:

```
node_modules
.next
.git
.env*
!.env.example
*.md
tests/
.vscode/
.idea/
*.log
```

#### [MODIFY] [next.config.ts](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/todo-web-app/frontend/next.config.ts)

Add standalone output mode for minimal Docker image:

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
};
```

---

## Agents & Skills

**Subagent**: `@docker-expert` - Dockerfile creation and optimization
**Skill Reference**: `production-dockerfile` - Multi-stage build patterns

---

## Verification Plan

### Automated Tests

1. **Build Backend Image**
   ```bash
   cd todo-web-app/backend
   docker build -t todo-backend .
   ```
   - Expected: Build completes without errors
   - Success: Exit code 0

2. **Build Frontend Image**
   ```bash
   cd todo-web-app/frontend
   docker build -t todo-frontend .
   ```
   - Expected: Build completes without errors
   - Success: Exit code 0

3. **Check Image Sizes**
   ```bash
   docker images | grep todo
   ```
   - Expected: Backend <500MB, Frontend <500MB
   - Target: Backend <200MB, Frontend <150MB

4. **Verify Non-Root User (Backend)**
   ```bash
   docker run --rm todo-backend whoami
   ```
   - Expected: `appuser` (not root)

5. **Verify Non-Root User (Frontend)**
   ```bash
   docker run --rm todo-frontend whoami
   ```
   - Expected: `nextjs` (not root)

### Manual Verification

1. **Run Backend Container**
   ```bash
   docker run -d -p 8000:8000 --name test-backend \
     -e DATABASE_URL="postgresql+asyncpg://test:test@host/db" \
     -e BETTER_AUTH_SECRET="test-secret-32-chars-minimum-len" \
     -e GEMINI_API_KEY="test-key" \
     -e CORS_ORIGINS="http://localhost:3000" \
     todo-backend
   ```
   Then: `curl http://localhost:8000/api/health`
   - Expected: HTTP 200 with JSON health status
   - Cleanup: `docker stop test-backend && docker rm test-backend`

2. **Run Frontend Container**
   ```bash
   docker run -d -p 3000:3000 --name test-frontend \
     -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
     todo-frontend
   ```
   Then: Open `http://localhost:3000` in browser
   - Expected: Application loads with login/signup page
   - Cleanup: `docker stop test-frontend && docker rm test-frontend`

### Existing Tests

No existing Docker-specific tests in the repository. The verification relies on build success and runtime health checks.

---

## Complexity Tracking

No constitution violations. All changes align with Phase 4 principles.

---

## Implementation Order

1. **T001**: Update `next.config.ts` with `output: 'standalone'`
2. **T002**: Create `frontend/.dockerignore`
3. **T003**: Rewrite `frontend/Dockerfile` for production
4. **T004**: Update `backend/Dockerfile` ports (7860→8000)
5. **T005**: Build and verify both images
6. **T006**: Test container health endpoints
