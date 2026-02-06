/**
 * Zustand store for Notification state management
 * @module stores/notificationStore
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Notification } from "@/types/notification";
import {
	getNotifications,
	markAsRead,
	markAllAsRead,
	deleteNotification,
} from "@/lib/api/notifications";

interface NotificationState {
	// State
	notifications: Notification[];
	unreadCount: number;
	isLoading: boolean;
	error: string | null;

	// Actions
	fetchNotifications: (unreadOnly?: boolean) => Promise<void>;
	markAsRead: (id: number) => Promise<void>;
	markAllAsRead: () => Promise<void>;
	deleteNotification: (id: number) => Promise<void>;
	addNotification: (notification: Notification) => void; // For real-time push
}

// Module-level set to track pending deletions (optimistic UI pattern)
// Prevents deleted items from reappearing during race conditions with polling
const pendingDeleteIds = new Set<number>();

export const useNotificationStore = create<NotificationState>()(
    devtools(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,
            isLoading: false,
            error: null,

            fetchNotifications: async (unreadOnly = false) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await getNotifications(unreadOnly);

                    // Filter out any items currently being deleted
                    const safeItems = response.items.filter(n => !pendingDeleteIds.has(n.id));

                    set({
                        notifications: safeItems,
                        unreadCount: response.unread_count,
                        isLoading: false,
                    });
                } catch (error) {
                    console.error("Failed to fetch notifications:", error);
                    set({
                        error: error instanceof Error ? error.message : "Failed to fetch notifications",
                        isLoading: false,
                    });
                }
            },

            markAsRead: async (id: number) => {
                const previousState = get();

                // Optimistic update
                set((state) => {
                    const target = state.notifications.find((n) => n.id === id);
                    if (!target || target.is_read) return state; // No change needed

                    return {
                        notifications: state.notifications.map((n) =>
                            n.id === id ? { ...n, is_read: true } : n,
                        ),
                        unreadCount: Math.max(0, state.unreadCount - 1),
                    };
                });

                try {
                    await markAsRead(id);
                } catch (error) {
                    console.error("Failed to mark notification as read:", error);
                    set(previousState); // Revert entire state
                }
            },

            markAllAsRead: async () => {
                const previousState = get();

                // Optimistic update
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
                    unreadCount: 0,
                }));

                try {
                    await markAllAsRead();
                } catch (error) {
                    console.error("Failed to mark all notifications as read:", error);
                    set(previousState);
                }
            },

            deleteNotification: async (id: number) => {
                const previousState = get();

                // Track pending delete
                pendingDeleteIds.add(id);

                // Optimistic update
                set((state) => {
                    const target = state.notifications.find((n) => n.id === id);
                    const decrement = target && !target.is_read ? 1 : 0;

                    return {
                        notifications: state.notifications.filter((n) => n.id !== id),
                        unreadCount: Math.max(0, state.unreadCount - decrement),
                    };
                });

                try {
                    await deleteNotification(id);
                    // Remove from pending set only after success (or failure handles revert)
                    pendingDeleteIds.delete(id);
                } catch (error) {
                    console.error("Failed to delete notification:", error);
                    pendingDeleteIds.delete(id);
                    set(previousState);
                }
            },

            // Helper for real-time events (e.g. WebSocket or SSE)
            addNotification: (notification: Notification) => {
                // Don't add if it's pending delete (rare edge case)
                if (pendingDeleteIds.has(notification.id)) return;

                set((state) => ({
                    notifications: [notification, ...state.notifications],
                    unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
                }));
            },
        }),
        { name: "notification-store" },
    ),
);
