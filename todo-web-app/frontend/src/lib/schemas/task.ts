/**
 * Zod schemas for task form validation
 * @module lib/schemas/task
 */

import { z } from "zod";

/**
 * Schema for creating/editing a task
 */
export const taskSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title must be 200 characters or less"),
	description: z
		.string()
		.max(1000, "Description must be 1000 characters or less")
		.optional()
		.nullable(),
	status: z.enum(["todo", "in_progress", "completed"]),
	priority: z.enum(["low", "medium", "high"]),
	due_date: z.string().optional().nullable(),
	tags: z.array(z.number()).optional(),
	recurring: z.object({
		pattern: z.enum(["daily", "weekly", "monthly", "yearly"]),
		interval: z.number().int().positive().default(1),
		end_date: z.string().optional().nullable(),
	}).optional().nullable(),
    reminders: z.array(z.object({
        remind_at: z.string()
    })).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

/**
 * Schema for task filters
 */
export const taskFiltersSchema = z.object({
	status: z.enum(["all", "todo", "in_progress", "completed", "overdue"]).default("all"),
	sort_by: z.enum(["created_at", "due_date", "priority", "title"]).default("created_at"),
	order: z.enum(["asc", "desc"]).default("desc"),
	search: z.string().optional(),
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().max(100).default(10),
});

export type TaskFiltersFormData = z.infer<typeof taskFiltersSchema>;
