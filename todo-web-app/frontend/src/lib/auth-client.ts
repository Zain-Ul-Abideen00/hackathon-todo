/**
 * Better Auth Client Configuration
 *
 * Provides React hooks and client-side auth methods.
 * Used in client components for auth interactions.
 *
 * Agent Reference: @better-auth-expert
 */

import { createAuthClient } from "better-auth/react";

// Create auth client pointing to our API
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
});

// Export commonly used hooks and methods
export const { signIn, signUp, signOut, useSession, getSession } = authClient;

// Type exports for use in components
export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];
