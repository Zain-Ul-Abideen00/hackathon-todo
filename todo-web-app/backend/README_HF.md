---
title: Todo Web App API
emoji: ✅
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# Todo Web App - FastAPI Backend

A FastAPI backend for the Todo Web Application with:

- **FastAPI** with async support
- **SQLModel** (SQLAlchemy + Pydantic) ORM
- **Neon PostgreSQL** database
- **Better Auth** JWT verification
- **Rate limiting** (100 req/min per user)

## API Endpoints

- `GET /` - API info
- `GET /docs` - Swagger UI documentation
- `GET /api/health` - Health check
- `GET /api/{user_id}/tasks` - List user tasks
- `POST /api/{user_id}/tasks` - Create task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task

## Environment Variables

Configure these in Hugging Face Space Settings → Variables and Secrets:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | JWT secret (min 32 characters) |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) |
