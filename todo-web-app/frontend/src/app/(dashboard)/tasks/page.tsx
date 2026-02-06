"use client";

/**
 * Tasks List Page
 * Displays all tasks with filtering and sorting
 * @module app/(dashboard)/tasks/page
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { TbPlus as Plus } from "react-icons/tb";
import { Button } from "@/components/lightswind/button";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskList } from "@/components/tasks/TaskList";
import { useTasksQuery } from "@/hooks/useTasks";
import { useTaskStore } from "@/stores/taskStore";

export default function TasksPage() {
    const { status, sortBy, sortOrder, searchQuery, tagIds } = useTaskStore();

    const { data, isLoading } = useTasksQuery({
        status: status === "all" ? undefined : status,
        sort_by: sortBy,
        order: sortOrder,
        search: searchQuery || undefined,
        tags: tagIds.length > 0 ? tagIds : undefined,
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Tasks</h1>
                    <p className="text-sm text-muted-foreground">Manage and organize your tasks</p>
                </div>
                <Link href="/tasks/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">New Task</span>
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <TaskFilters />

            {/* Task List */}
            <TaskList
                tasks={data?.data}
                isLoading={isLoading}
                emptyMessage={
                    searchQuery
                        ? `No tasks matching "${searchQuery}"`
                        : status !== "all"
                            ? `No ${status.replace("_", " ")} tasks`
                            : "No tasks yet"
                }
            />

            {/* Pagination info */}
            {data && data.total > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                    Showing {data.data.length} of {data.total} tasks
                </div>
            )}
        </motion.div>
    );
}
