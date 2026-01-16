"use client";

/**
 * Task Filters Component
 * Filter tabs and sort controls for task list
 * @module components/tasks/TaskFilters
 */

import {
	TbArrowsSort as ArrowUpDown,
	TbLayoutGrid as Grid,
	TbListDetails as List,
} from "react-icons/tb";
import { Button } from "@/components/lightswind/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/lightswind/select";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/stores/taskStore";
import type { FilterStatus, SortBy } from "@/types/task";

const filterTabs: { value: FilterStatus; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "todo", label: "To Do" },
	{ value: "in_progress", label: "In Progress" },
	{ value: "completed", label: "Completed" },
	{ value: "overdue", label: "Overdue" },
];

const sortOptions: { value: SortBy; label: string }[] = [
	{ value: "created_at", label: "Date Created" },
	{ value: "due_date", label: "Due Date" },
	{ value: "priority", label: "Priority" },
	{ value: "title", label: "Title" },
];

export function TaskFilters() {
	const { status, setStatus, sortBy, setSortBy, sortOrder, setSortOrder, viewMode, setViewMode } =
		useTaskStore();

	return (
		<div className="space-y-4">
			{/* Filter Tabs - Horizontal scrollable on mobile */}
			<div className="overflow-x-auto pb-2">
				<div className="flex gap-2">
					{filterTabs.map((tab) => (
						<Button
							key={tab.value}
							variant={status === tab.value ? "default" : "outline"}
							size="sm"
							onClick={() => setStatus(tab.value)}
							className={cn("shrink-0", status === tab.value && "pointer-events-none")}
						>
							{tab.label}
						</Button>
					))}
				</div>
			</div>

			{/* Sort and View Controls */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					{/* Sort By */}
					<Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
						<SelectTrigger className="w-40">
							<SelectValue placeholder="Sort by" />
						</SelectTrigger>
						<SelectContent>
							{sortOptions.map((option) => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{/* Sort Order */}
					<Button
						variant="outline"
						size="icon"
						onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
						title={sortOrder === "asc" ? "Ascending" : "Descending"}
					>
						<ArrowUpDown
							className={cn("h-4 w-4 transition-transform", sortOrder === "desc" && "rotate-180")}
						/>
					</Button>
				</div>

				{/* View Mode */}
				<div className="flex items-center gap-1 rounded-lg border border-border p-1">
					<Button
						variant={viewMode === "grid" ? "default" : "ghost"}
						size="icon"
						className="h-8 w-8"
						onClick={() => setViewMode("grid")}
					>
						<Grid className="h-4 w-4" />
					</Button>
					<Button
						variant={viewMode === "list" ? "default" : "ghost"}
						size="icon"
						className="h-8 w-8"
						onClick={() => setViewMode("list")}
					>
						<List className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
