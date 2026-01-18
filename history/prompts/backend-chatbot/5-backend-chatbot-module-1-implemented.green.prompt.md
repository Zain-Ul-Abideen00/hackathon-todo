---
id: 5
title: backend-chatbot-module-1-implemented
stage: green
date: 2026-01-18
surface: agent
model: gemini-2.5-pro
feature: backend-chatbot
branch: 007-backend-chatbot
user: zain-ul-abideen00
command: /sp-implement
labels: [implementation, chatkit, mcp, openai-agents, litellm, phase-3]
links:
  spec: specs/007-backend-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - todo-web-app/backend/pyproject.toml
  - todo-web-app/backend/.env.example
  - todo-web-app/backend/src/chat/__init__.py
  - todo-web-app/backend/src/chat/tools.py
  - todo-web-app/backend/src/chat/agent.py
  - todo-web-app/backend/src/chat/store.py
  - todo-web-app/backend/src/chat/server.py
  - todo-web-app/backend/src/chat/routes.py
  - todo-web-app/backend/src/main.py
tests:
  - 37 existing tests passing (5 pre-existing failures unrelated to chat)
  - App loads successfully with /api/chat route registered
---

## Prompt

/sp-implement Module 1 using:
- @fastapi-pro for ChatKit server and routes
- @mcp-developer for MCP tools wrapping task_service
- @python-pro for agent with LiteLLM

Reference skills:
- integrating-chatkit for ChatKitServer patterns
- mcp-builder for tool definitions
- building-with-openai-agents for Agent SDK patterns

CRITICAL REMINDERS:
1. Reuse existing task_service functions - DO NOT reimplement
2. Import from src.services.task_service
3. Add route to main.py includes
4. Set GEMINI_API_KEY in backend/.env

## Response snapshot

Successfully implemented Module 1: Backend ChatKit + MCP + Agent

**Tasks Completed: T001-T018 (18 of 39)**

**Files Created:**
- `src/chat/__init__.py` - Module exports
- `src/chat/tools.py` - 5 MCP tools (add_task, list_tasks, complete_task, delete_task, update_task)
- `src/chat/agent.py` - AI agent with LiteLLM/Gemini
- `src/chat/store.py` - InMemoryStore implementing ChatKit Store ABC
- `src/chat/server.py` - TodoChatKitServer with streaming
- `src/chat/routes.py` - POST /api/chat endpoint

**Files Modified:**
- `pyproject.toml` - Added openai-chatkit, openai-agents[litellm], mcp
- `.env.example` - Added GEMINI_API_KEY
- `main.py` - Added chat router

**Dependencies Installed:** 46 packages including openai-chatkit, litellm, mcp

**Verification:**
- App loads successfully with `/api/chat` route
- 37/42 existing tests pass (5 failures are pre-existing in update_task tests)
- Module imports verified

## Outcome

- ✅ Impact: Chat endpoint implemented and registered
- 🧪 Tests: App loads, existing tests mostly pass
- 📁 Files: 6 created, 3 modified
- ⚠️ Next steps: Set GEMINI_API_KEY in .env, run manual tests
- 🔁 Remaining: T019-T039 (tests, verification, polish)

## Evaluation notes (flywheel)

- Failure modes observed: ChatKit Store is abstract (fixed with InMemoryStore)
- Fixes applied: Fixed imports (chatkit.store.Store not chatkit.memory), response_model=None for union returns
- Pre-existing issues: 5 test failures in test_task_crud.py (wrong parameter order in update_task calls)
- Next experiment: Run server and test with curl
