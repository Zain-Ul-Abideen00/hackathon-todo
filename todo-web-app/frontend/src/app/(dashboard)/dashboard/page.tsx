"use client";

/**
 * Dashboard Home Page
 * Overview with stats, recent tasks, and quick actions
 * @module app/(dashboard)/dashboard/page
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { FiAlertCircle, FiCheckCircle, FiClock, FiTrendingUp } from "react-icons/fi";
import { TbArrowRightDashed as ArrowRight, TbPlus as Plus } from "react-icons/tb";
import { Button } from "@/components/lightswind/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/lightswind/card";
import { DashboardTaskItem } from "@/components/tasks/DashboardTaskItem";
import { useTasksQuery, useTaskStats } from "@/hooks/useTasks";
import { useSession } from "@/lib/auth-client";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
    const { data: session } = useSession();
    const { data: tasksData, isLoading: isTasksLoading } = useTasksQuery({ limit: 5 });
    const { data: stats, isLoading: isStatsLoading } = useTaskStats();

    const statsCards = [
        {
            label: "Total Tasks",
            value: stats?.total || 0,
            icon: FiTrendingUp,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            label: "Completed",
            value: stats?.completed || 0,
            icon: FiCheckCircle,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            label: "In Progress",
            value: (stats?.in_progress || 0) + (stats?.todo || 0), // Aggregate or specific? User flow suggests "In Progress" usually means pending
            icon: FiClock,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
        },
        {
            label: "Overdue",
            value: stats?.overdue || 0,
            icon: FiAlertCircle,
            color: "text-red-500",
            bg: "bg-red-500/10",
        },
    ];

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const renderRecentTasks = () => {
        if (isTasksLoading) {
            return (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="h-5 w-5 animate-pulse rounded-full bg-muted" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (tasksData?.data?.length) {
            return (
                <div className="space-y-1">
                    {tasksData.data.slice(0, 5).map((task) => (
                        <DashboardTaskItem key={task.id} task={task} />
                    ))}
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                    <FiCheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">All caught up!</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                    You have no pending tasks. Create a new one to get started.
                </p>
                <Link href="/tasks/new">
                    <Button className="mt-4 gap-2">
                        <Plus className="h-4 w-4" />
                        Create Task
                    </Button>
                </Link>
            </div>
        );
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Welcome Message */}
            <motion.div variants={itemVariants}>
                <h1 className="text-2xl font-bold sm:text-3xl">
                    {greeting()}, {session?.user?.name?.split(" ")[0] || "there"}! 👋
                </h1>
                <p className="mt-1 text-muted-foreground">Here&apos;s an overview of your tasks</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statsCards.map((stat, index) => (
                    <Card key={index} className="overflow-hidden">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className={`rounded-lg p-3 ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold">
                                    {isStatsLoading ? (
                                        <span className="inline-block h-8 w-8 animate-pulse rounded bg-muted align-middle" />
                                    ) : (
                                        stat.value
                                    )}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* Quick Actions & Recent Tasks */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Quick Actions */}
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/tasks/new">
                                <Button className="w-full justify-start gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create New Task
                                </Button>
                            </Link>
                            <Link href="/tasks">
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <FiCheckCircle className="h-4 w-4" />
                                    View All Tasks
                                </Button>
                            </Link>
                            <Link href="/calendar">
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <FiClock className="h-4 w-4" />
                                    View Calendar
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Tasks */}
                <motion.div variants={itemVariants} className="lg:col-span-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Recent Tasks</CardTitle>
                            <Link href="/tasks">
                                <Button variant="ghost" size="sm" className="gap-1">
                                    View all
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>{renderRecentTasks()}</CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
