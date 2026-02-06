/**
 * Zustand store for Tag state management
 * @module stores/tagStore
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Tag, TagCreate, TagUpdate } from "@/types/tag";
import { getTags, createTag, updateTag, deleteTag } from "@/lib/api/tags";

interface TagState {
	// State
	tags: Tag[];
	isLoading: boolean;
	error: string | null;

	// Actions
	fetchTags: () => Promise<void>;
	addTag: (tag: TagCreate) => Promise<void>;
	updateTag: (id: number, updates: TagUpdate) => Promise<void>;
	deleteTag: (id: number) => Promise<void>;
}

export const useTagStore = create<TagState>()(
	devtools(
		(set, get) => ({
			tags: [],
			isLoading: false,
			error: null,

			fetchTags: async () => {
				set({ isLoading: true, error: null });
				try {
					const tags = await getTags();
					set({ tags, isLoading: false });
				} catch (error) {
					console.error("Failed to fetch tags:", error);
					set({
						error: error instanceof Error ? error.message : "Failed to fetch tags",
						isLoading: false,
					});
				}
			},

			addTag: async (tagData: TagCreate) => {
				const previousTags = get().tags;
				// Optimistic update
				// We create a temporary ID (negative to avoid collision) for display
				// Use safe negative int32 for temp ID to avoid postgres overflow
				// Range: -1 to -1,000,000,000 (safe within -2.14B limit)
				const tempId = -Math.floor(Math.random() * 1000000000) - 1;
				const optimisitcTag: Tag = {
					id: tempId,
					user_id: "current-user", // Placeholder
					name: tagData.name,
					color: tagData.color || "3B82F6",
					created_at: new Date().toISOString(),
				};

				set({ tags: [...previousTags, optimisitcTag] });

				try {
					const newTag = await createTag(tagData);
					// Replace optimistic tag with real one
					set((state) => ({
						tags: state.tags.map((t) => (t.id === tempId ? newTag : t)),
					}));
				} catch (error) {
					// Revert on failure
					console.error("Failed to create tag:", error);
					set({ tags: previousTags, error: "Failed to create tag" });
				}
			},

			updateTag: async (id: number, updates: TagUpdate) => {
				const previousTags = get().tags;

				// Optimistic update
				set((state) => ({
					tags: state.tags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
				}));

				try {
					const updatedTag = await updateTag(id, updates);
					// Ensure we have exact server data
					set((state) => ({
						tags: state.tags.map((t) => (t.id === id ? updatedTag : t)),
					}));
				} catch (error) {
					// Revert
					console.error("Failed to update tag:", error);
					set({ tags: previousTags, error: "Failed to update tag" });
				}
			},

			deleteTag: async (id: number) => {
				const previousTags = get().tags;

				// Optimistic update
				set((state) => ({
					tags: state.tags.filter((t) => t.id !== id),
				}));

				try {
					await deleteTag(id);
				} catch (error) {
					// Revert
					console.error("Failed to delete tag:", error);
					set({ tags: previousTags, error: "Failed to delete tag" });
				}
			},
		}),
		{ name: "tag-store" },
	),
);
