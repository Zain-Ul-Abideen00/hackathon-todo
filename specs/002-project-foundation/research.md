# Research: Project Foundation Setup (Module 1)

**Branch**: `002-project-foundation` | **Date**: 2026-01-08

## Executive Summary

This research document documents decisions and findings for setting up the monorepo foundation. The existing project already has a functional Next.js 16 frontend but requires backend completion, tooling configuration, and Docker orchestration.

---

## 1. Project State Analysis

### Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend (Next.js) | ✅ Initialized | Next.js 16.1.1, React 19, Tailwind v4, Lightswind installed |
| Backend (FastAPI) | ⚠️ Minimal | Only placeholder `main.py`, no FastAPI dependencies |
| Docker Compose | ❌ Missing | Needs creation |
| Frontend Linting | ❌ ESLint only | Need Biome for unified linting/formatting |
| Backend Linting | ❌ Missing | Need Ruff configuration |
| Environment Templates | ❌ Missing | Need .env.example files |
| Context Files | ❌ Missing | Need CLAUDE.md and GEMINI.md |

### Gap Analysis

1. **Backend Dependencies**: Add FastAPI, SQLModel, uvicorn, asyncpg, python-dotenv, alembic, python-jose[cryptography], httpx
2. **Backend Structure**: Create src/api/, src/models/, src/db/, src/auth/ directories
3. **Frontend Linting**: Replace ESLint with Biome for faster, unified linting
4. **Backend Linting**: Add Ruff configuration file
5. **Docker**: Create docker-compose.yml for both services
6. **Environment**: Create .env.example files for both services
7. **Context**: Create service-specific CLAUDE.md and GEMINI.md files

---

## 2. Technology Decisions

### Decision 1: Biome vs ESLint for Frontend

**Decision**: Use Biome

**Rationale**:
- 10-100x faster than ESLint + Prettier combined
- Single tool for both linting and formatting
- Better TypeScript integration
- Growing ecosystem support

**Alternatives Considered**:
- ESLint + Prettier: Current industry standard but slower, two tools to configure
- Rome (deprecated): Biome is the successor fork

### Decision 2: Backend Project Structure

**Decision**: Use `src/` directory with organized subdirectories

**Rationale**:
- Clear separation of concerns (api, models, db, auth, services)
- Avoids import path issues compared to flat structure
- Matches constitution's defined structure

**Structure**:
```text
src/
├── api/           # FastAPI routes
│   ├── __init__.py
│   ├── routes/
│   │   └── health.py
│   └── deps.py    # Dependencies
├── models/        # SQLModel models (Module 2)
├── db/            # Database connection (Module 2)
├── auth/          # JWT verification (Module 4)
├── services/      # Business logic (Module 3)
└── main.py        # FastAPI app entry point
```

### Decision 3: Docker Compose Version

**Decision**: Use Docker Compose v5.0.1 specification

**Rationale**:
- Widely supported
- Supports all needed features (build, volumes, networks)
- Compatible with Docker Desktop and Docker Engine

### Decision 4: Python Version

**Decision**: Use Python 3.12+ (current pyproject.toml specifies 3.13)

**Rationale**:
- Existing project uses 3.13
- Better performance and newer features
- Aligned with constitution requirement

---

## 3. Tooling Configuration Decisions

### Biome Configuration

**Decision**: Minimal configuration with strict type checking

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "tab",
    "lineWidth": 100
  }
}
```

### Ruff Configuration

**Decision**: Standard Python linting with import sorting

```toml
[tool.ruff]
target-version = "py312"
line-length = 100
select = ["E", "F", "I", "B", "SIM"]
ignore = ["E501"]

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

---

## 4. Environment Variables

### Backend (.env.example)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection | `postgresql+asyncpg://user:pass@host/db` |
| `BETTER_AUTH_SECRET` | Shared JWT secret (min 32 chars) | `your-secret-min-32-characters-here` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:3000` |
| `ENVIRONMENT` | Runtime environment | `development` |

### Frontend (.env.example)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `BETTER_AUTH_SECRET` | Shared JWT secret | `your-secret-min-32-characters-here` |
| `BETTER_AUTH_URL` | Frontend URL for auth | `http://localhost:3000` |

---

## 5. Port Configuration

| Service | Default Port | Docker Port | Environment Variable |
|---------|--------------|-------------|---------------------|
| Frontend | 3000 | 3000 | `PORT` |
| Backend | 8000 | 8000 | `PORT` |

---

## 6. NEEDS CLARIFICATION Resolution

All clarifications from Technical Context have been resolved:

| Item | Resolution |
|------|------------|
| Frontend framework version | Next.js 16.1.1 (already installed) |
| Backend dependencies | Listed in Decision 1 |
| Docker strategy | docker-compose v3.8 |
| Linting tools | Biome (frontend), Ruff (backend) |

---

## References

- [Biome Documentation](https://biomejs.dev/guides/getting-started/)
- [Ruff Documentation](https://docs.astral.sh/ruff/)
- [FastAPI Project Structure](https://fastapi.tiangolo.com/tutorial/)
- [Docker Compose File Reference](https://docs.docker.com/compose/compose-file/)
