# Hackathon Todo Project

A comprehensive todo management system built for the **GIAIC Q4 Hackathon (Project 2)**. This repository contains two applications:

1. **Todo Console App** - A terminal-based todo application with a rich, interactive TUI built using Python's Textual framework
2. **Todo Web App** - A full-stack AI-powered web application with Next.js 16, FastAPI, and an intelligent chatbot assistant

---

## 🌟 Project Overview

### Todo Web Application (Primary)

The web application is an **AI-powered task management system** featuring:

- **🤖 AI Chatbot**: Natural language task management via ChatKit + LiteLLM (Gemini/Groq)
- **📋 Smart Task Management**: Create, update, delete, and filter tasks with a beautiful UI
- **🔐 Secure Authentication**: Better Auth with JWT and PostgreSQL session storage
- **🎨 Modern UI/UX**: Lightswind components, Framer Motion animations, dark/light themes
- **📱 Responsive Design**: Desktop sidebar + mobile bottom navigation
- **🚀 Production Ready**: Docker support and Kubernetes deployment (Helm/Minikube)

### Todo Console App (TUI)

A **Terminal User Interface** application providing:

- Rich terminal interface powered by Textual
- Complete keyboard navigation
- Full CRUD operations with local JSON persistence
- Type-safe data models with Pydantic

---

## 🏗 Repository Structure

```
hackathon-todo/
├── todo-web-app/                 # Full-stack web application
│   ├── frontend/                 # Next.js 16 + React 19 + Tailwind v4
│   ├── backend/                  # FastAPI + SQLModel + ChatKit
│   ├── k8s/                      # Kubernetes Helm charts
│   └── docker-compose.yml        # Local development orchestration
│
├── todo-console-app/             # TUI application
│   ├── src/                      # Source code (Textual TUI)
│   ├── tests/                    # Test suite
│   └── pyproject.toml            # Python dependencies
│
├── specs/                        # Feature specifications (SDD)
│   ├── 001-todo-tui-app/         # Console app specification
│   ├── 002-project-foundation/   # Web app foundation
│   ├── 003-database-schema/      # Database schema design
│   ├── 004-task-api/             # RESTful API spec
│   ├── 005-jwt-auth/             # Authentication spec
│   ├── 006-frontend-core/        # Frontend core features
│   ├── 007-backend-chatbot/      # AI chatbot backend
│   ├── 008-frontend-chatkit/     # ChatKit frontend integration
│   └── ...                       # Additional feature specs
│
├── .specify/                     # Project configuration & templates
│   └── memory/constitution.md    # Development guidelines
│
├── history/                      # Development history & ADRs
└── GEMINI.md / CLAUDE.md         # AI assistant guidelines
```

---

## 🚀 Quick Start

### Todo Web App (Recommended)

```bash
# 1. Navigate to web app
cd todo-web-app

# 2. Start with Docker Compose
docker-compose up --build
# Frontend → http://localhost:3000
# Backend  → http://localhost:8000/docs

# OR start services individually:

# Backend
cd backend
cp .env.example .env  # Configure environment
uv sync
uv run uvicorn src.main:app --reload

# Frontend
cd frontend
cp .env.example .env.local  # Configure environment
pnpm install
pnpm dev
```

### Todo Console App

```bash
cd todo-console-app
uv sync
uv run python src/main.py
```

---

## 🛠 Technology Stack

### Web Application

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Lightswind UI, Framer Motion |
| **Backend** | FastAPI, SQLModel, asyncpg, Alembic, Pydantic |
| **Authentication** | Better Auth, JWT, PostgreSQL sessions |
| **AI/Chat** | OpenAI ChatKit, LiteLLM (Gemini/Groq), Agents SDK, MCP Tools |
| **Database** | Neon PostgreSQL (production), SQLite (testing) |
| **DevOps** | Docker, Kubernetes, Helm, Minikube |

### Console Application

| Layer | Technologies |
|-------|--------------|
| **Framework** | Python 3.12+, Textual (TUI) |
| **Data** | Pydantic, JSON persistence |
| **Testing** | pytest |

---

## 📚 Documentation

### Web Application
- [Web App README](todo-web-app/README.md) - Quick start and architecture
- [Frontend README](todo-web-app/frontend/README.md) - Next.js application details
- [Backend README](todo-web-app/backend/README.md) - FastAPI API documentation

### Console Application
- [Console App README](todo-console-app/README.md) - TUI application guide

### Specifications
- [Project Foundation](specs/002-project-foundation/spec.md) - Web app requirements
- [Task API](specs/004-task-api/spec.md) - RESTful API specification
- [Backend Chatbot](specs/007-backend-chatbot/spec.md) - AI chatbot implementation
- [Project Constitution](.specify/memory/constitution.md) - Development principles

---

## ⌨️ Console App Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `a` | Add a new task |
| `e` | Edit the selected task |
| `d` | Delete the selected task |
| `c` | Toggle task completion |
| `↑/↓` | Navigate through tasks |
| `Tab` | Switch filters (All/Pending/Completed) |
| `q` | Quit the application |

---

## 🧪 Development

### Project Philosophy

This project follows **Spec-Driven Development (SDD)** with:

1. **Feature Specifications First**: All features documented before implementation
2. **Test-Driven Development**: Red → Green → Refactor cycle
3. **Type Safety**: TypeScript (frontend) and Pydantic (backend)
4. **Modular Architecture**: Clean separation of concerns
5. **AI-Assisted Development**: Gemini/Claude integration for coding support

### Running Tests

```bash
# Backend tests
cd todo-web-app/backend
uv run pytest -v

# Console app tests
cd todo-console-app
uv run pytest
```

### Code Quality

```bash
# Frontend linting/formatting
cd todo-web-app/frontend
pnpm lint
pnpm format

# Backend linting/formatting
cd todo-web-app/backend
uv run ruff check src/
uv run ruff format .
```

---

## 🤝 Contributing

This hackathon project follows TDD principles:

1. Write failing tests (Red)
2. Implement minimal code to pass (Green)
3. Refactor for quality (Refactor)

All code must include:
- Type hints / TypeScript types
- Docstrings (Google style)
- Corresponding tests
- Constitution compliance

---

## 📄 License

This project is developed as part of the GIAIC Q4 Hackathon.

---

## 👨‍💻 Author

**Zain UL Abideen** ([@Zain-Ul-Abideen00](https://github.com/Zain-Ul-Abideen00))
