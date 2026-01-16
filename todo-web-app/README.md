# Todo Web App

Full-stack Todo Web Application with Next.js 16+ frontend and FastAPI backend.

## Quick Start

### Prerequisites

- Node.js 20+ and pnpm
- Python 3.12+ and uv
- Docker (optional)

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
# → http://localhost:3000
```

### Backend

```bash
cd backend
uv sync
uv run uvicorn src.main:app --reload
# → http://localhost:8000/docs
```

### Docker (Full Stack)

```bash
docker-compose up --build
# Frontend → http://localhost:3000
# Backend  → http://localhost:8000/docs
```

## Project Structure

```text
todo-web-app/
├── frontend/          # Next.js 16+ (React 19, Tailwind v4, Lightswind)
├── backend/           # FastAPI (SQLModel, asyncpg, Alembic)
├── docker-compose.yml # Local development orchestration
└── .vscode/           # IDE settings
```

## Environment Setup

Copy `.env.example` to `.env` (backend) or `.env.local` (frontend):

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

## Development

### Linting

```bash
# Frontend (Biome)
cd frontend && pnpm lint

# Backend (Ruff)
cd backend && uv run ruff check .
```

### Formatting

```bash
# Frontend
cd frontend && pnpm format

# Backend
cd backend && uv run ruff format .
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Related Documentation

- [Feature Specification](../specs/002-project-foundation/spec.md)
- [Implementation Plan](../specs/002-project-foundation/plan.md)
- [Quickstart Guide](../specs/002-project-foundation/quickstart.md)
