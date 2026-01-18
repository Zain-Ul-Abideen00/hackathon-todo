# Tasks: Authentication with Better Auth + JWT (Module 4)

**Branch**: `005-jwt-auth` | **Date**: 2026-01-10
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

---

## Agent & Skill References

> **Use these references when implementing tasks:**

| Agent/Skill | Purpose |
|-------------|---------|
| `@better-auth-expert` | All authentication architecture decisions |
| `@backend-security-coder` | JWT verification patterns and security |
| `configuring-better-auth/SKILL.md` | Better Auth setup and configuration |
| `fastapi-jwt-integration.md` | Pattern A (HS256) implementation |
| `better-auth` MCP server | Guided configuration and troubleshooting |

---

## Phase 1: Setup

> **Goal**: Install dependencies and configure environment variables

- [x] T001 Install frontend auth dependencies: `pnpm add better-auth jose` in `todo-web-app/frontend/`
- [x] T002 Install backend auth dependency: `uv add "python-jose[cryptography]"` in `todo-web-app/backend/`
- [x] T003 Add `BETTER_AUTH_SECRET` to `todo-web-app/frontend/.env.local`
- [x] T004 Add `NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000` to `todo-web-app/frontend/.env.local`
- [x] T005 Add `BETTER_AUTH_SECRET` to `todo-web-app/backend/.env` (must match frontend)

---

## Phase 2: Foundational - Backend JWT Middleware

> **Goal**: Create stateless JWT verification for all protected routes
> **Agent Reference**: `@backend-security-coder` for JWT patterns
> **Skill Reference**: `fastapi-jwt-integration.md` Pattern A (HS256)

- [x] T006 Create auth module init file at `backend/src/auth/__init__.py`
- [x] T007 [P] Implement JWT verification function in `backend/src/auth/jwt.py` using python-jose HS256
- [x] T008 [P] Create `get_current_user` dependency in `backend/src/auth/dependencies.py`
- [x] T009 [P] Create `validate_user_access` dependency for user_id matching in `backend/src/auth/dependencies.py`
- [x] T010 Export auth dependencies from `backend/src/api/deps.py`
- [x] T011 Write JWT verification tests in `backend/tests/test_auth.py`

**Tests (T011)**:
- `test_verify_valid_token`: Valid JWT returns payload
- `test_verify_expired_token`: Returns 401
- `test_verify_invalid_signature`: Wrong secret returns 401
- `test_verify_missing_token`: No header returns 401
- `test_user_id_mismatch_returns_403`: Wrong user_id returns 403

---

## Phase 3: User Story 1 - User Sign Up (P1)

> **Goal**: Visitors can register with email and password
> **Agent Reference**: `@better-auth-expert` for auth setup
> **Skill Reference**: `configuring-better-auth/SKILL.md`
> **Independent Test**: Complete registration form, verify can sign in afterward

- [x] T012 [US1] Create Better Auth server config in `frontend/src/lib/auth.ts` with HS256 JWT signing
- [x] T013 [US1] Create auth client hooks in `frontend/src/lib/auth-client.ts`
- [x] T014 [US1] Create API route handler at `frontend/src/app/api/auth/[...all]/route.ts`
- [x] T015 [P] [US1] Create SignUpForm component in `frontend/src/components/auth/SignUpForm.tsx`
- [x] T016 [US1] Create sign-up page at `frontend/src/app/auth/signup/page.tsx`
- [x] T017 [US1] Verify sign-up flow: create account, check session cookie exists

**Acceptance Criteria**:
- Valid email + password (8+ chars) creates account
- Duplicate email shows "Email already registered"
- Weak password shows validation error
- Invalid email format shows validation error

---

## Phase 4: User Story 2 - User Sign In (P1)

> **Goal**: Users can sign in and receive JWT for API access
> **Independent Test**: Sign in with valid credentials, verify JWT in cookie

- [x] T018 [P] [US2] Create SignInForm component in `frontend/src/components/auth/SignInForm.tsx`
- [x] T019 [US2] Create sign-in page at `frontend/src/app/auth/signin/page.tsx`
- [x] T020 [US2] Add session provider to `frontend/src/app/layout.tsx`
- [x] T021 [US2] Verify sign-in flow: sign in, check JWT issued, access protected route

