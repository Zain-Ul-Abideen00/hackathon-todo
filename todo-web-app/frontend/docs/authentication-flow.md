# Authentication Flow Explanation

## Overview

The authentication system is a hybrid approach using **Better Auth** for session management and signup/login, and **JWT** for securing the FastAPI backend.

- **Frontend (Next.js)**: Uses `better-auth` for user interface and session management.
- **Backend (FastAPI)**: Verifies JWT tokens signed by Better Auth to protect API endpoints.
- **Database (PostgreSQL)**: Shared source of truth for user data.

## Detailed Flow

### 1. User Signup (Frontend)

1.  **User Interaction**: User fills out the `SignUpForm` at `/auth/signup`.
2.  **Client-Side Call**: The form calls `signUp.email()` from `frontend/src/lib/auth-client.ts`.
3.  **API Request**: This sends a `POST` request to `http://localhost:3000/api/auth/sign-up/email`.
4.  **Next.js Route Handler**: The request is handled by `frontend/src/app/api/auth/[...all]/route.ts`.
5.  **Database Operation**:
    -   Better Auth (running in Next.js) connects to the PostgreSQL database using the `pool` defined in `frontend/src/lib/auth.ts`.
    -   It creates a new row in the `user` table.
    -   It creates a new row in the `account` table.
    -   It creates a session in the `session` table.
6.  **Response**: Returns the session object to the client.
7.  **Redirection**: Client redirects to `/dashboard`.

### 2. Protected API Calls (Backend Access)

When the frontend needs to fetch data (e.g., Tasks) from the FastAPI backend:

1.  **Token Retrieval**: The frontend extracts the current session token (JWT).
2.  **Request**: Sends a request to FastAPI (e.g., `GET /tasks`) with `Authorization: Bearer <token>`.
3.  **Backend Verification** (`backend/src/auth/jwt.py`):
    -   FastAPI receives the request.
    -   It uses the shared `BETTER_AUTH_SECRET` to verify the token signature.
    -   **Important**: This verification happens locally on the backend without calling the database or the frontend server.
4.  **User Context** (`backend/src/auth/dependencies.py`):
    -   If valid, extracts the `sub` (User ID) from the token.
    -   Does NOT necessarily query the user table again (stateless verification for performance), unless the route specifically requests fresh user data.
5.  **Execution**: The endpoint executes (e.g., fetching tasks for that `user_id`).

## Debugging "Cannot Signup"

If signup is failing, check the following in order:

1.  **Environment Variables**:
    -   Ensure `BETTER_AUTH_SECRET` is set and **identical** in both Frontend and Backend `.env` files.
    -   Ensure `DATABASE_URL` is set in Frontend `.env` (it needs direct DB access).
    -   Ensure `BETTER_AUTH_URL` is set to your frontend URL (e.g., `http://localhost:3000`).

2.  **Database Migration**:
    -   Better Auth needs specific tables (`user`, `session`, `account`, `verification`).
    -   Since you are using `pg` driver, you might need to run the Better Auth migration CLI manually if it wasn't done automatically.
    -   Command: `npx @better-auth/cli migrate` (run this in `frontend/` directory).

3.  **Console Errors**:
    -   Check the browser console (F12) for network errors (404/500 on `/api/auth/...`).
    -   Check the terminal where `pnpm dev` is running for server-side errors.

4.  **API Route Existence**:
    -   Verify that `frontend/src/app/api/auth/[...all]/route.ts` exists.
