# Research: Production Containerization

**Feature**: 010-production-containerization
**Date**: 2026-01-31

## Research Summary

No major unknowns requiring external research. All technical decisions are well-established best practices.

---

## Decision 1: Base Images

**Decision**: Use `python:3.12-slim` for backend and `node:20-alpine` for frontend.

**Rationale**:
- `python:3.12-slim` (~45MB) provides Python with minimal footprint while maintaining compatibility
- `node:20-alpine` (~40MB) is the smallest Node.js image, ideal for production

**Alternatives Considered**:
- `python:3.12-alpine`: Smaller but has musl libc compatibility issues with some Python packages
- `node:20-slim`: Larger than alpine, no significant benefits for Next.js

---

## Decision 2: Package Managers

**Decision**: Use `uv` for backend (already in place), `pnpm` with `corepack` for frontend.

**Rationale**:
- `uv` is 10-100x faster than pip, excellent for CI/CD
- `pnpm` with frozen lockfile ensures reproducible builds
- `corepack` is Node.js built-in, no need to install pnpm globally

**Alternatives Considered**:
- pip: Slower, no lock file by default
- npm: Slower than pnpm, larger node_modules

---

## Decision 3: Next.js Standalone Mode

**Decision**: Enable `output: 'standalone'` in next.config.ts.

**Rationale**:
- Reduces image size by ~70% by only including necessary files
- Creates a self-contained server.js that doesn't need node_modules
- Official Next.js recommendation for Docker deployments

**Alternatives Considered**:
- Default output: Much larger image, requires full node_modules
- Static export: Not suitable for SSR/API routes

---

## Decision 4: Non-Root Users

**Decision**: Create dedicated users (`appuser` for backend, `nextjs` for frontend).

**Rationale**:
- Security best practice - container processes shouldn't run as root
- Prevents privilege escalation attacks
- Required for many Kubernetes security policies (Pod Security Standards)

**Alternatives Considered**:
- Running as root: Security risk, blocked by many K8s clusters

---

## Decision 5: Health Check Implementation

**Decision**: Use Python urllib for backend health check (already exists).

**Rationale**:
- No external dependencies (curl not installed in slim image)
- Calls existing `/api/health` endpoint
- 30s interval with 10s timeout is reasonable for K8s probes

**Alternatives Considered**:
- Installing curl: Adds ~1MB to image
- wget: Not in slim image either
- Custom Python script: More complex, same result

---

## Decision 6: Port Configuration

**Decision**: Use environment variable `PORT` with default 8000 for backend, port 3000 for frontend.

**Rationale**:
- **Platform flexibility**: Same Dockerfile works on HF Spaces (PORT=7860) and K8s (PORT=8000)
- HF Spaces automatically sets PORT=7860; K8s uses default 8000 or ConfigMap
- Frontend uses standard port 3000
- No hardcoded ports = no breaking changes when switching platforms

**Alternatives Considered**:
- Hardcode 8000: Would break existing HF Spaces deployment
- Separate Dockerfiles: More maintenance, divergent configurations
- Port 80: Requires root privileges

---

## Existing Infrastructure Analysis

### Backend Dockerfile
- ✅ Multi-stage build already implemented
- ✅ Non-root user already configured
- ✅ Health check already configured
- ⚠️ Port needs update (7860→8000)

### Frontend Dockerfile
- ❌ Development-only Dockerfile
- ❌ No multi-stage build
- ❌ No non-root user
- ❌ Runs in dev mode

### .dockerignore Files
- ✅ Backend has comprehensive .dockerignore
- ❌ Frontend needs .dockerignore created

---

## Conclusion

All research items resolved. Implementation can proceed with high confidence.
