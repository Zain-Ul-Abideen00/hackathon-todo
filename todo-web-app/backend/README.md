---
title: Todo API
sdk: docker
app_port: 7860
---

# Todo Web App - Backend

FastAPI backend for the Todo Web Application with async PostgreSQL support and AI-powered chatbot integration.

---

## ✨ Overview

This backend provides:
- **RESTful Task API**: Full CRUD with cursor-based pagination
- **AI Chatbot**: ChatKit server with LiteLLM agent (Gemini/Groq support)
- **Authentication**: JWT verification compatible with Better Auth
- **Rate Limiting**: 100 requests/minute per user

---

## 🛠 Technology Stack

### Core
- **Framework**: FastAPI with async support
- **ORM**: SQLModel (SQLAlchemy + Pydantic)
- **Database**: Neon PostgreSQL (asyncpg driver)
- **Migrations**: Alembic (async template)

### Authentication & Security
- **JWT**: python-jose for token verification
- **Rate Limiting**: slowapi (100 req/min per user)
- **CORS**: Configurable origins

### AI Chatbot (Phase 3)
- **[OpenAI ChatKit](https://github.com/openai/chatkit)**: Chat server implementation
- **[OpenAI Agents SDK](https://github.com/openai/agents)**: Agent framework with tool support
- **[LiteLLM](https://github.com/BerriAI/litellm)**: Multi-provider LLM gateway (Gemini, Groq)
- **MCP**: Model Context Protocol for tool definitions

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── main.py              # FastAPI app entry point
│   ├── api/
│   │   ├── deps.py          # Dependencies (DB session, auth, rate limiting)
│   │   └── routes/
│   │       ├── health.py    # Health check endpoint
│   │       └── tasks.py     # Task CRUD endpoints
│   ├── chat/                # 🤖 AI Chatbot module
│   │   ├── server.py        # ChatKitServer implementation
│   │   ├── agent.py         # LiteLLM agent with tool support
│   │   ├── tools.py         # MCP tools (add_task, list_tasks, etc.)
│   │   ├── store.py         # Thread/message persistence
│   │   ├── models.py        # Chat data models
│   │   ├── routes.py        # /api/chat endpoints
│   │   └── title_agent.py   # Auto-generate thread titles
│   ├── models/
│   │   └── task.py          # Task model with indexes
│   ├── schemas/
│   │   ├── common.py        # ErrorResponse, PaginationMeta
│   │   └── task.py          # TaskCreate, TaskUpdate, TaskResponse
│   ├── db/
│   │   ├── connection.py    # Async engine with SSL
│   │   └── dependencies.py  # FastAPI session dependency
│   ├── auth/                # JWT verification
│   └── services/
│       └── task_service.py  # Task CRUD operations
├── alembic/                 # Database migrations
├── tests/                   # pytest tests
├── Dockerfile               # Production container
└── pyproject.toml           # Dependencies & config
```

---

## ⚙️ Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `BETTER_AUTH_SECRET` | Shared JWT secret (min 32 chars) | ✅ |
| `CORS_ORIGINS` | Allowed frontend origins | ✅ |
| `ENVIRONMENT` | `development` / `production` | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | For AI |
| `GROQ_API_KEY` | Groq API key (optional fallback) | For AI |

---

## 🚀 Development

### Installation

```bash
# Install dependencies
uv sync

# Run database migrations
uv run alembic upgrade head

# Start development server
uv run uvicorn src.main:app --reload
# → http://localhost:8000/docs
```

### Commands

```bash
# Linting
uv run ruff check src/

# Format code
uv run ruff format .

# Run tests
uv run pytest -v

# Run tests with coverage
uv run pytest --cov=src
```

---

## 🔌 API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

### Task Management

All task endpoints require the `user_id` in the URL path. Rate limited to 100 req/min per user.

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| POST | `/api/{user_id}/tasks` | Create a new task | 201 |
| GET | `/api/{user_id}/tasks` | List tasks (paginated) | 200 |
| GET | `/api/{user_id}/tasks/{id}` | Get single task | 200 |
| PUT | `/api/{user_id}/tasks/{id}` | Update task | 200 |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task | 200 |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completion | 200 |

#### Query Parameters for List Tasks

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | `all` | Filter: `all`, `pending`, `completed` |
| `sort` | string | `created` | Sort: `created`, `title` |
| `cursor` | string | null | Pagination cursor |
| `limit` | int | 20 | Items per page (1-100) |

### AI Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/send` | Send message to AI assistant |
| GET | `/api/chat/threads` | List user's chat threads |
| GET | `/api/chat/threads/{id}` | Get thread with messages |
| DELETE | `/api/chat/threads/{id}` | Delete a thread |

### Dapr Integration (Phase 5)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs/trigger` | Dapr Jobs API callback for scheduled tasks |
| GET | `/api/jobs/health` | Scheduler health check |

#### Jobs API Scheduling

The backend integrates with Dapr's Jobs API for scheduled operations:

```bash
# Manual trigger for reminder check
curl -X POST http://localhost:8000/api/jobs/trigger \
  -H "Content-Type: application/json" \
  -d '{"job_name": "reminder-check", "scheduled_time": "2024-01-01T12:00:00Z"}'
```

Supported job names:
- `reminder-check`: Processes due reminders and publishes events to Kafka

#### Dapr Secrets Store

Secrets can be retrieved via Dapr's secrets API instead of environment variables:

```python
from src.core.secrets import get_secret

# Retrieve secret (with env var fallback for local dev)
db_url = await get_secret("database-url", default=os.getenv("DATABASE_URL"))
```

Set `DAPR_SECRETS_ENABLED=true` to use Dapr secrets in Kubernetes.

## 🤖 AI Chatbot Module

### Architecture

```
┌──────────────────────────────────────────────┐
│              ChatKitServer                    │
│  ┌─────────────┐    ┌─────────────────────┐  │
│  │   Store     │    │      Agent          │  │
│  │  (Threads   │◄───│  (LiteLLM +         │  │
│  │  Messages)  │    │   MCP Tools)        │  │
│  └──────┬──────┘    └─────────┬───────────┘  │
│         │                     │              │
│         ▼                     ▼              │
│    PostgreSQL           Gemini / Groq       │
└──────────────────────────────────────────────┘
```

### Available MCP Tools

The AI agent can execute these task management operations:

| Tool | Description |
|------|-------------|
| `add_task` | Create a new task with title and description |
| `list_tasks` | List tasks with optional status filter |
| `update_task` | Update task title, description, or completion |
| `delete_task` | Delete a task by ID |
| `toggle_task` | Toggle task completion status |
| `get_task` | Get details of a specific task |

### Example Chat Interactions

```
User: "Add a task to buy groceries"
AI: ✅ Created task "Buy groceries" (ID: 42)

User: "What tasks do I have pending?"
AI: You have 3 pending tasks:
    1. Buy groceries
    2. Finish project report
    3. Call dentist

User: "Mark the groceries task as done"
AI: ✅ Marked "Buy groceries" as completed
```

---

## 📦 Database Migrations

```bash
# Apply all migrations
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1

# Generate new migration
uv run alembic revision --autogenerate -m "description"

# View current revision
uv run alembic current
```

---

## 📚 API Documentation

When the server is running:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 📚 Related Documentation

- [Task API Specification](../../specs/004-task-api/spec.md)
- [Backend Chatbot Specification](../../specs/007-backend-chatbot/spec.md)
- [OpenAPI Contract](../../specs/004-task-api/contracts/openapi.yaml)

---

## 📄 License

This project is developed as part of the GIAIC Q4 Hackathon.

---

## 👨‍💻 Author

**Zain UL Abideen** ([@Zain-Ul-Abideen00](https://github.com/Zain-Ul-Abideen00))
