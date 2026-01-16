/**
 * Better Auth API Route Handler
 *
 * Handles all /api/auth/* routes using Better Auth.
 * This is a catch-all route that delegates to Better Auth.
 *
 * Endpoints handled:
 * - POST /api/auth/sign-up/email - User registration
 * - POST /api/auth/sign-in/email - User login
 * - POST /api/auth/sign-out - User logout
 * - GET  /api/auth/session - Get current session
 * - GET  /api/auth/token - Get JWT for API calls
 */

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Export handlers for all HTTP methods Better Auth needs
export const { GET, POST } = toNextJsHandler(auth);
