/**
 * Better Auth Server Configuration
 *
 * Uses PostgreSQL for user storage and session management.
 * JWT tokens for API calls are generated via a separate endpoint.
 *
 * Skill Reference: configuring-better-auth/SKILL.md
 * Agent Reference: @better-auth-expert
 */

import { betterAuth } from "better-auth";
import { Pool } from "pg";

// Secret must be at least 32 characters (SR-006)
const secret = process.env.BETTER_AUTH_SECRET!;

// Database connection - same Neon PostgreSQL as backend
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false, // Required for Neon
	},
});

export const auth = betterAuth({
	secret,
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

	plugins: [],

	// PostgreSQL database adapter
	database: pool,

	// Email/Password authentication (FR-001, FR-002)
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8, // SR-005
		autoSignIn: true, // Auto sign-in after registration
	},

	// Session configuration (FR-007, SR-002)
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
		updateAge: 60 * 60 * 24, // Refresh session daily
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5, // 5 minutes cache
		},
	},

	// Advanced session hardening
	advanced: {
		cookiePrefix: "better-auth",
		useSecureCookies: process.env.NODE_ENV === "production",
	},
});

// Export auth type for type safety
export type Auth = typeof auth;
