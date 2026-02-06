/**
 * TanStack Query keys for task queries
 * @module lib/queries/keys
 */

import type { ListTasksParams } from "@/types/task";

export const taskKeys = {
	all: ["tasks"] as const,
	lists: () => [...taskKeys.all, "list"] as const,
	list: (filters: ListTasksParams) => [...taskKeys.lists(), filters] as const,
	details: () => [...taskKeys.all, "detail"] as const,
	detail: (id: string) => [...taskKeys.details(), id] as const,
};

export const userKeys = {
	all: ["user"] as const,
	session: () => [...userKeys.all, "session"] as const,
};

export const tagKeys = {
	all: ["tags"] as const,
	lists: () => [...tagKeys.all, "list"] as const,
};
