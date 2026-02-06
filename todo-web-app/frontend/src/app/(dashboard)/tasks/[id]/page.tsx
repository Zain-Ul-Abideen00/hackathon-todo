"use client";

import { motion } from "framer-motion";
import { formatDateTime, formatDate, formatDueDate } from "@/lib/date";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useRef, useState } from "react";
import { FiCheckCircle, FiTrash2 } from "react-icons/fi";
import { TbArrowLeft, TbCalendar, TbPencil } from "react-icons/tb";
import { toast } from "sonner";

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
import { Button } from "@/components/lightswind/button";
import { Card, CardContent, CardHeader } from "@/components/lightswind/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/lightswind/select";
import { ConfettiButton, type ConfettiButtonHandle } from "@/components/lightswind/confetti-button";
import { useDeleteTask, useTaskQuery, useToggleComplete, useUpdateTask } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/task";
import RippleLoader from "@/components/lightswind/ripple-loader";
import { MdEmojiEmotions } from "react-icons/md";

export default function ViewTaskPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const confettiRef = useRef<ConfettiButtonHandle>(null);

    const { data: task, isLoading, error } = useTaskQuery(id);
    const toggleComplete = useToggleComplete();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

    const isCompleted = task?.status === "completed" || task?.completed;

    const handleToggleComplete = async () => {
        if (!task) return;
        try {
            await toggleComplete.mutateAsync(id); // Use route param ID (string)
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

    const handleStatusChange = async (newStatus: TaskStatus) => {
        if (!task) return;
        try {
            await updateTask.mutateAsync({
                id: id, // Use route param ID (string)
                data: { status: newStatus }
            });
            if (newStatus === "completed") {
                confettiRef.current?.triggerConfetti();
                toast.success("Task completed!");
            } else {
                toast.success("Status updated");
            }
        } catch {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async () => {
        if (!task) return;
        try {
            await deleteTask.mutateAsync(task.id);
            toast.success("Task deleted");
            router.push("/tasks");
        } catch {
            toast.error("Failed to delete task");
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-9999 flex items-center justify-center bg-background">
                <RippleLoader
                    icon={<MdEmojiEmotions />}
                    size={400}
                    duration={4}
                    logoColor={{ light: "#664b31", dark: "#f2d5b8" }}
                    rippleColor={{ light: "#946e4a", dark: "#c7a990" }}
                />
            </div>
        );
    }

    if (error || !task) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Task not found</p>
                <Link href="/tasks">
                    <Button variant="outline">Back to Tasks</Button>
                </Link>
            </div>
        );
    }

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl space-y-6"
        >
            {/* Navigation Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <TbArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1" />

                {/* Actions */}
                <Link href={`/tasks/${task.id}/edit`}>
                    <Button variant="outline" size="sm" className="gap-2">
                        <TbPencil className="h-4 w-4" />
                        Edit
                    </Button>
                </Link>
                <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowDeleteDialog(true)}
                >
                    <FiTrash2 className="h-4 w-4" />
                    Delete
                </Button>
            </div>

            <Card>
                <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        {/* Title & Status */}
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={cn(
                                        "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase",
                                        task.priority === "high"
                                            ? "bg-red-500/10 text-red-500"
                                            : task.priority === "medium"
                                                ? "bg-yellow-500/10 text-yellow-500"
                                                : "bg-green-500/10 text-green-500",
                                    )}
                                >
                                    {task.priority}
                                </span>
                                <Select
                                    value={task.status}
                                    onValueChange={(val) => handleStatusChange(val as TaskStatus)}
                                >
                                    <SelectTrigger
                                        className={cn(
                                            "h-6 w-auto gap-2 rounded-full border-none px-2.5 py-0.5 text-xs font-semibold uppercase focus:ring-0",
                                            task.status === "completed"
                                                ? "bg-green-500/10 text-green-500"
                                                : task.status === "in_progress"
                                                    ? "bg-blue-500/10 text-blue-500"
                                                    : "bg-gray-500/10 text-gray-500",
                                        )}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                                {isOverdue && (
                                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600 uppercase">
                                        Overdue
                                    </span>
                                )}
                            </div>
                            <h1 className={cn("text-3xl font-bold", isCompleted && "text-muted-foreground line-through decoration-2")}>
                                {task.title}
                            </h1>
                        </div>

                        {/* Complete Toggle */}
                        <ConfettiButton
                            ref={confettiRef}
                            manual
                            onClick={handleToggleComplete}
                            disabled={toggleComplete.isPending}
                            variant="outline"
                            size="lg"
                            confettiOptions={{
                                particleCount: 150,
                                spread: 70,
                                origin: { y: 0.6 },
                            }}
                            className={cn(
                                "h-12 w-12 rounded-full border-2 p-0 transition-all shadow-sm",
                                isCompleted
                                    ? "border-green-500 bg-green-500 text-white hover:bg-green-600"
                                    : "hover:border-primary hover:bg-muted",
                            )}
                        >
                            <FiCheckCircle className={cn("h-6 w-6", isCompleted ? "scale-110" : "text-muted-foreground")} />
                        </ConfettiButton>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Due Date */}
                    {task.due_date && (
                        <div className="flex items-center gap-2 text-sm">
                            <TbCalendar className={cn("h-5 w-5", isOverdue ? "text-red-500" : "text-muted-foreground")} />
                            <span className={cn("font-medium", isOverdue ? "text-red-600" : "text-foreground")}>
                                Due {formatDueDate(task.due_date)} ({formatDate(task.due_date)})
                            </span>
                        </div>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            {task.tags.map(tag => (
                                <span
                                    key={tag.id}
                                    className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ring-1 ring-inset"
                                    style={{
                                        backgroundColor: `#${tag.color}15`,
                                        color: `#${tag.color}`,
                                        boxShadow: `inset 0 0 0 1px #${tag.color}30`
                                    }}
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    {task.description ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg bg-muted/30 p-4">
                            <p className="whitespace-pre-wrap">{task.description}</p>
                        </div>
                    ) : (
                        <p className="italic text-muted-foreground">No description provided.</p>
                    )}

                    {/* Metadata */}
                    <div className="border-t pt-4 text-xs text-muted-foreground space-y-1">
                        <div className="flex gap-1">
                            <span className="font-medium">Created:</span> {formatDateTime(task.created_at)}
                        </div>
                        <div className="flex gap-1">
                            <span className="font-medium">Last Updated:</span> {formatDateTime(task.updated_at)}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this task? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
}
