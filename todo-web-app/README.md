# Todo Web App

A full-stack **AI-powered task management application** built with **Next.js 16**, **FastAPI**, and **OpenAI ChatKit**. Features an intelligent chatbot assistant that can manage your tasks through natural language.

---

## ✨ Features

### 🤖 AI Chatbot
- **Natural Language Task Management**: Create, update, delete, and list tasks through conversation
- **Powered by LiteLLM**: Supports Gemini and Groq models with automatic fallback
- **Thread Persistence**: Conversation history saved to PostgreSQL
- **Tool Execution**: Real-time feedback on task operations

### 📋 Task Management
- Full CRUD operations with optimistic UI updates
- Task filtering: All, Active, Completed
- Cursor-based pagination with sorting
- Real-time sync with React Query

### 🔐 Authentication
- Better Auth with email/password
- JWT token verification
- PostgreSQL session storage
- Protected routes with middleware

### 🎨 Modern UI/UX
- Responsive design (desktop sidebar + mobile bottom nav)
- Dark/light theme with system preference detection
- Lightswind premium components
- Framer Motion animations

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│              Next.js 16 + React 19 + ChatKit                │
│         ┌─────────────┐  ┌─────────────┐                    │
│         │  Dashboard  │  │  AI Chat    │                    │
│         │   (Tasks)   │  │  (Widget)   │                    │
│         └──────┬──────┘  └──────┬──────┘                    │
└────────────────┼────────────────┼───────────────────────────┘
                 │                │
                 ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
│               FastAPI + SQLModel + ChatKit                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Task API    │  │  Chat API    │  │  Auth API    │      │
│  │   /tasks     │  │   /chat      │  │   /auth      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         │                 │                                  │
│         │     ┌───────────┴───────────┐                     │
│         │     │      AI Agent         │                     │
│         │     │ (LiteLLM + MCP Tools) │                     │
│         │     └───────────────────────┘                     │
└─────────┼──────────────────────────────────────────────────┘
          │
          ▼
    ┌───────────┐
    │   Neon    │
    │PostgreSQL │
    └───────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** and **pnpm** (frontend)
- **Python 3.12+** and **uv** (backend)
- **Docker** (optional, for containerized deployment)
- **Neon PostgreSQL** database (or local PostgreSQL)

### Option 1: Docker Compose (Recommended)

```bash
# Configure environment
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
# Edit .env files with your values

# Start full stack
docker-compose up --build

# Frontend → http://localhost:3000
# Backend  → http://localhost:8000/docs
```

### Option 2: Individual Services

#### Frontend

```bash
cd frontend
cp .env.example .env.local  # Configure environment
pnpm install
pnpm dev
# → http://localhost:3000
```

#### Backend

```bash
cd backend
cp .env.example .env  # Configure environment
uv sync
uv run alembic upgrade head  # Run migrations
uv run uvicorn src.main:app --reload
# → http://localhost:8000/docs
```

---

## 📁 Project Structure

```
todo-web-app/
├── frontend/              # Next.js 16+ application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   │   ├── chat/      # ChatBot widget
│   │   │   ├── tasks/     # Task management
│   │   │   └── lightswind/# UI components
│   │   └── lib/           # Utilities & API client
│   └── Dockerfile         # Production container
│
├── backend/               # FastAPI application
│   ├── src/
│   │   ├── api/           # Route handlers
│   │   ├── chat/          # ChatKit server & AI agent
│   │   │   ├── server.py  # ChatKitServer implementation
│   │   │   ├── agent.py   # LiteLLM agent
│   │   │   └── tools.py   # MCP task tools
│   │   ├── models/        # SQLModel entities
│   │   └── services/      # Business logic
│   ├── alembic/           # Database migrations
│   └── Dockerfile         # Production container
│
├── k8s/                   # Kubernetes deployment
│   ├── charts/            # Helm charts (backend, frontend)
│   └── local/             # Minikube configurations
│
└── docker-compose.yml     # Local development orchestration
```

---

## ⚙️ Environment Variables

### Frontend (`.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | ✅ |
| `DATABASE_URL` | Neon PostgreSQL (for Better Auth) | ✅ |
| `BETTER_AUTH_SECRET` | JWT secret (min 32 chars) | ✅ |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Frontend URL | ✅ |

### Backend (`.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection | ✅ |
| `BETTER_AUTH_SECRET` | JWT secret (must match frontend) | ✅ |
| `CORS_ORIGINS` | Allowed frontend origins | ✅ |
| `ENVIRONMENT` | `development` / `production` | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | For AI |
| `GROQ_API_KEY` | Groq API key (optional fallback) | For AI |

---

## 🧪 Testing

### Backend

```bash
cd backend
uv run pytest -v               # Run all tests
uv run pytest --cov=src        # With coverage
```

### Frontend

```bash
cd frontend
pnpm lint                      # Run linter
pnpm lint:fix                  # Auto-fix issues
```

---

## 🔌 API Documentation

When the backend is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/{user_id}/tasks` | GET | List tasks (paginated) |
| `/api/{user_id}/tasks` | POST | Create task |
| `/api/{user_id}/tasks/{id}` | PUT | Update task |
| `/api/{user_id}/tasks/{id}` | DELETE | Delete task |
| `/api/chat/send` | POST | Chat with AI assistant |
| `/api/chat/threads` | GET | List chat threads |
| `/api/health` | GET | Health check |

---

## 🚢 Deployment

### Docker

```bash
# Build individual images
docker build -t todo-frontend ./frontend
docker build -t todo-backend ./backend

# Or use Docker Compose
docker-compose up --build
```

### Kubernetes (Minikube)

```bash
# See k8s/README.md for full instructions
cd k8s
helm install todo-backend ./charts/backend
helm install todo-frontend ./charts/frontend
```

---

## 📚 Related Documentation

- [Frontend README](./frontend/README.md) - Next.js application details
- [Backend README](./backend/README.md) - FastAPI API documentation
- [Feature Specification](../specs/002-project-foundation/spec.md) - Requirements
- [Implementation Plan](../specs/002-project-foundation/plan.md) - Architecture
- [Quickstart Guide](../specs/002-project-foundation/quickstart.md) - Setup guide
- [Backend Chatbot Spec](../specs/007-backend-chatbot/spec.md) - AI chatbot design

---

## 📄 License

This project is developed as part of the GIAIC Q4 Hackathon.

---

## 👨‍💻 Author

**Zain UL Abideen** ([@Zain-Ul-Abideen00](https://github.com/Zain-Ul-Abideen00))
