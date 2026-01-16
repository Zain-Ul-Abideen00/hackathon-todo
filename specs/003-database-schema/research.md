# Research: Database Schema for Todo App (Module 2)

**Created**: 2026-01-08
**Feature**: 003-database-schema

## Decisions

### 1. Database Provider: Neon PostgreSQL

**Decision**: Use Neon PostgreSQL (free tier, already configured)

**Rationale**:
- User already has DATABASE_URL configured in `backend/.env`
- Neon provides serverless PostgreSQL with connection pooling
- Native support for `asyncpg` driver
- Free tier sufficient for development

**Alternatives Considered**:
- Supabase PostgreSQL - also viable, but user specified Neon
- Local PostgreSQL - requires additional setup, not serverless

---

### 2. User ID Type: String (Better Auth)

**Decision**: `user_id` field uses `str` type, not UUID or integer

**Rationale**:
- Better Auth generates string-based user IDs (nanoid format)
- No foreign key constraint to user table (managed by Better Auth)
- Index on `user_id` for efficient filtering

**Alternatives Considered**:
- UUID type - Better Auth doesn't use standard UUID format
- Integer type - would require mapping layer

---

### 3. Async Driver: asyncpg

**Decision**: Use `asyncpg` for async PostgreSQL operations

**Rationale**:
- Constitution mandates async-first design
- Already listed in `pyproject.toml` dependencies
- Best performance for async Python + PostgreSQL

**Alternatives Considered**:
- psycopg3 async - newer but asyncpg more mature
- Sync psycopg2 - violates async-first constitution

---

### 4. Connection Pooling Strategy

**Decision**: `pool_pre_ping=True` with 5 pool size, 10 max overflow

**Rationale**:
- `pool_pre_ping` essential for serverless databases like Neon
- Prevents stale connection errors after idle periods
- Constitution requires connection pooling for production

**Code Pattern**:
```python
engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,
)
```

---

### 5. Timestamp Strategy

**Decision**: Use `datetime.utcnow()` with Python defaults

**Rationale**:
- Constitution mandates UTC for all datetime fields
- SQLModel Field with default_factory handles creation
- Manual update in service layer for `updated_at`

**Note**: Considered database-level `DEFAULT NOW()` but Python-managed timestamps are more testable.

---

### 6. Index Strategy

**Decision**: Create indexes on `user_id` and `completed`

**Rationale**:
- FR-008: Index on `user_id` for user filtering (every query)
- FR-009: Index on `completed` for status filtering
- No composite index needed initially (can add later)

**SQL Generated**:
```sql
CREATE INDEX ix_task_user_id ON task (user_id);
CREATE INDEX ix_task_completed ON task (completed);
```

---

### 7. Alembic Async Configuration

**Decision**: Use `alembic init -t async alembic` with custom env.py

**Rationale**:
- Built-in async template handles asyncpg driver
- Import all SQLModel models for autogenerate detection
- Load DATABASE_URL from environment, not alembic.ini

---

## Research Sources

- Skill: `building-with-sqlmodel-async` - Async patterns, engine setup
- Agent: `database-architect` - Schema design, index strategy
- Agent: `postgres-pro` - PostgreSQL optimization, connection pooling
- Constitution: Database Architecture principles
