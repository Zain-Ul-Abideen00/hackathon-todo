/**
 * Zustand store for task filter state
 * @module stores/taskStore
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FilterStatus, SortBy, SortOrder, ViewMode } from "@/types/task";

interface TaskFilterState {
	// Filter state
	status: FilterStatus;
	sortBy: SortBy;
	sortOrder: SortOrder;
	viewMode: ViewMode;
	searchQuery: string;

	// Actions
	setStatus: (status: FilterStatus) => void;
	setSortBy: (sortBy: SortBy) => void;
	setSortOrder: (order: SortOrder) => void;
	setViewMode: (mode: ViewMode) => void;
	setSearchQuery: (query: string) => void;
	resetFilters: () => void;
}

const defaultState = {
	status: "all" as FilterStatus,
	sortBy: "created_at" as SortBy,
	sortOrder: "desc" as SortOrder,
	viewMode: "grid" as ViewMode,
	searchQuery: "",
};

export const useTaskStore = create<TaskFilterState>()(
	persist(
		(set) => ({
			...defaultState,
			setStatus: (status) => set({ status }),
			setSortBy: (sortBy) => set({ sortBy }),
			setSortOrder: (sortOrder) => set({ sortOrder }),
			setViewMode: (viewMode) => set({ viewMode }),
			setSearchQuery: (searchQuery) => set({ searchQuery }),
			resetFilters: () => set(defaultState),
		}),
		{
			name: "task-filters",
		},
	),
);
