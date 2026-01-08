# Quickstart: Project Foundation Setup (Module 1)

**Branch**: `002-project-foundation` | **Date**: 2026-01-08

## Prerequisites

Ensure you have the following installed:

| Tool | Version | Installation |
|------|---------|--------------|
| Node.js | 20+ LTS | [nodejs.org](https://nodejs.org/) |
| pnpm | Latest | `npm install -g pnpm` |
| Python | 3.12+ | [python.org](https://www.python.org/) |
| uv | Latest | `pip install uv` or `brew install uv` |
| Docker Desktop | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) (optional) |

---

## Quick Setup

### Option 1: Individual Services (Recommended for Development)

**Frontend**:
```bash
cd todo-web-app/frontend
pnpm install
pnpm dev
# → http://localhost:3000
```

**Backend** (in separate terminal):
```bash
cd todo-web-app/backend
uv sync
uv run uvicorn src.main:app --reload
# → http://localhost:8000/docs
```

### Option 2: Docker Compose (Full Stack)

```bash
cd todo-web-app
docker-compose up --build
# Frontend → http://localhost:3000
# Backend  → http://localhost:8000/docs
```

---

## Environment Setup

### Frontend (.env.local)

Create `todo-web-app/frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-development-secret-min-32-characters
BETTER_AUTH_URL=http://localhost:3000
```

### Backend (.env)

Create `todo-web-app/backend/.env`:
```bash
DATABASE_URL=postgresql+asyncpg://user:password@localhost/todo_db
BETTER_AUTH_SECRET=your-development-secret-min-32-characters
CORS_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

---

## Verification Commands

### Frontend
```bash
cd todo-web-app/frontend
pnpm lint          # Check linting
pnpm build         # Verify build succeeds
```

### Backend
```bash
cd todo-web-app/backend
uv run ruff check .      # Check linting
uv run python -c "from src.main import app; print('OK')"  # Verify imports
```

---

## IDE Setup

### VS Code Extensions

**Frontend**:
- Biome (biomejs.biome)
- Tailwind CSS IntelliSense

**Backend**:
- Python (ms-python.python)
- Ruff (charliermarsh.ruff)

### Settings (Workspace)

Add to `.vscode/settings.json`:
```json
{
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff"
  },
  "ruff.lint.enable": true,
  "ruff.format.enable": true
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `PORT=3001 pnpm dev` |
| Port 8000 in use | `uv run uvicorn src.main:app --reload --port 8001` |
| Node version error | Use `nvm use 20` |
| Python version error | Use `pyenv local 3.12` |
| Docker build fails | Run `docker system prune -a` and retry |

---

## Next Steps

After Module 1 is complete:
1. **Module 2**: Database & Models (`/sp.specify` for database schema)
2. **Module 3**: Backend API (`/sp.specify` for REST endpoints)
3. **Module 4**: Authentication (`/sp.specify` for Better Auth setup)
