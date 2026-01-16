/**
 * API client with JWT authentication
 * @module lib/api
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * API Error class for handling HTTP errors
 */
export class APIError extends Error {
	constructor(
		public status: number,
		public data: unknown,
	) {
		super(`API Error: ${status}`);
		this.name = "APIError";
	}
}

interface RequestConfig extends RequestInit {
	skipAuth?: boolean;
}

/**
 * Generic API client with JWT token injection
 */
export async function apiClient<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
	const { skipAuth = false, ...fetchOptions } = options;

	const headers: HeadersInit = {
		"Content-Type": "application/json",
		...fetchOptions.headers,
	};

	// Add auth header if authenticated
	if (!skipAuth) {
		try {
			// Fetch the HS256 JWT from our custom endpoint
			const res = await fetch("/api/token");
			if (res.ok) {
				const { token } = await res.json();
				if (token) {
					(headers as Record<string, string>).Authorization = `Bearer ${token}`;
				}
			}
		} catch (_e) {
			// Token not available or fetch failed
			// console.error("Failed to get JWT:", e)
		}
	}

	const response = await fetch(`${API_URL}${endpoint}`, {
		...fetchOptions,
		headers,
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new APIError(response.status, errorData);
	}

	// Handle empty responses
	const text = await response.text();
	if (!text) {
		return {} as T;
	}

	return JSON.parse(text);
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
	get: <T>(url: string, options?: RequestConfig) =>
		apiClient<T>(url, { method: "GET", ...options }),

	post: <T>(url: string, data: unknown, options?: RequestConfig) =>
		apiClient<T>(url, {
			method: "POST",
			body: JSON.stringify(data),
			...options,
		}),

	put: <T>(url: string, data: unknown, options?: RequestConfig) =>
		apiClient<T>(url, {
			method: "PUT",
			body: JSON.stringify(data),
			...options,
		}),

	patch: <T>(url: string, data?: unknown, options?: RequestConfig) =>
		apiClient<T>(url, {
			method: "PATCH",
			body: data ? JSON.stringify(data) : undefined,
			...options,
		}),

	delete: <T>(url: string, options?: RequestConfig) =>
		apiClient<T>(url, { method: "DELETE", ...options }),
};

/**
 * Handle API errors and return user-friendly messages
 */
export function handleAPIError(error: unknown): string {
	if (error instanceof APIError) {
		switch (error.status) {
			case 401:
				return "Please log in to continue";
			case 403:
				return "You don't have permission to do this";
			case 404:
				return "Resource not found";
			case 422:
				return "Invalid data provided";
			case 429:
				return "Too many requests. Please try again later";
			case 500:
				return "Server error. Please try again later";
			default:
				return "An error occurred";
		}
	}

	if (error instanceof Error) {
		return error.message;
	}

	return "An unexpected error occurred";
}
