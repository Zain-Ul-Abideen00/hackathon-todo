"use client";

import Link from "next/link";
import { useRef } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { TbPencil, TbPlayerPlay } from "react-icons/tb";
import { toast } from "sonner";
import { Button } from "@/components/lightswind/button";
import { ConfettiButton, type ConfettiButtonHandle } from "@/components/lightswind/confetti-button";
import { useToggleComplete, useUpdateTask } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { formatDueDate } from "@/lib/date";

interface DashboardTaskItemProps {
    task: Task;
}

export function DashboardTaskItem({ task }: DashboardTaskItemProps) {
    const toggleComplete = useToggleComplete();
    const updateTask = useUpdateTask();
    const confettiRef = useRef<ConfettiButtonHandle>(null);
    const isCompleted = task.status === "completed" || task.completed;
    const isTodo = task.status === "todo";

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        e.stopPropagation();

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

    return (
        <div
            className="group flex items-center gap-3 rounded-lg border border-transparent p-3 transition-colors hover:bg-muted/50 hover:border-border"
        >
            <div className="shrink-0">
                <ConfettiButton
                    ref={confettiRef}
                    manual
                    onClick={handleToggle}
                    disabled={toggleComplete.isPending}
                    variant="ghost"
                    size="icon"
                    confettiOptions={{
                        particleCount: 40,
                        spread: 60,
                        origin: { y: 0.7 },
                    }}
                    className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 p-0 transition-all hover:bg-transparent",
                        isCompleted
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-muted-foreground/30 hover:border-primary",
                    )}
                >
                    {isCompleted && <FiCheckCircle className="h-3 w-3" />}
                </ConfettiButton>
            </div>

            <Link href={`/tasks/${task.id}`} className="min-w-0 flex-1">
                <div>
                    <p
                        className={cn(
                            "truncate font-medium transition-colors",
                            isCompleted ? "text-muted-foreground line-through" : "text-foreground",
                        )}
                    >
                        {task.title}
                    </p>
                    {task.due_date && (
                        <p className="text-xs text-muted-foreground">
                            Due: {formatDueDate(task.due_date)}
                        </p>
                    )}
                </div>
            </Link>

            <div className="flex items-center gap-2">
                {isTodo && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500 opacity-0 transition-opacity group-hover:opacity-100 hidden sm:inline-flex"
                        onClick={handleStart}
                    >
                        <TbPlayerPlay className="h-4 w-4" />
                    </Button>
                )}

                <span
                    className={cn(
                        "hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-block",
                        task.priority === "high"
                            ? "bg-red-500/10 text-red-500"
                            : task.priority === "medium"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-green-500/10 text-green-500",
                    )}
                >
                    {task.priority}
                </span>

                <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                >
                    <Link href={`/tasks/${task.id}/edit`}>
                        <TbPencil className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
