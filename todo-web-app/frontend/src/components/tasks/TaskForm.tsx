"use client";

/**
 * Task Form Component
 * Create/Edit task form with React Hook Form + Zod validation
 * @module components/tasks/TaskForm
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { LuLoaderPinwheel as Loader2 } from "react-icons/lu";
import { TbCalendarMonth as CalendarIcon } from "react-icons/tb";
import { toast } from "sonner";
import { Button } from "@/components/lightswind/button";
import Calendar from "@/components/lightswind/calendar";
import { Input } from "@/components/lightswind/input";
import { Label } from "@/components/lightswind/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/lightswind/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/lightswind/select";
import { Textarea } from "@/components/lightswind/textarea";
import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { type TaskFormData, taskSchema } from "@/lib/schemas/task";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { ConfettiButton, type ConfettiButtonHandle } from "../lightswind/confetti-button";

interface TaskFormProps {
    task?: Task;
    onSuccess?: () => void;
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
    const router = useRouter();
    const isEditing = !!task;
    const confettiRef = useRef<ConfettiButtonHandle>(null);

    const createTask = useCreateTask();
    const updateTask = useUpdateTask();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: task?.title || "",
            description: task?.description || "",
            status: task?.status || "todo",
            priority: task?.priority || "medium",
            due_date: task?.due_date || null,
        },
    });

    const selectedDate = watch("due_date");

    const onSubmit = async (data: TaskFormData) => {
        try {
            if (isEditing && task) {
                await updateTask.mutateAsync({
                    id: task.id,
                    data: {
                        title: data.title,
                        description: data.description,
                        status: data.status,
                        priority: data.priority,
                        due_date: data.due_date,
                        // Keep completed synced with status for backward compatibility if needed,
                        // but backend should handle source of truth.
                        completed: data.status === "completed",
                    },
                });
                toast.success("Task updated successfully");
            } else {
                await createTask.mutateAsync({
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    priority: data.priority,
                    due_date: data.due_date,
                });
                toast.success("Task created successfully");
            }

            onSuccess?.();
            confettiRef.current?.triggerConfetti();
            if (isEditing && task) {
                router.push(`/tasks/${task.id}`);
            } else {
                router.push("/tasks");
            }
        } catch {
            toast.error(isEditing ? "Failed to update task" : "Failed to create task");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="What needs to be done?" {...register("title")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                    id="description"
                    placeholder="Add more details about this task..."
                    rows={4}
                    {...register("description")}
                />
                {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
            </div>

            {/* Status and Priority */}
            <div className="grid gap-4 sm:grid-cols-2">
                {/* Status */}
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={watch("status")}
                        onValueChange={(value) => setValue("status", value as TaskFormData["status"])}
                    >
                        <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                        value={watch("priority")}
                        onValueChange={(value) => setValue("priority", value as TaskFormData["priority"])}
                    >
                        <SelectTrigger id="priority">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
                <Label>Due Date (optional)</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground",
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(new Date(selectedDate), "PPP") : "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={selectedDate ? new Date(selectedDate) : undefined}
                            onSelect={(date) => setValue("due_date", date ? date.toISOString() : null)}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <ConfettiButton
                    ref={confettiRef}
                    manual
                    confettiOptions={{
                        particleCount: 400,
                        spread: 150
                    }} type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEditing ? "Updating..." : "Creating..."}
                        </>
                    ) : isEditing ? (
                        "Update Task"
                    ) : (
                        "Create Task"
                    )}
                </ConfettiButton>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
