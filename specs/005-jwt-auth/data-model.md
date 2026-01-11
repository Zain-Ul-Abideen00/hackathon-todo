# Data Model: Authentication Entities

**Feature**: 005-jwt-auth | **Date**: 2026-01-10

## Entities

> **Note**: Better Auth manages these tables automatically. No Alembic migrations needed for auth tables.

### User

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, auto-generated | Unique user identifier |
| email | string | UNIQUE, NOT NULL | User's email address |
| name | string | nullable | Display name |
| emailVerified | boolean | default: false | Email verification status |
| image | string | nullable | Profile image URL |
| createdAt | datetime | NOT NULL, UTC | Account creation timestamp |
| updatedAt | datetime | NOT NULL, UTC | Last update timestamp |

### Session

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK | Session identifier |
| userId | string | FK → User.id | Associated user |
| token | string | NOT NULL | Session token (hashed) |
| expiresAt | datetime | NOT NULL | Session expiration |
| ipAddress | string | nullable | Client IP address |
| userAgent | string | nullable | Browser user agent |
| createdAt | datetime | NOT NULL | Session start |
| updatedAt | datetime | NOT NULL | Last activity |

### Account

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK | Account identifier |
| userId | string | FK → User.id | Associated user |
| providerId | string | NOT NULL | e.g., "email" |
| accountId | string | NOT NULL | Provider-specific ID |
| password | string | nullable | Hashed password (email provider) |
| createdAt | datetime | NOT NULL | Account creation |
| updatedAt | datetime | NOT NULL | Last update |

## Relationships

```
User (1) ←──→ (N) Session
User (1) ←──→ (N) Account
```

## JWT Payload Structure

The JWT issued by Better Auth contains:

```json
{
  "sub": "user_id_here",
  "email": "user@example.com",
  "iat": 1736520000,
  "exp": 1737124800
}
```

| Claim | Description |
|-------|-------------|
| `sub` | User ID (primary identifier for API calls) |
| `email` | User's email address |
| `iat` | Issued at timestamp |
| `exp` | Expiration timestamp (7 days from issue) |

## Integration with Task Model

The existing `Task` model (from Module 2) uses `user_id: str` as a foreign key reference:

```python
# backend/src/models/task.py
class Task(SQLModel, table=True):
    user_id: str = Field(..., index=True)  # Links to Better Auth User.id
```

This `user_id` is extracted from the JWT `sub` claim by the auth middleware.
