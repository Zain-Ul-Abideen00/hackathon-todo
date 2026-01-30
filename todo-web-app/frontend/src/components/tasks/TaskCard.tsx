"use client";

/**
 * Task Card Component
 * Individual task card with checkbox, title, priority badge, and actions
 * @module components/tasks/TaskCard
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";
import { FiCheck as Check } from "react-icons/fi";
import { TbCalendarMonth as Calendar, TbPencil as Pencil, TbTrash as Trash2, TbPlayerPlay } from "react-icons/tb";
import { toast } from "sonner";
import { formatDate, formatDueDate } from "@/lib/date";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/lightswind/alert-dialog";
import { ConfettiButton, type ConfettiButtonHandle } from "@/components/lightswind/confetti-button";
import { Button } from "@/components/lightswind/button";
import { Card, CardContent } from "@/components/lightswind/card";
import { useDeleteTask, useToggleComplete, useUpdateTask } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TaskCardProps {
    task: Task;
}

const priorityStyles = {
    high: "bg-red-500/10 text-red-500 border-red-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    low: "bg-green-500/10 text-green-500 border-green-500/20",
};

const statusStyles = {
    todo: "bg-gray-500/10 text-gray-500",
    in_progress: "bg-blue-500/10 text-blue-500",
    completed: "bg-green-500/10 text-green-500",
};

export function TaskCard({ task }: TaskCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const confettiRef = useRef<ConfettiButtonHandle>(null);
    const toggleComplete = useToggleComplete();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

    /*
     * Use status field as source of truth for completion state,
     * falling back to completed boolean for legacy/transition support
     */
    const isCompleted = task.status === "completed" || task.completed;
    const isTodo = task.status === "todo";

    const handleToggleComplete = async () => {
        try {
            await toggleComplete.mutateAsync(task.id);
            if (!isCompleted) {
                confettiRef.current?.triggerConfetti();
                toast.success("Task completed!");
            } else {
                toast.success("Task unmarked");
            }
        } catch {
            toast.error("Failed to update task");
        }
    };

    const handleStart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await updateTask.mutateAsync({
                id: task.id,
                data: { status: "in_progress" }
            });
            toast.success("Task started!");
        } catch {
            toast.error("Failed to start task");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTask.mutateAsync(task.id);
            toast.success("Task deleted");
            setShowDeleteDialog(false);
        } catch {
            toast.error("Failed to delete task");
        }
    };

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
            >
                <Card className={cn("group overflow-hidden transition-all", isCompleted && "opacity-75")}>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <ConfettiButton
                                ref={confettiRef}
                                manual
                                onClick={handleToggleComplete}
                                disabled={toggleComplete.isPending}
                                variant="ghost"
                                size="icon"
                                confettiOptions={{
                                    particleCount: 300,
                                    spread: 100,
                                    origin: { y: 0.7 }
                                }}
                                className={cn(
                                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all p-0 hover:bg-transparent",
                                    isCompleted
                                        ? "border-green-500 bg-green-500"
                                        : "border-border hover:border-primary",
                                )}
                            >
                                {isCompleted && <Check className="h-3 w-3 text-white" />}
                            </ConfettiButton>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <Link href={`/tasks/${task.id}`} className="flex-1 min-w-0">
                                        <h3
                                            className={cn(
                                                "font-medium transition-colors hover:text-primary",
                                                isCompleted && "text-muted-foreground line-through",
                                            )}
                                        >
                                            {task.title}
                                        </h3>
                                    </Link>

                                    <div className="flex items-center gap-1">
                                        {isTodo && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                                onClick={handleStart}
                                            >
                                                <TbPlayerPlay className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        >
                                            <Link href={`/tasks/${task.id}/edit`}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-500/10"
                                            onClick={() => setShowDeleteDialog(true)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Description */}
                                {task.description && (
                                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                        {task.description}
                                    </p>
                                )}

                                {/* Meta */}
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    {/* Priority Badge */}
                                    <span
                                        className={cn(
                                            "rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
                                            priorityStyles[task.priority],
                                        )}
                                    >
                                        {task.priority}
                                    </span>

                                    {/* Status Badge */}
                                    <span
                                        className={cn(
                                            "rounded-full px-2 py-0.5 text-xs font-medium",
                                            statusStyles[task.status],
                                        )}
                                    >
                                        {task.status.replace("_", " ")}
                                    </span>

                                    {/* Due Date */}
                                    {task.due_date && (
                                        <span
                                            title={`Due: ${formatDate(task.due_date)}`}
                                            className={cn(
                                                "flex items-center gap-1 text-xs",
                                                isOverdue ? "text-red-500" : "text-muted-foreground",
                                            )}
                                        >
                                            <Calendar className="h-3 w-3" />
                                            {formatDueDate(task.due_date)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteTask.isPending}
                        >
                            {deleteTask.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
