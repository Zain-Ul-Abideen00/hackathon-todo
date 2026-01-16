/**
 * TanStack Query hooks for task operations
 * @module hooks/useTasks
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as tasksApi from "@/lib/api/tasks";
import { taskKeys } from "@/lib/queries/keys";
import type { ListTasksParams, TaskCreate, TaskUpdate } from "@/types/task";

/**
 * Hook to fetch paginated list of tasks
 */
export function useTasksQuery(params: ListTasksParams = {}) {
	return useQuery({
		queryKey: taskKeys.list(params),
		queryFn: () => tasksApi.getTasks(params),
	});
}

/**
 * Hook to fetch a single task by ID
 */
export function useTaskQuery(id: string) {
	return useQuery({
		queryKey: taskKeys.detail(id),
		queryFn: () => tasksApi.getTask(id),
		enabled: !!id,
	});
}

/**
 * Hook to create a new task
 */
export function useCreateTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: TaskCreate) => tasksApi.createTask(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
		},
	});
}

/**
 * Hook to update an existing task
 */
export function useUpdateTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: TaskUpdate }) => tasksApi.updateTask(id, data),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
		},
	});
}

/**
 * Hook to delete a task
 */
export function useDeleteTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => tasksApi.deleteTask(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
		},
	});
}

/**
 * Hook to toggle task completion status
 */
export function useToggleComplete() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => tasksApi.toggleComplete(id),
		onSuccess: (_, id) => {
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
		},
	});
}
