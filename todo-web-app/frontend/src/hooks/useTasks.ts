/**
 * TanStack Query hooks for task operations
 * @module hooks/useTasks
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as tasksApi from "@/lib/api/tasks";
import { taskKeys } from "@/lib/queries/keys";
import type { ListTasksParams, PaginatedResponse, Task, TaskCreate, TaskUpdate } from "@/types/task";
import { toast } from "sonner";

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
 * Hook to fetch task statistics
 */
export function useTaskStats() {
    return useQuery({
        queryKey: ["tasks", "stats"],
        queryFn: () => tasksApi.getTaskStats(),
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
		onMutate: async ({ id, data }) => {
            const taskId = String(id);
			// Cancel queries
			await queryClient.cancelQueries({ queryKey: taskKeys.detail(taskId) });
			await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

			// Snapshot previous value
			const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(taskId));

			// Optimistically update Detail
			if (previousTask) {
				queryClient.setQueryData<Task>(taskKeys.detail(taskId), {
					...previousTask,
					...data,
                    // Auto-sync completed based on status if provided
                    ...(data.status === "completed" ? { completed: true } : {}),
                    ...(data.status === "todo" || data.status === "in_progress" ? { completed: false } : {}),
                    // If completion toggled via status
                    updated_at: new Date().toISOString(),
				});
			}

            // Optimistically update Lists
            queryClient.setQueriesData<PaginatedResponse<Task>>({ queryKey: taskKeys.lists() }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map(task => {
                        if (String(task.id) === taskId) {
                            return {
                                ...task,
                                ...data,
                                ...(data.status === "completed" ? { completed: true } : {}),
                                ...(data.status === "todo" || data.status === "in_progress" ? { completed: false } : {}),
                                updated_at: new Date().toISOString(),
                            };
                        }
                        return task;
                    })
                };
            });

			return { previousTask };
		},
		onError: (err, { id }, context) => {
            const taskId = String(id);
			if (context?.previousTask) {
				queryClient.setQueryData(taskKeys.detail(taskId), context.previousTask);
			}
            // We should ideally rollback lists too, but simple invalidation on settled covers it usually
            toast.error("Failed to update task");
		},
		onSettled: (_, __, { id }) => {
            const taskId = String(id);
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
            queryClient.invalidateQueries({ queryKey: ["tasks", "stats"] });
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
		onMutate: async (id) => {
            const taskId = String(id);
			// Cancel text queries
			await queryClient.cancelQueries({ queryKey: taskKeys.detail(taskId) });
			await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

			// Snapshot previous value
			const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(taskId));

			// Optimistically update Detail
			if (previousTask) {
				const newCompleted = !previousTask.completed;
				queryClient.setQueryData<Task>(taskKeys.detail(taskId), {
					...previousTask,
					completed: newCompleted,
					status: newCompleted ? "completed" : "todo", // Sync with backend logic
                    updated_at: new Date().toISOString(),
				});
			}

            // Optimistically update Lists
            queryClient.setQueriesData<PaginatedResponse<Task>>({ queryKey: taskKeys.lists() }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map(task => {
                        if (String(task.id) === taskId) {
                            const newCompleted = !task.completed;
                            return {
                                ...task,
                                completed: newCompleted,
                                status: newCompleted ? "completed" : "todo",
                                updated_at: new Date().toISOString(),
                            };
                        }
                        return task;
                    })
                };
            });

			return { previousTask };
		},
        onError: (_, id, context) => {
             const taskId = String(id);
             if (context?.previousTask) {
                queryClient.setQueryData(taskKeys.detail(taskId), context.previousTask);
             }
             toast.error("Failed to toggle task");
        },
		onSuccess: (_, id) => {
             const taskId = String(id);
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
			queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
            queryClient.invalidateQueries({ queryKey: ["tasks", "stats"] });
		},
	});
}
