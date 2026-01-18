# Implementation Plan: Authentication with Better Auth + JWT (Module 4)

**Branch**: `005-jwt-auth` | **Date**: 2026-01-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-jwt-auth/spec.md`

## Summary

Implement user authentication using Better Auth on the Next.js frontend with JWT tokens for stateless API authorization on the FastAPI backend. Uses **Shared Secret Pattern A (HS256)** for simple, fast token verification without network calls.

## Technical Context

**Language/Version**: TypeScript 5.x (Frontend), Python 3.12+ (Backend)
**Primary Dependencies**:
- Frontend: better-auth, jose, react-hook-form, zod
- Backend: python-jose[cryptography], fastapi
**Storage**: Neon PostgreSQL (user/session tables managed by Better Auth)
**Testing**: Vitest (Frontend), pytest-asyncio (Backend), Playwright (E2E)
**Target Platform**: Web (Vercel + Railway/Render)
**Project Type**: Web application (frontend + backend monorepo)
**Performance Goals**: JWT verification < 5ms, Sign-in < 10s user experience
**Constraints**: HTTP-only cookies, 7-day JWT expiry, CORS restricted
**Scale/Scope**: Single-tenant, user isolation at API level

## Constitution Check

*GATE: All checks passed*

| Principle | Status | Notes |
|-----------|--------|-------|
| IV. Authentication | ✅ PASS | Using Better Auth + JWT as specified |
| V. Security First | ✅ PASS | HTTP-only cookies, input validation |
| VI. TDD | ✅ PASS | Tests defined in verification plan |
| VII. Type Safety | ✅ PASS | Pydantic + Zod validation |
| XII. Agentic Development | ✅ PASS | Using better-auth-expert, backend-security-coder |

## Project Structure

### Documentation (this feature)

```text
specs/005-jwt-auth/
├── plan.md              # This file
├── research.md          # Pattern decision rationale
├── data-model.md        # User/Session entities
├── quickstart.md        # Setup guide
├── contracts/           # API schemas
│   └── auth-api.yaml    # OpenAPI for auth endpoints
└── tasks.md             # Task breakdown (created by /sp.tasks)
```

### Source Code (repository root)

```text
todo-web-app/
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── auth.ts              # [NEW] Better Auth config
│   │   │   └── auth-client.ts       # [NEW] Client-side auth hooks
│   │   ├── app/
│   │   │   ├── api/auth/[...all]/
│   │   │   │   └── route.ts         # [NEW] Better Auth API handler
│   │   │   ├── auth/
│   │   │   │   ├── signin/page.tsx  # [NEW] Sign-in page
│   │   │   │   └── signup/page.tsx  # [NEW] Sign-up page
│   │   │   └── layout.tsx           # [MODIFY] Add SessionProvider
│   │   └── components/
│   │       └── auth/
│   │           ├── SignInForm.tsx   # [NEW] Login form
│   │           ├── SignUpForm.tsx   # [NEW] Registration form
│   │           └── UserButton.tsx   # [NEW] Auth status/logout
│   └── tests/
│       └── auth/                    # [NEW] Auth unit tests
│
└── backend/
    ├── src/
    │   ├── auth/
    │   │   ├── __init__.py          # [NEW] Auth module
    │   │   ├── jwt.py               # [NEW] JWT verification
    │   │   └── dependencies.py      # [NEW] get_current_user
    │   └── api/
    │       └── deps.py              # [MODIFY] Add auth dependency
    └── tests/
        └── test_auth.py             # [NEW] Auth middleware tests
```

**Structure Decision**: Uses existing monorepo structure from Module 2-3. Auth code added as new `auth/` directories in both frontend and backend.

---

## Proposed Changes

### Frontend - Better Auth Setup

#### [NEW] frontend/src/lib/auth.ts

Better Auth server configuration with JWT plugin using HS256 shared secret:

```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";
import { SignJWT } from "jose";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,     // Refresh daily
  },
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

#### [NEW] frontend/src/lib/auth-client.ts

Client-side auth hooks for React components.

#### [NEW] frontend/src/app/api/auth/[...all]/route.ts

Better Auth API handler for all `/api/auth/*` routes.

#### [NEW] frontend/src/app/auth/signin/page.tsx & signup/page.tsx

