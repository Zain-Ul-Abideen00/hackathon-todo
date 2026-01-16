"use client";

/**
 * Edit Task Form Client Component
 * Fetches task data and renders form
 * @module app/(dashboard)/tasks/[id]/edit/EditTaskForm
 */

import { Skeleton } from "@/components/lightswind/skeleton";
import { TaskForm } from "@/components/tasks/TaskForm";
import { useTaskQuery } from "@/hooks/useTasks";

interface EditTaskFormProps {
	taskId: string;
}

export function EditTaskForm({ taskId }: EditTaskFormProps) {
	const { data: task, isLoading, error } = useTaskQuery(taskId);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-24 w-full" />
				<div className="grid gap-4 sm:grid-cols-2">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
			</div>
		);
	}

	if (error || !task) {
		return (
			<div className="py-8 text-center">
				<p className="text-destructive">Failed to load task</p>
				<p className="mt-1 text-sm text-muted-foreground">
					The task may have been deleted or you don&apos;t have permission to view it.
				</p>
			</div>
		);
	}

	return <TaskForm task={task} />;
}
