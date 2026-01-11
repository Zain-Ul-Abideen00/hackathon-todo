# Feature Specification: Authentication with Better Auth + JWT (Module 4)

**Feature Branch**: `005-jwt-auth`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "Authentication with Better Auth + JWT using Shared Secret Pattern A"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Sign Up (Priority: P1)

As a visitor, I can sign up with email and password to create a new account.

**Why this priority**: Account creation is the gateway to all other features. Without registration, users cannot access any protected functionality.

**Independent Test**: Can be fully tested by completing the registration form and verifying the user can subsequently sign in. Delivers core value of user identity management.

**Acceptance Scenarios**:

1. **Given** I am on the sign-up page, **When** I enter a valid email and password (min 8 characters), **Then** my account is created and I am signed in automatically.
2. **Given** I am on the sign-up page, **When** I enter an email that already exists, **Then** I see an error message "Email already registered".
3. **Given** I am on the sign-up page, **When** I enter a weak password (less than 8 characters), **Then** I see a validation error for password requirements.
4. **Given** I am on the sign-up page, **When** I enter an invalid email format, **Then** I see a validation error for email format.

---

### User Story 2 - User Sign In (Priority: P1)

As a user, I can sign in with email and password and receive a JWT token for API access.

**Why this priority**: Authentication is required before any protected resources can be accessed. This enables the core user experience.

**Independent Test**: Can be tested by signing in with valid credentials and verifying a valid JWT is issued and stored in HTTP-only cookie.

**Acceptance Scenarios**:

1. **Given** I have a registered account, **When** I sign in with correct credentials, **Then** I receive a valid JWT token and session is established via HTTP-only cookie.
2. **Given** I have a registered account, **When** I sign in with incorrect password, **Then** I see an error "Invalid email or password".
3. **Given** I try to sign in with a non-existent email, **When** I submit the form, **Then** I see an error "Invalid email or password" (same message for security).

---

### User Story 3 - Session Persistence (Priority: P2)

As a user, my session persists across browser refreshes so I don't have to sign in repeatedly.

**Why this priority**: Session persistence is critical for user convenience but depends on sign-in functionality being complete first.

**Independent Test**: Sign in, close browser tab, reopen the application, and verify user remains authenticated.

**Acceptance Scenarios**:

1. **Given** I am signed in, **When** I refresh the browser, **Then** I remain signed in and can access protected pages.
2. **Given** I am signed in, **When** I close and reopen the browser within 7 days, **Then** my session is still valid.
3. **Given** my session is older than 7 days, **When** I try to access a protected page, **Then** I am redirected to sign in.

---

### User Story 4 - User Sign Out (Priority: P2)

As a user, I can sign out to end my session and clear all credentials.

**Why this priority**: Sign-out completes the authentication lifecycle and is essential for shared devices and security.

**Independent Test**: Sign in, click sign out, and verify session is cleared and user cannot access protected resources.

**Acceptance Scenarios**:

1. **Given** I am signed in, **When** I click sign out, **Then** my session is cleared and I am redirected to the home page.
2. **Given** I have signed out, **When** I try to access a protected page, **Then** I am redirected to sign in.
3. **Given** I have signed out, **When** I check browser cookies, **Then** the session cookie is removed.

---

### User Story 5 - Backend JWT Verification (Priority: P1)

As a developer, the backend verifies JWT tokens statelessly so protected API endpoints are secure.

**Why this priority**: Backend security is critical for data protection. All task API endpoints depend on this.

**Independent Test**: Make API calls with valid/invalid/missing tokens and verify correct 401/403 responses.

**Acceptance Scenarios**:

1. **Given** a valid JWT in the Authorization header, **When** I call a protected API endpoint, **Then** the request succeeds with user context.
2. **Given** an expired JWT token, **When** I call a protected API endpoint, **Then** I receive a 401 Unauthorized response.
3. **Given** a malformed or invalid JWT, **When** I call a protected API endpoint, **Then** I receive a 401 Unauthorized response.
4. **Given** no Authorization header, **When** I call a protected API endpoint, **Then** I receive a 401 Unauthorized response.
5. **Given** a valid JWT but URL contains a different user_id, **When** I call `/users/{other_user_id}/tasks`, **Then** I receive a 403 Forbidden response.

