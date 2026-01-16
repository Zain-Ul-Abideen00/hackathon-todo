"use client";

/**
 * Task List Component
 * Displays list of tasks with filtering and empty states
 * @module components/tasks/TaskList
 */

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { FiInbox as Inbox } from "react-icons/fi";
import { TbPlus as Plus } from "react-icons/tb";
import { Button } from "@/components/lightswind/button";
import { Skeleton } from "@/components/lightswind/skeleton";
import type { Task } from "@/types/task";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
	tasks: Task[] | undefined;
	isLoading: boolean;
	emptyMessage?: string;
}

export function TaskList({ tasks, isLoading, emptyMessage = "No tasks found" }: TaskListProps) {
	// Loading skeleton
	if (isLoading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3, 4, 5].map((i) => (
					<div key={i} className="rounded-lg border border-border bg-card p-4">
						<div className="flex items-start gap-3">
							<Skeleton className="h-5 w-5 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-5 w-3/4" />
								<Skeleton className="h-4 w-1/2" />
								<div className="flex gap-2">
									<Skeleton className="h-5 w-16 rounded-full" />
									<Skeleton className="h-5 w-20 rounded-full" />
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}

	// Empty state
	if (!tasks?.length) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-16"
			>
				<div className="rounded-full bg-muted p-4">
					<Inbox className="h-8 w-8 text-muted-foreground" />
				</div>
				<h3 className="mt-4 text-lg font-medium">{emptyMessage}</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Get started by creating your first task
				</p>
				<Link href="/tasks/new">
					<Button className="mt-6 gap-2">
						<Plus className="h-4 w-4" />
						Create Task
					</Button>
				</Link>
			</motion.div>
		);
	}

	// Task list
	return (
		<div className="space-y-4">
			<AnimatePresence mode="popLayout">
				{tasks.map((task) => (
					<TaskCard key={task.id} task={task} />
				))}
			</AnimatePresence>
		</div>
	);
}
