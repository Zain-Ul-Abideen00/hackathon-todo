/**
 * Task API functions
 *
 * Matches backend routes: /api/{user_id}/tasks/...
 * @module lib/api/tasks
 */

import type { ListTasksParams, PaginatedResponse, Task, TaskCreate, TaskUpdate } from "@/types/task";
import { api } from "../api";
import { authClient } from "../auth-client";

/**
 * Get user ID from session
 */
async function getUserId(): Promise<string> {
	const session = await authClient.getSession();
	if (!session?.data?.user?.id) {
		throw new Error("User not authenticated");
	}
	return session.data.user.id;
}

/**
 * Backend response format for task list
 */
interface TaskListResponse {
	tasks: Task[];
	next_cursor: string | null;
	has_more: boolean;
}


/**
 * Get aggregated task statistics
 */
export async function getTaskStats(): Promise<Record<string, number>> {
	const userId = await getUserId();
	return api.get<Record<string, number>>(`/api/${userId}/tasks/stats`);
}

/**
 * Get paginated list of tasks with optional filters
 */
export async function getTasks(params: ListTasksParams = {}): Promise<PaginatedResponse<Task>> {
	const userId = await getUserId();
	const searchParams = new URLSearchParams();

	// Map frontend params to backend query params
	if (params.status && params.status !== "all") {
		searchParams.set("status", params.status);
	}

	if (params.sort_by) {
		// Backend expects: created, title, due_date, priority
		const map: Record<string, string> = {
			created_at: "created",
		};
		searchParams.set("sort", map[params.sort_by] || params.sort_by);
	}

    if (params.order) {
        searchParams.set("order", params.order);
    }

	if (params.limit) {
		searchParams.set("limit", String(params.limit));
	}

	if (params.cursor) {
		searchParams.set("cursor", params.cursor);
	}

    if (params.search) {
        searchParams.set("search", params.search);
    }

    // Check if priority is in params (need to update ListTasksParams type if incomplete)
    // Assuming ListTasksParams might need update or we cast
    if ((params as any).priority) {
        searchParams.set("priority", (params as any).priority);
    }

	if (params.tags && params.tags.length > 0) {
		// Filter out optimistic tags (negative IDs) as they don't exist on server
		const validTags = params.tags.filter(id => id > 0);
		validTags.forEach((tagId) => searchParams.append("tags", String(tagId)));
	}

	const query = searchParams.toString();
	const result = await api.get<TaskListResponse>(`/api/${userId}/tasks${query ? `?${query}` : ""}`);

	// Transform backend response to frontend format
	return {
		data: result.tasks,
		total: result.tasks.length,
		page: 1,
		limit: params.limit || 20,
		hasMore: result.has_more,
	};
}

/**
 * Get a single task by ID
 */
export async function getTask(id: string): Promise<Task> {
	const userId = await getUserId();
	return api.get<Task>(`/api/${userId}/tasks/${id}`);
}

/**
 * Create a new task
 */
export async function createTask(data: TaskCreate): Promise<Task> {
	const userId = await getUserId();
	return api.post<Task>(`/api/${userId}/tasks`, data);
}

/**
 * Update an existing task
 */
export async function updateTask(id: string, data: TaskUpdate): Promise<Task> {
	const userId = await getUserId();
	return api.put<Task>(`/api/${userId}/tasks/${id}`, data);
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
	const userId = await getUserId();
	await api.delete(`/api/${userId}/tasks/${id}`);
}

/**
 * Toggle task completion status
 */
export async function toggleComplete(id: string): Promise<Task> {
	const userId = await getUserId();
	return api.patch<Task>(`/api/${userId}/tasks/${id}/complete`);
}
