---
id: 002
title: Create Chat Persistence Plan
stage: plan
date: 2026-01-18
surface: agent
model: gemini-2.5-pro
feature: 009-chat-persistence
branch: 009-chat-persistence
user: developer
command: /sp-plan
labels: [chatkit, postgresql, sqlmodel, alembic, testing]
links:
  spec: specs/009-chat-persistence/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/009-chat-persistence/plan.md
  - specs/009-chat-persistence/data-model.md
  - specs/009-chat-persistence/quickstart.md
tests:
  - null
---

## Prompt

@[/sp-plan] create plan by reading our specs and @[learning/Guides/chatkit-integration-guide.md]
additional details:
 Plan for Module 3: Persistence & Testing

Use @database-architect for schema.
Reference skill: building-with-sqlmodel-async

## 1. Database Models (src/models/chatkit.py)
```python
class ChatKitThread(SQLModel, table=True):
    __tablename__ = "chatkit_threads"
    id: str = Field(primary_key=True)
    user_id: str = Field(index=True)
    created_at: datetime
    metadata: dict = Field(sa_column=Column(JSON))

class ChatKitItem(SQLModel, table=True):
    __tablename__ = "chatkit_items"
    id: str = Field(primary_key=True)
    thread_id: str = Field(foreign_key="chatkit_threads.id", index=True)
    type: str
    content: dict = Field(sa_column=Column(JSON))
    created_at: datetime
```

## 2. Alembic Migration, PostgresStore, Tests...

## Response snapshot

Created comprehensive implementation plan for chat persistence:

**Artifacts generated:**
1. `plan.md` - Full implementation plan with:
   - Technical context (Python 3.12, SQLModel, asyncpg)
   - Constitution check (all gates passed)
   - Component changes (models, store, migration, tests)
   - Verification plan (unit tests, integration tests, manual)

2. `data-model.md` - Database schema documentation:
   - ER diagram with User, Thread, Item relationships
   - Table definitions with column specs
   - SQLModel class definitions
   - Validation rules

3. `quickstart.md` - Step-by-step setup guide:
   - Create models
   - Run migration
   - Implement PostgresStore
   - Run tests
   - Verification checklist

**Key findings from analysis:**
- InMemoryStore exists at `src/chat/store.py` - needs PostgresStore added
- Existing test files: test_chat.py, test_chat_tools.py have good patterns
- Alembic is configured with 2 existing migrations

## Outcome

- ✅ Impact: Complete planning artifacts ready for /sp.tasks
- 🧪 Tests: Existing tests analyzed, new tests planned
- 📁 Files: plan.md, data-model.md, quickstart.md
- 🔁 Next prompts: /sp.tasks to generate implementation tasks
- 🧠 Reflection: Leveraged existing code structure and test patterns

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully
- Graders run and results (PASS/FAIL): Manual review PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
