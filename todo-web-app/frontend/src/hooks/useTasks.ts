/**
 * TanStack Query hooks for task operations
 * @module hooks/useTasks
 */

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as tasksApi from "@/lib/api/tasks";
import { taskKeys } from "@/lib/queries/keys";
import type { ListTasksParams, PaginatedResponse, Task, TaskCreate, TaskUpdate } from "@/types/task";
import type { Tag } from "@/types/tag";
import { useTagStore } from "@/stores/tagStore";
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
		onMutate: async (newTaskData) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

			// Snapshot the previous value
			const previousTasks = queryClient.getQueryData<PaginatedResponse<Task>>(taskKeys.lists());

            const tempId = `temp-${Date.now()}`;
            const optimisticTask: Task = {
                id: tempId,
                title: newTaskData.title,
                description: newTaskData.description || null,
                status: newTaskData.status || "todo",
                priority: newTaskData.priority || "medium",
                due_date: newTaskData.due_date || null,
                completed: newTaskData.status === "completed",
                user_id: "me",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                tags: []
            };

            // Optimistically update to the new value
            queryClient.setQueriesData<PaginatedResponse<Task>>(
                { queryKey: taskKeys.lists() },
                (old) => {
                    // Safe check: if we don't have old data, we can't safely append optimistic task
                    // without knowing pagination state, so we skip optimistic update for empty cache.
                    if (!old || !old.data) return old;

                    return {
                        ...old,
                        data: [optimisticTask, ...old.data],
                        total: old.total + 1
                    };
                }
            );

			// Return a context object with the snapshotted value
			return { previousTasks };
		},
		onError: (err, newTodo, context) => {
             toast.error("Failed to create task");
             // Just invalidate everything to be safe
             queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ["tasks", "stats"] });
		},
	});
}

/**
 * Hook to update an existing task
 */


// ... existing code ...

/**
 * Hook to update an existing task
 */
export function useUpdateTask() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: TaskUpdate }) => tasksApi.updateTask(id, data),
		onMutate: async ({ id, data }) => {
            const taskId = String(id);
			await queryClient.cancelQueries({ queryKey: taskKeys.detail(taskId) });
			await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

			const previousTask = queryClient.getQueryData<Task>(taskKeys.detail(taskId));

            // Resolve tags if they are being updated
            let optimisticTags: Tag[] | undefined;
            if (data.tags) {
                const allTags = useTagStore.getState().tags;
                optimisticTags = allTags.filter(t => data.tags?.includes(t.id));
            }

            // Prepare update object, excluding raw 'tags' and 'reminders' arrays to avoid type mismatch
            const { tags: _rawTags, reminders: _rawReminders, ...otherUpdates } = data;

            // Helper to merge task data safely
            const mergeTaskData = (task: Task): Task => ({
                ...task,
                ...otherUpdates,
                // Apply resolved tags if present
                ...(optimisticTags ? { tags: optimisticTags } : {}),
                // Handle reminders optimistic update
                ...(data.reminders ? {
                    reminders: data.reminders.map((r, i) => ({
                        // Spread existing reminder data
                        ...r,
                        // Polyfill missing Reminder properties for UI
                        id: -1 - i, // Temporary negative ID
                        triggered: false,
                        task_id: task.id,
                        user_id: task.user_id,
                        // Ensure date string is preserved or null
                        remind_at: r.remind_at
                    }))
                } : {}),

                // Handle status updates affecting 'completed'
                ...(data.status === "completed" ? { completed: true } : {}),
                ...(data.status === "todo" || data.status === "in_progress" ? { completed: false } : {}),
                // If completion toggled, handle status
                ...(data.completed === true ? { status: "completed" as const } : {}),
                ...(data.completed === false && task.status === "completed" ? { status: "todo" as const } : {}),
                updated_at: new Date().toISOString(),
            });

			if (previousTask) {
				queryClient.setQueryData<Task>(taskKeys.detail(taskId), mergeTaskData(previousTask));
			}

            queryClient.setQueriesData<PaginatedResponse<Task>>({ queryKey: taskKeys.lists() }, (old) => {
                if (!old || !old.data) return old;
                return {
                    ...old,
                    data: old.data.map(task => {
                        if (String(task.id) === taskId) {
                            return mergeTaskData(task);
                        }
                        return task;
                    })
                };
            });

			return { previousTask };
		},
// ... rest of hook ...
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
            // Refresh notifications immediately to clear any stale overdue alerts if rescheduled
            import("@/stores/notificationStore").then(({ useNotificationStore }) => {
                useNotificationStore.getState().fetchNotifications(false);
            });
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
        onMutate: async (id) => {
            const taskId = String(id);
            await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

            queryClient.setQueriesData<PaginatedResponse<Task>>(
                { queryKey: taskKeys.lists() },
                (old) => {
                    if (!old || !old.data) return old;
                    return {
                        ...old,
                        data: old.data.filter(task => String(task.id) !== taskId),
                        total: Math.max(0, old.total - 1)
                    };
                }
            );
        },
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ["tasks", "stats"] });
            toast.success("Task deleted");
		},
        onError: () => {
             toast.error("Failed to delete task");
             queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
        }
	});
}

/**
 * Hook to toggle task completion status
 */
export function useToggleComplete() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => {
            if (String(id).startsWith("temp-")) {
                throw new Error("Cannot modify task while it is being created");
            }
            return tasksApi.toggleComplete(id);
        },
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
                if (!old || !old.data) return old;
                return {
                    ...old,
                    data: old.data.map(task => {
                        if (String(task.id) === taskId) {
                            const newCompleted = !task.completed;
                            return {
                                ...task,
                                completed: newCompleted,
                                status: newCompleted ? "completed" : "todo", // Sync with backend logic
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
            // Refresh notifications immediately to clear any stale overdue/reminders
            import("@/stores/notificationStore").then(({ useNotificationStore }) => {
                useNotificationStore.getState().fetchNotifications(false);
            });
		},
	});
}
