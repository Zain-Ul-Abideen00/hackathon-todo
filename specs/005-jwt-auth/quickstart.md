# Quickstart: Authentication Setup

**Feature**: 005-jwt-auth | **Date**: 2026-01-10

## Prerequisites

- Node.js 20+ and pnpm installed
- Python 3.12+ and uv installed
- Frontend and backend from Module 2-3 running
- Neon PostgreSQL database configured

## Step 1: Generate Shared Secret

```bash
# Generate a secure 32+ character secret
openssl rand -base64 32
# Example output: K7xP2mNqR9sT4uV6wY8zA1bC3dE5fG7h
```

Save this value - you'll need it for both frontend and backend.

## Step 2: Frontend Setup

### Install Dependencies

```bash
cd todo-web-app/frontend
pnpm add better-auth jose
```

### Configure Environment

```bash
# .env.local
BETTER_AUTH_SECRET=your-generated-secret-here
BETTER_AUTH_URL=http://localhost:3000
```

### Create Auth Configuration

Create `src/lib/auth.ts`:

```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";
import { SignJWT } from "jose";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true },
  plugins: [
    jwt({
      jwt: {
        sign: async (payload) => {
          const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET);
          return await new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(secret);
        }
      }
    })
  ]
});
```

### Create API Route Handler

Create `src/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

## Step 3: Backend Setup

### Install Dependencies

```bash
cd todo-web-app/backend
uv add "python-jose[cryptography]"
```

### Configure Environment

```bash
# .env
BETTER_AUTH_SECRET=your-generated-secret-here
```

### Create JWT Module

Create `src/auth/__init__.py`:

```python
from .jwt import verify_token
from .dependencies import get_current_user, validate_user_access

__all__ = ["verify_token", "get_current_user", "validate_user_access"]
```

Create `src/auth/jwt.py` and `src/auth/dependencies.py` as per plan.md.

## Step 4: Verify Setup

### Test Backend JWT Verification

```bash
cd todo-web-app/backend
uv run pytest tests/test_auth.py -v
```

### Test Frontend Auth Flow

```bash
cd todo-web-app/frontend
pnpm dev
```

1. Navigate to `http://localhost:3000/auth/signup`
2. Create account with email/password
3. Verify redirect to dashboard
4. Check browser cookies for session token

### Test Full Integration

```bash
# Get JWT from authenticated session
# Call protected API endpoint
curl -H "Authorization: Bearer YOUR_JWT" \
  http://localhost:8000/api/v1/users/USER_ID/tasks
```

## Common Issues

| Issue | Solution |
|-------|----------|
| "Invalid credentials" on API | Ensure BETTER_AUTH_SECRET matches in both services |
| Session not persisting | Check BETTER_AUTH_URL matches actual frontend URL |
| CORS errors | Verify backend CORS_ORIGINS includes frontend URL |
