# Backend Chatbot - Quick Start Guide

## Prerequisites

- Python 3.12+
- uv package manager
- Running backend from Phase 2
- Gemini API key

## 1. Install Dependencies

```bash
cd todo-web-app/backend
uv add "openai-chatkit" "openai-agents[litellm]" mcp
uv sync
```

## 2. Configure Environment

Add to `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## 3. Start Development Server

```bash
cd todo-web-app/backend
uv run uvicorn src.main:app --reload
```

## 4. Test Chat Endpoint

```bash
# Test endpoint (should return empty threads list)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"type":"threads.list","params":{}}'
```

## 5. Run Tests

```bash
cd todo-web-app/backend
uv run pytest tests/test_chat*.py -v
```

## Key Files

| File | Purpose |
|------|---------|
| `src/chat/tools.py` | MCP tools wrapping task_service |
| `src/chat/agent.py` | AI agent with LiteLLM |
| `src/chat/server.py` | ChatKitServer subclass |
| `src/chat/routes.py` | POST /api/chat endpoint |

## API Reference

### POST /api/chat

ChatKit protocol endpoint supporting:
- `threads.list` - List conversation threads
- `threads.get` - Get specific thread
- `messages.create` - Send message (starts streaming response)
- `messages.list` - List thread messages

### Authentication

- Endpoint accessible without auth (for general chat)
- Task operations require `Authorization: Bearer <token>` header
- Unauthenticated users receive "login required" for task operations