**Acceptance Criteria**:
- Correct credentials return JWT in HTTP-only cookie
- Wrong password shows "Invalid email or password"
- Non-existent email shows same error (security)

---

## Phase 5: User Story 3 - Session Persistence (P2)

> **Goal**: Sessions persist across browser refreshes for 7 days
> **Depends on**: US1, US2
> **Independent Test**: Sign in, refresh browser, verify still authenticated

- [x] T022 [US3] Verify session persistence: sign in, refresh page, check still authenticated
- [x] T023 [US3] Verify session expiry config in `frontend/src/lib/auth.ts` is 7 days

**Acceptance Criteria**:
- Refresh browser maintains sign-in state
- Close/reopen browser within 7 days keeps session
- Session older than 7 days redirects to sign-in

---

## Phase 6: User Story 4 - User Sign Out (P2)

> **Goal**: Users can sign out and clear all credentials
> **Depends on**: US2
> **Independent Test**: Sign in, sign out, verify cannot access protected pages

- [x] T024 [P] [US4] Create UserButton component with logout in `frontend/src/components/auth/UserButton.tsx`
- [x] T025 [US4] Add sign-out route at `frontend/src/app/auth/signout/page.tsx` (optional redirect page)
- [x] T026 [US4] Verify sign-out flow: sign out, check cookies cleared, redirect to home

**Acceptance Criteria**:
- Sign out clears session cookie
- After sign out, protected pages redirect to sign-in
- Session cookie removed from browser

---

## Phase 7: User Story 5 - Backend JWT Verification (P1)

> **Goal**: Backend verifies JWT tokens statelessly on all protected routes
> **Agent Reference**: `@backend-security-coder`
> **Note**: Core middleware created in Phase 2; this phase integrates with existing Task API

- [x] T027 [US5] Apply auth dependency to task routes in `backend/src/api/routes/tasks.py`
- [x] T028 [US5] Verify protected API: request without token returns 401
- [x] T029 [US5] Verify user isolation: request with wrong user_id returns 403
- [x] T030 [US5] Run full backend auth test suite: `uv run pytest tests/test_auth.py -v`

**Acceptance Criteria**:
- Valid JWT allows API access with user context
- Expired/invalid/missing JWT returns 401
- URL user_id mismatch returns 403

---

## Phase 8: Polish & Integration

> **Goal**: End-to-end verification and documentation

- [x] T031 Run E2E test: sign-up → sign-in → create task → sign-out
- [x] T032 Update `frontend/README.md` with auth setup instructions
- [x] T033 Update `backend/README.md` with JWT verification documentation
- [x] T034 Verify CORS configuration allows only frontend domain

---

## Dependency Graph

```text
Phase 1 (Setup)
    ↓
Phase 2 (JWT Middleware) ←── US5 Backend Integration
    ↓
Phase 3 (US1: Sign Up) ──→ Phase 4 (US2: Sign In)
                                ↓
                    ┌───────────┴───────────┐
                    ↓                       ↓
            Phase 5 (US3: Session)   Phase 6 (US4: Sign Out)
                    ↓                       ↓
                    └───────────┬───────────┘
                                ↓
                    Phase 7 (US5: Backend Integration)
                                ↓
                    Phase 8 (Polish & Integration)
```

---

## Parallel Execution Opportunities

| Phase | Parallelizable Tasks |
|-------|---------------------|
| Phase 2 | T007, T008, T009 (different files) |
| Phase 3 | T015 (SignUpForm) with T012-T014 |
| Phase 4 | T018 (SignInForm) runs parallel to backend work |
| Phase 6 | T024 (UserButton) independent component |

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 34 |
| Setup Tasks | 5 |
| User Story Tasks | 23 |
| Polish Tasks | 4 |
| Test Tasks | 2 (T011, T030) |
| MVP Scope | US1 + US2 + US5 (Sign Up, Sign In, Backend) |

---

## Execution Commands

```bash
# Frontend development
cd todo-web-app/frontend
pnpm dev

# Backend development
cd todo-web-app/backend
uv run uvicorn src.main:app --reload

# Run backend auth tests
cd todo-web-app/backend
uv run pytest tests/test_auth.py -v

# E2E test (after Playwright setup)
cd todo-web-app/frontend
pnpm exec playwright test e2e/auth.spec.ts
```
