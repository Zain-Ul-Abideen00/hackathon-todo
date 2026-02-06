import type { Tag, TagCreate, TagUpdate } from "@/types/tag";
import { api } from "../api";
import { authClient } from "../auth-client";

/**
 * Get user ID from session
 */
async function getUserId(): Promise<string> {
	const session = await authClient.getSession();
	if (!session?.data?.user?.id) {
		throw new Error("User not authenticated");
	}
	return session.data.user.id;
}

/**
 * Get all tags for the user
 */
export async function getTags(): Promise<Tag[]> {
	const userId = await getUserId();
	return api.get<Tag[]>(`/api/${userId}/tags`);
}

/**
 * Create a new tag
 */
export async function createTag(data: TagCreate): Promise<Tag> {
	const userId = await getUserId();
	return api.post<Tag>(`/api/${userId}/tags`, data);
}

/**
 * Update a tag
 */
export async function updateTag(id: number, data: TagUpdate): Promise<Tag> {
	const userId = await getUserId();
	return api.patch<Tag>(`/api/${userId}/tags/${id}`, data);
}

/**
 * Delete a tag
 */
export async function deleteTag(id: number): Promise<void> {
	const userId = await getUserId();
	await api.delete(`/api/${userId}/tags/${id}`);
}