Sign-in and sign-up pages with forms.

#### [NEW] frontend/src/components/auth/*.tsx

- `SignInForm.tsx`: Email/password login with validation
- `SignUpForm.tsx`: Registration with password requirements
- `UserButton.tsx`: Shows auth status, logout button

---

### Backend - JWT Middleware

#### [NEW] backend/src/auth/jwt.py

JWT verification using python-jose with shared secret:

```python
import os
from jose import jwt, JWTError
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("sub"):
            raise HTTPException(status_code=401, detail="Token missing subject")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
```

#### [NEW] backend/src/auth/dependencies.py

FastAPI dependencies for protected routes:

```python
from fastapi import Depends, HTTPException
from .jwt import verify_token

def get_current_user(payload: dict = Depends(verify_token)) -> dict:
    return {"id": payload["sub"], "email": payload.get("email")}

def validate_user_access(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["id"] != user_id:
        raise HTTPException(status_code=403, detail="Access forbidden")
    return current_user
```

#### [MODIFY] backend/src/api/deps.py

Import and expose auth dependencies for task routes.

---

## Verification Plan

### Automated Tests

#### Backend Tests (pytest)

**File**: `backend/tests/test_auth.py`

```bash
cd todo-web-app/backend
uv run pytest tests/test_auth.py -v
```

Test cases:
1. `test_verify_valid_token`: Valid JWT returns user payload
2. `test_verify_expired_token`: Expired JWT returns 401
3. `test_verify_invalid_signature`: Wrong secret returns 401
4. `test_verify_missing_token`: No header returns 401
5. `test_user_id_mismatch_returns_403`: Wrong user_id returns 403

#### Frontend Tests (Vitest)

**File**: `frontend/tests/auth/auth.test.ts`

```bash
cd todo-web-app/frontend
pnpm test -- --run tests/auth/
```

Test cases:
1. `test_signin_form_validation`: Invalid email shows error
2. `test_signup_password_requirements`: Weak password rejected

### E2E Browser Tests (Playwright)

**File**: `frontend/e2e/auth.spec.ts`

```bash
cd todo-web-app/frontend
pnpm exec playwright test e2e/auth.spec.ts
```

Test cases:
1. Full sign-up → sign-in → create task → sign-out flow
2. Protected route redirects to sign-in when not authenticated

### Manual Verification

1. **Sign Up Flow**:
   - Navigate to `http://localhost:3000/auth/signup`
   - Enter email: `test@example.com`, password: `TestPass123!`
   - Verify account created and redirected to dashboard

2. **Sign In Flow**:
   - Navigate to `http://localhost:3000/auth/signin`
   - Enter same credentials
   - Verify signed in and can access tasks

3. **API Authorization** (using curl):
   ```bash
   # Get JWT from browser DevTools (Application > Cookies)
   curl -H "Authorization: Bearer <JWT>" http://localhost:8000/api/v1/users/<user_id>/tasks
   # Should return tasks

   curl http://localhost:8000/api/v1/users/<user_id>/tasks
   # Should return 401
   ```

4. **Sign Out**:
   - Click sign out button
   - Verify redirected and cannot access protected pages

---

## Dependencies

### Frontend (package.json additions)

```json
{
  "dependencies": {
    "better-auth": "^1.x",
    "jose": "^5.x"
  }
}
```

**Install**: `pnpm add better-auth jose`

### Backend (pyproject.toml additions)

```toml
[project.dependencies]
python-jose = { extras = ["cryptography"], version = ">=3.3.0" }
```

**Install**: `uv add "python-jose[cryptography]"`

---

## Environment Variables

### Frontend (.env.local)

```bash
BETTER_AUTH_SECRET=your-shared-secret-min-32-characters
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

### Backend (.env)

```bash
BETTER_AUTH_SECRET=your-shared-secret-min-32-characters
```

> [!IMPORTANT]
> Both services MUST use the exact same `BETTER_AUTH_SECRET` value for JWT verification to work.

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| JWT secret exposure | Store in env vars, never commit |
| Token theft via XSS | HTTP-only cookies, no localStorage |
| CORS misconfiguration | Explicit origin allowlist |
| Expired token handling | Frontend intercepts 401, redirects to login |

---

## Complexity Tracking

No constitution violations. All changes follow established patterns.
