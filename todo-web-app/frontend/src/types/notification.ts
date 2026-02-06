export interface Notification {
    id: number;
    user_id: string;
    title: string;
    message: string;
    task_id?: number;
    type?: "info" | "success" | "warning" | "error";
    category?: "system" | "reminder" | "task" | "achievement";
    link?: string | null;
    is_read: boolean;
    created_at: string;
}

export interface NotificationListResponse {
    items: Notification[];
    unread_count: number;
}
