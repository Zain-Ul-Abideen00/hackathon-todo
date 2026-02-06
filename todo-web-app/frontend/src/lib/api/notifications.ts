import { api } from "../api";
import { authClient } from "../auth-client";
import type { Notification, NotificationListResponse } from "@/types/notification";

async function getUserId(): Promise<string> {
    const session = await authClient.getSession();
    if (!session?.data?.user?.id) {
        throw new Error("User not authenticated");
    }
    return session.data.user.id;
}

export async function getNotifications(unreadOnly = false): Promise<NotificationListResponse> {
    const userId = await getUserId();
    return api.get<NotificationListResponse>(`/api/${userId}/notifications?unread_only=${unreadOnly}`);
}

export async function markAsRead(id: number): Promise<Notification> {
    const userId = await getUserId();
    return api.patch<Notification>(`/api/${userId}/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<{ updated_count: number }> {
    const userId = await getUserId();
    return api.patch<{ updated_count: number }>(`/api/${userId}/notifications/read-all`);
}

export async function deleteNotification(id: number): Promise<void> {
    const userId = await getUserId();
    await api.delete(`/api/${userId}/notifications/${id}`);
}

export async function createNotification(title: string, message: string): Promise<Notification> {
    const userId = await getUserId();
    return api.post<Notification>(`/api/${userId}/notifications`, { title, message });
}
