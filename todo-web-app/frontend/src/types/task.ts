/**
 * Task entity types for the Todo application
 * @module types/task
 */

export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";

import type { Tag } from "./tag";

export interface RecurringPattern {
    pattern: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    end_date: string | null;
    last_generated: string | null;
}

export interface RecurringCreate {
    pattern: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    end_date?: string | null;
}

export interface Reminder {
    id: number;
    remind_at: string;
    triggered: boolean;
}

export interface ReminderCreate {
    remind_at: string;
}

/**
 * Task entity from the backend API
 */
export interface Task {
	id: string;
	title: string;
	description: string | null;
	status: TaskStatus;
	priority: TaskPriority;
	due_date: string | null; // ISO 8601 format
	completed: boolean;
	created_at: string;
	updated_at: string;
	user_id: string;
    tags?: Tag[];
    recurring_pattern?: RecurringPattern;
    reminders?: Reminder[];
}

/**
 * Payload for creating a new task
 */
export interface TaskCreate {
	title: string;
	description?: string | null;
	status?: TaskStatus;
	priority?: TaskPriority;
	due_date?: string | null;
    tags?: number[];
    recurring?: RecurringCreate;
    reminders?: ReminderCreate[];
}

/**
 * Payload for updating an existing task
 */
export interface TaskUpdate {
	title?: string;
	description?: string | null;
	status?: TaskStatus;
	priority?: TaskPriority;
	due_date?: string | null;
	completed?: boolean;
    tags?: number[];
    recurring?: RecurringCreate | null;
    reminders?: ReminderCreate[];
}

/**
 * Filter status for task queries
 */
export type FilterStatus = "all" | "todo" | "in_progress" | "completed" | "overdue";

/**
 * Sort options for task queries
 */
export type SortBy = "created_at" | "due_date" | "priority" | "title";
export type SortOrder = "asc" | "desc";

/**
 * View mode for task list display
 */
export type ViewMode = "grid" | "list";

/**
 * Query parameters for listing tasks
 */
export interface ListTasksParams {
	status?: FilterStatus;
    priority?: TaskPriority;
	sort_by?: SortBy;
	order?: SortOrder;
	page?: number;
	limit?: number;
	search?: string;
	cursor?: string;
	tags?: number[];
}

/**
 * Paginated response from the API
 */
export interface PaginatedResponse<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	hasMore: boolean;
	total_pages?: number;
}

/**
 * API error response
 */
export interface APIErrorResponse {
	status: number;
	message: string;
	detail?: string;
	errors?: Record<string, string[]>;
}
