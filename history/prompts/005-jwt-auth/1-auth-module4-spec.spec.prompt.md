---
id: 1
title: "Authentication Module 4 Specification"
stage: spec
date: 2026-01-10
surface: agent
model: gemini-2.5-pro
feature: 005-jwt-auth
branch: 005-jwt-auth
user: system
command: /sp-specify
labels: ["authentication", "better-auth", "jwt", "module-4"]
links:
  spec: specs/005-jwt-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-jwt-auth/spec.md
  - specs/005-jwt-auth/checklists/requirements.md
tests: []
---

# PHR: Authentication Module 4 Specification

## Prompt

Feature: Authentication with Better Auth + JWT (Module 4)

Use the better-auth-expert agent and configuring-better-auth, auth-implementation-patterns skills.

User Stories:
1. As a visitor, I can sign up with email and password.
2. As a user, I can sign in and receive a JWT token.
3. As a user, my session persists across browser refreshes.
4. As a user, I can sign out.
5. As a developer, the backend verifies JWT tokens stateless-ly.

Frontend (Better Auth):
1. Sign Up: Email + Password registration
2. Sign In: Email + Password login
3. Sign Out: Clear session and token
4. Session persistence via HTTP-only cookies
5. JWT token issuance for API calls

Backend (JWT Verification):
1. Middleware to extract JWT from Authorization: Bearer header
2. Verify JWT signature using shared BETTER_AUTH_SECRET (HS256)
3. Decode user_id from token payload
4. Inject current_user into route dependencies
5. Validate URL user_id matches JWT user_id

Integration Pattern (Shared Secret - Pattern A):
- BETTER_AUTH_SECRET environment variable in BOTH services
- Frontend signs JWT with HS256 using jose library
- Backend verifies with python-jose[cryptography] library
- No network calls needed for verification

Security Requirements:
- HTTP-only cookies for session storage
- JWT expiry: 7 days
- CORS restricted to frontend domain
- Input validation on all endpoints

Acceptance Criteria:
- Sign up creates new user
- Sign in returns valid JWT
- Protected API calls work with JWT
- Invalid/missing JWT returns 401
- Wrong user_id returns 403
- Sign out clears session

## Response

Created comprehensive specification for Module 4: Authentication with Better Auth + JWT.

**Branch**: `005-jwt-auth`

**Artifacts Created**:
- `specs/005-jwt-auth/spec.md` - Full specification with 5 user stories, 18 functional requirements, 6 security requirements
- `specs/005-jwt-auth/checklists/requirements.md` - Quality validation checklist (all items passed)

**Key Decisions**:
- Using Shared Secret Pattern A (HS256) for stateless JWT verification
- Better Auth on frontend with jose library for JWT signing
- python-jose[cryptography] on backend for verification
- HTTP-only cookies for session storage
- 7-day JWT expiry

**Next Steps**: Run `/sp.plan` to create implementation plan.

## Outcome

SUCCESS - Specification ready for planning phase.
