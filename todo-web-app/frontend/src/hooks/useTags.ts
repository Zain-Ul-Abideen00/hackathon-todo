"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as tagsApi from "@/lib/api/tags";
import { tagKeys } from "@/lib/queries/keys";
import type { Tag, TagCreate, TagUpdate } from "@/types/tag";
import { toast } from "sonner";

/**
 * Hook to fetch all user tags
 */
export function useTagsQuery() {
    return useQuery({
        queryKey: tagKeys.lists(),
        queryFn: () => tagsApi.getTags(),
    });
}

/**
 * Hook to create a new tag
 */
export function useCreateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TagCreate) => tagsApi.createTag(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
            toast.success("Tag created");
        },
        onError: () => {
            toast.error("Failed to create tag");
        },
    });
}

/**
 * Hook to update a tag
 */
export function useUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: TagUpdate }) => tagsApi.updateTag(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
            toast.success("Tag updated");
        },
        onError: () => {
            toast.error("Failed to update tag");
        },
    });
}

/**
 * Hook to delete a tag
 */
export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => tagsApi.deleteTag(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tagKeys.lists() });
            toast.success("Tag deleted");
        },
        onError: () => {
            toast.error("Failed to delete tag");
        },
    });
}
