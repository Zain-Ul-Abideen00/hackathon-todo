/**
 * User entity types for the Todo application
 * @module types/user
 */

/**
 * User entity from Better Auth
 */
export interface User {
	id: string;
	email: string;
	name: string | null;
	image: string | null;
	emailVerified: boolean;
	createdAt: string;
	updatedAt: string;
}

/**
 * Session with user and token
 */
export interface Session {
	user: User;
	token: string;
	expiresAt: string;
}
