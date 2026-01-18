---
id: 4
title: Phase 3 AI Chatbot Constitution
stage: constitution
date: 2026-01-18
surface: agent
model: gemini-2.5-pro
feature: phase-3-chatbot
branch: main
user: zain-ul-abideen00
command: /sp-constitution
labels: [constitution, phase-3, chatbot, ai-agent, chatkit, mcp-tools]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - null
---

## Prompt

Create the constitution for Phase 3: AI-Powered Todo Chatbot.

## Project Overview
Extend the Phase 2 web application with an AI-powered chatbot interface that manages todos through natural language, using:
- OpenAI ChatKit for chat UI (frontend + backend)
- OpenAI Agents SDK with LiteLLM for Gemini AI
- MCP tools wrapping existing task_service functions
- Stateless architecture with database-persisted conversations

## Project Structure
Location: `todo-web-app/` directory (Phase 2 monorepo)
- `todo-web-app/backend/src/chat/`: NEW - ChatKit server, agent, MCP tools
- `todo-web-app/backend/src/services/task_service.py`: EXISTING - Reuse all task functions
- `todo-web-app/frontend/src/components/chat/`: NEW - ChatBot component
- `todo-web-app/frontend/src/app/chat/`: NEW - Chat page route

## Agentic Development Principles

### 1. Subagent Usage
- Use `@fastapi-pro` for ChatKit backend integration
- Use `@mcp-developer` for wrapping task_service as MCP tools
- Use `@python-pro` for AI agent implementation with LiteLLM
- Use `@database-architect` for conversation persistence schema
- Use `@nextjs-developer` for ChatKit frontend integration
- Use `@ui-designer` for chat UI styling

### 2. Skill References
- Reference `integrating-chatkit` skill for ChatKit patterns (CRITICAL)
- Reference `building-with-openai-agents` skill for Agent SDK patterns
- Reference `mcp-builder` skill for MCP tool implementation
- Reference `building-with-sqlmodel-async` skill for conversation models

### 3. Reusing Existing Code
CRITICAL: The following functions ALREADY EXIST in `src/services/task_service.py`:
- `create_task(session, task_data, user_id)` → Creates task
- `get_task(session, task_id, user_id)` → Gets single task
- `update_task(session, task_id, task_update, user_id)` → Updates task
- `delete_task(session, task_id, user_id)` → Deletes task (returns bool)
- `list_tasks_by_user(session, user_id, completed=None)` → Lists tasks
- `toggle_task_completion(session, task_id, user_id)` → Toggles complete

MCP tools should CALL these functions, not reimplement them.

## Code Quality Principles

[Full specification included in original prompt - ChatKit Backend, MCP Tools, AI Agent, ChatKit Frontend, Conversation Persistence sections]

## Environment Variables Required

### Backend (.env) - Add
- GEMINI_API_KEY: Gemini API key for LiteLLM

### Frontend (.env.local) - Add
- NEXT_PUBLIC_CHATKIT_URL: http://localhost:8000/api/chat
- NEXT_PUBLIC_CHATKIT_DOMAIN_KEY: localhost

## MCP Tools to Implement
- add_task (wraps create_task)
- list_tasks (wraps list_tasks_by_user)
- complete_task (wraps toggle_task_completion)
- delete_task (wraps delete_task)
- update_task (wraps update_task)

## Deliverables Checklist
- ChatKit backend at /api/chat
- 5 MCP tools wrapping task_service
- AI agent with Gemini via LiteLLM
- ChatKit frontend component
- Conversation persistence tables
- Chat accessible from dashboard or /chat
- Tests with 80% coverage
- Demo video (under 90 seconds)

## Response snapshot

Created Phase 3 constitution (v3.0.0) with comprehensive updates:

**Version Change**: 2.0.0 → 3.0.0 (MAJOR: AI Chatbot Extension)

**New Principles Added**:
- XIII. ChatKit Integration (OpenAI ChatKit Backend & Frontend)
- XIV. AI Agent Architecture (OpenAI Agents SDK + LiteLLM)
- XV. MCP Tool Design (Model Context Protocol wrappers)
- XVI. Conversation Persistence (Database-backed threads)

**Key Sections**:
- Updated Agentic Development with Phase 3 agents/skills
- AI/Chat Technology Stack specification
- MCP Tools specification with input/output contracts
- New environment variables (GEMINI_API_KEY, CHATKIT_URL, CHATKIT_DOMAIN_KEY)
- Updated project structure with new `src/chat/` directory
- Phase 3 deliverables checklist

**Templates Validated**: plan-template.md, spec-template.md, tasks-template.md - No changes required.

## Outcome

- ✅ Impact: Constitution updated from v2.0.0 to v3.0.0 with 4 new principles for AI chatbot
- 🧪 Tests: N/A (documentation artifact)
- 📁 Files: `.specify/memory/constitution.md`
- 🔁 Next prompts: `/sp-specify` for Phase 3 feature spec, then `/sp-plan` for implementation
- 🧠 Reflection: Constitution successfully extends Phase 2 foundation with AI/chat capabilities while preserving existing principles

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS - All placeholders filled, version incremented correctly
- Prompt variant (if applicable): Standard constitution creation
- Next experiment (smallest change to try): Validate MCP tool contracts during implementation
