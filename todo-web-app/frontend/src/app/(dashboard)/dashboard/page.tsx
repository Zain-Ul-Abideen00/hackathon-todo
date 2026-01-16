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
import { useTasksQuery } from "@/hooks/useTasks";
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
	const { data: tasksData, isLoading } = useTasksQuery({ limit: 5 });

	const stats = [
		{
			label: "Total Tasks",
			value: tasksData?.total || 0,
			icon: FiTrendingUp,
			color: "text-blue-500",
			bg: "bg-blue-500/10",
		},
		{
			label: "Completed",
			value: tasksData?.data?.filter((t) => t.completed).length || 0,
			icon: FiCheckCircle,
			color: "text-green-500",
			bg: "bg-green-500/10",
		},
		{
			label: "In Progress",
			value: tasksData?.data?.filter((t) => t.status === "in_progress").length || 0,
			icon: FiClock,
			color: "text-yellow-500",
			bg: "bg-yellow-500/10",
		},
		{
			label: "Overdue",
			value:
				tasksData?.data?.filter((t) => {
					if (!t.due_date) return false;
					return new Date(t.due_date) < new Date() && !t.completed;
				}).length || 0,
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

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Component complexity is managed via extraction, remaining complexity is necessary logic
	const renderRecentTasks = () => {
		if (isLoading) {
			return (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div key={i} className="flex items-center gap-3">
							<div className="h-5 w-5 animate-pulse rounded bg-muted" />
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
				<div className="space-y-3">
					{tasksData.data.slice(0, 5).map((task) => (
						<Link
							key={task.id}
							href={`/tasks/${task.id}/edit`}
							className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted"
						>
							<div
								className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
									task.completed ? "border-green-500 bg-green-500" : "border-border"
								}`}
							>
								{task.completed && <FiCheckCircle className="h-3 w-3 text-white" />}
							</div>
							<div className="flex-1 min-w-0">
								<p
									className={`truncate font-medium ${
										task.completed ? "text-muted-foreground line-through" : ""
									}`}
								>
									{task.title}
								</p>
								{task.due_date && (
									<p className="text-xs text-muted-foreground">
										Due: {new Date(task.due_date).toLocaleDateString()}
									</p>
								)}
							</div>
							<span
								className={`rounded-full px-2 py-0.5 text-xs ${
									task.priority === "high"
										? "bg-red-500/10 text-red-500"
										: task.priority === "medium"
											? "bg-yellow-500/10 text-yellow-500"
											: "bg-green-500/10 text-green-500"
								}`}
							>
								{task.priority}
							</span>
						</Link>
					))}
				</div>
			);
		}

		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">No tasks yet</p>
				<Link href="/tasks/new">
					<Button className="mt-4 gap-2">
						<Plus className="h-4 w-4" />
						Create your first task
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
				{stats.map((stat, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: stats array is static and stable
					<Card key={index} className="overflow-hidden">
						<CardContent className="flex items-center gap-4 p-6">
							<div className={`rounded-lg p-3 ${stat.bg}`}>
								<stat.icon className={`h-6 w-6 ${stat.color}`} />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">{stat.label}</p>
								<p className="text-2xl font-bold">{stat.value}</p>
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
