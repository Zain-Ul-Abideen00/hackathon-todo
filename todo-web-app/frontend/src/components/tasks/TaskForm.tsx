"use client";

/**
 * Task Form Component
 * Create/Edit task form with React Hook Form + Zod validation
 * @module components/tasks/TaskForm
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { LuLoaderPinwheel as Loader2, LuX, LuCalendar as CalendarIcon, LuRepeat as RepeatIcon, LuBell as BellIcon, LuTag as TagIcon, LuFlag as FlagIcon, LuListTodo as StatusIcon, LuType as TitleIcon, LuFileText as DescriptionIcon, LuPlus as PlusIcon } from "react-icons/lu";
import { toast } from "sonner";
import { Button } from "@/components/lightswind/button";
import { Calendar } from "@/components/lightswind/calendar";
import { Input } from "@/components/lightswind/input";
import { Label } from "@/components/lightswind/label";
import { Card, CardContent, CardFooter } from "@/components/lightswind/card";
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
import { TagSelector } from "./TagSelector";
import { RecurringPicker } from "./RecurringPicker";
import { DateTimePicker } from "@/components/ui/date-time-picker";

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
        control,
        formState: { errors, isSubmitting },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema) as any,
        defaultValues: {
            title: task?.title || "",
            description: task?.description || "",
            status: task?.status || "todo",
            priority: task?.priority || "medium",
            due_date: task?.due_date || null,
            tags: (task?.tags?.map((t) => t.id) || []) as number[],
            recurring: task?.recurring_pattern ? {
                pattern: task.recurring_pattern.pattern,
                interval: task.recurring_pattern.interval,
                end_date: task.recurring_pattern.end_date
            } : null,
            reminders: (task?.reminders?.map((r) => ({ remind_at: r.remind_at })) || []) as { remind_at: string }[],
        },
    });

    const {
        fields: reminderFields,
        append: appendReminder,
        remove: removeReminder,
    } = useFieldArray({
        control,
        name: "reminders",
    });

    const selectedDate = watch("due_date");
    const [month, setMonth] = useState<Date>(
        selectedDate ? new Date(selectedDate) : new Date()
    );

    const onSubmit: SubmitHandler<TaskFormData> = async (data) => {
        try {
            if (isEditing && task) {
                // For update, null is valid to clear logic
                await updateTask.mutateAsync({
                    id: task.id,
                    data: {
                        title: data.title,
                        description: data.description,
                        status: data.status,
                        priority: data.priority,
                        due_date: data.due_date,
                        tags: data.tags,
                        recurring: data.recurring,
                        reminders: data.reminders,
                        // Keep completed synced with status for backward compatibility if needed,
                        // but backend should handle source of truth.
                        completed: data.status === "completed",
                    },
                });
                toast.success("Task updated successfully");
            } else {
                // For create, recurring cannot be null, must be undefined or object
                await createTask.mutateAsync({
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    priority: data.priority,
                    due_date: data.due_date,
                    tags: data.tags,
                    recurring: data.recurring || undefined,
                    reminders: data.reminders,
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
                <Label htmlFor="title" className="flex items-center gap-2">
                    <TitleIcon className="h-4 w-4" /> Title
                </Label>
                <Input id="title" placeholder="What needs to be done?" {...register("title")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                    <DescriptionIcon className="h-4 w-4" /> Description (optional)
                </Label>
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
                    <Label htmlFor="status" className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" /> Status
                    </Label>
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
                    <Label htmlFor="priority" className="flex items-center gap-2">
                        <FlagIcon className="h-4 w-4" /> Priority
                    </Label>
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
                <Label className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" /> Due Date (optional)
                </Label>
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
                    <PopoverContent className="p-0 w-auto max-w-[300px]" align="start">
                        <Card className="border-0 shadow-none">
                            <CardContent className="p-4 flex justify-center">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate ? new Date(selectedDate) : undefined}
                                    onSelect={(date) => {
                                        setValue("due_date", date ? format(date, "yyyy-MM-dd'T'HH:mm:ss") : null);
                                        if (date) setMonth(date);
                                    }}
                                    month={month}
                                    onMonthChange={setMonth}
                                    fixedWeeks
                                    initialFocus
                                    className="p-0 [--cell-size:--spacing(9.5)]"
                                />
                            </CardContent>
                            <CardFooter className="flex flex-wrap gap-2 border-t border-muted-foreground/35 p-3 justify-center bg-muted/25">
                                {[
                                    { label: "Today", value: 0 },
                                    { label: "Tomorrow", value: 1 },
                                    { label: "In 3 days", value: 3 },
                                    { label: "In a week", value: 7 },
                                    { label: "In 2 weeks", value: 14 },
                                ].map((preset) => (
                                    <Button
                                        key={preset.value}
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 px-2 text-xs h-7"
                                        onClick={() => {
                                            const newDate = addDays(new Date(), preset.value);
                                            setValue("due_date", format(newDate, "yyyy-MM-dd'T'HH:mm:ss"));
                                            setMonth(newDate);
                                        }}
                                    >
                                        {preset.label}
                                    </Button>
                                ))}
                            </CardFooter>
                        </Card>
                    </PopoverContent>
                </Popover>
                {/* Recurring */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <RepeatIcon className="h-4 w-4" /> Recurring
                    </Label>
                    <div className="flex items-center">
                        <RecurringPicker
                            value={watch("recurring")}
                            onChange={(val) => setValue("recurring", val)}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Reminders */}
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <BellIcon className="h-4 w-4" /> Reminders
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {reminderFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium border border-border">
                            <span>
                                {format(new Date(field.remind_at), "MMM d, h:mm a")}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeReminder(index)}
                                className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                                <LuX className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" type="button" className="h-8 gap-1">
                            <PlusIcon className="h-4 w-4" /> Add Reminder
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <ReminderAdder onAdd={(date) => appendReminder({ remind_at: date.toISOString() })} />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Tags */}
            <div className="flex flex-col space-y-2">
                <Label className="flex items-center gap-2">
                    <TagIcon className="h-4 w-4" /> Tags
                </Label>
                <TagSelector
                    value={watch("tags") || []}
                    onChange={(val) => setValue("tags", val)}
                    variant="outline"
                    className="text-left justify-start"
                />
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

function ReminderAdder({ onAdd }: { onAdd: (date: Date) => void }) {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
        <div className="flex flex-col">
            <DateTimePicker date={date} setDate={setDate} />
            <div className="p-2 border-t flex justify-end bg-muted/25">
                <Button size="sm" onClick={() => date && onAdd(date)} disabled={!date} className="w-full">
                    Set Reminder
                </Button>
            </div>
        </div>
    )
}