---

### Edge Cases

- What happens when JWT secret is not configured? → Application fails to start with clear error message.
- What happens during network failure on sign-in? → User sees "Connection error, please try again" message.
- What happens when session cookie is tampered with? → Session is invalidated and user must re-authenticate.
- What happens if user is deleted while session is active? → Next protected request returns 401 and clears session.

## Requirements *(mandatory)*

### Functional Requirements

#### Frontend (Better Auth)

- **FR-001**: System MUST provide sign-up form with email and password validation
- **FR-002**: System MUST provide sign-in form with email and password
- **FR-003**: System MUST store session tokens in HTTP-only cookies (not localStorage)
- **FR-004**: System MUST issue JWT tokens for API calls using HS256 algorithm
- **FR-005**: System MUST sign JWTs using the shared BETTER_AUTH_SECRET
- **FR-006**: System MUST provide sign-out functionality that clears session and cookies
- **FR-007**: System MUST persist sessions across browser refreshes for 7 days

#### Backend (FastAPI JWT Verification)

- **FR-008**: System MUST provide middleware to extract JWT from `Authorization: Bearer` header
- **FR-009**: System MUST verify JWT signature using BETTER_AUTH_SECRET with HS256 algorithm
- **FR-010**: System MUST decode and validate user_id from JWT payload
- **FR-011**: System MUST inject current_user into route dependencies
- **FR-012**: System MUST validate that URL user_id matches JWT user_id for user-specific routes
- **FR-013**: System MUST return 401 Unauthorized for missing, expired, or invalid tokens
- **FR-014**: System MUST return 403 Forbidden when user_id mismatch occurs

#### Integration (Shared Secret Pattern A)

- **FR-015**: Both frontend and backend MUST use the same BETTER_AUTH_SECRET environment variable
- **FR-016**: Frontend MUST use jose library for JWT signing with HS256
- **FR-017**: Backend MUST use python-jose[cryptography] for JWT verification
- **FR-018**: JWT verification MUST be stateless (no database lookups required)

### Security Requirements

- **SR-001**: Session tokens MUST be stored in HTTP-only cookies (prevents XSS)
- **SR-002**: JWTs MUST expire after 7 days
- **SR-003**: CORS MUST be restricted to frontend domain only
- **SR-004**: All authentication endpoints MUST validate and sanitize input
- **SR-005**: Password MUST be hashed before storage (handled by Better Auth)
- **SR-006**: BETTER_AUTH_SECRET MUST be at least 32 characters

### Key Entities

- **User**: Represents an authenticated user with id, email, name, emailVerified, image, createdAt, updatedAt
- **Session**: Represents an active user session with id, userId, expiresAt, token, createdAt, updatedAt
- **Account**: Links user to authentication provider (email/password in this case)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete sign-up process in under 30 seconds
- **SC-002**: Users can complete sign-in process in under 10 seconds
- **SC-003**: 100% of protected API calls with invalid tokens return appropriate error responses
- **SC-004**: Session persists correctly for at least 7 days without requiring re-authentication
- **SC-005**: JWT verification adds less than 5ms overhead to API requests (stateless verification)
- **SC-006**: Zero session data stored in browser localStorage (all in HTTP-only cookies)

## Assumptions

1. **Database Schema**: Better Auth will manage its own user and session tables in the PostgreSQL database
2. **Password Policy**: Minimum 8 characters (Better Auth default)
3. **Token Refresh**: Session/cookie-based refresh handled by Better Auth (no explicit refresh token endpoint needed for MVP)
4. **Email Verification**: Not required for initial sign-up (can be added later)
5. **Rate Limiting**: Will be handled at infrastructure level or in a future module
6. **Frontend Routes**: `/auth/signin`, `/auth/signup`, `/auth/signout` for authentication pages
