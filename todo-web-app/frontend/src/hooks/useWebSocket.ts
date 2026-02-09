/**
 * useWebSocket - Real-time WebSocket connection hook
 *
 * Connects to the websocket-service for real-time task updates.
 * Pushes updates to notification store when events are received.
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSession } from "@/lib/auth-client";

type WebSocketMessage = {
    type: string;
    event?: string;
    task_id?: number;
    title?: string;
    timestamp?: string;
    data?: unknown;
};

type WebSocketOptions = {
    /** Callback when task update received */
    onTaskUpdate?: (data: WebSocketMessage) => void;
    /** Enable auto-reconnect on disconnect */
    autoReconnect?: boolean;
    /** Reconnect delay in ms */
    reconnectDelay?: number;
};

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8004";

export function useWebSocket(options: WebSocketOptions = {}) {
    const { autoReconnect = true, reconnectDelay = 3000, onTaskUpdate } = options;
    const { data: session } = useSession();
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

    const connect = useCallback(() => {
        if (!session?.user?.id) return;

        // Close existing connection if any (prevents race condition on refresh)
        if (wsRef.current) {
            wsRef.current.onclose = null; // Prevent reconnect loop
            wsRef.current.close();
            wsRef.current = null;
        }

        const userId = session.user.id;
        const wsUrl = `${WS_BASE_URL}/ws/${userId}`;

        try {
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("🔌 WebSocket connected");
            };

            ws.onmessage = (event) => {
                try {
                    const data: WebSocketMessage = JSON.parse(event.data);

                    if (data.type === "task_update" && onTaskUpdate) {
                        onTaskUpdate(data);
                    }
                } catch (err) {
                    console.error("WebSocket message parse error:", err);
                }
            };

            ws.onclose = (event) => {
                // Only log and reconnect if it wasn't a clean close
                if (event.code !== 1000) {
                    console.log("🔌 WebSocket disconnected (code:", event.code + ")");
                }
                wsRef.current = null;

                if (autoReconnect && event.code !== 1000) {
                    reconnectTimeout.current = setTimeout(connect, reconnectDelay);
                }
            };

            ws.onerror = () => {
                // Don't log error details - the onclose handler will fire after this
                // and provide the actual close code
            };

            wsRef.current = ws;
        } catch (err) {
            console.error("WebSocket connection error:", err);
        }
    }, [session?.user?.id, autoReconnect, reconnectDelay, onTaskUpdate]);

    // Connect when session available
    useEffect(() => {
        if (session?.user?.id) {
            connect();
        }

        return () => {
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [session?.user?.id, connect]);

    const send = useCallback((message: unknown) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);

    return {
        isConnected: wsRef.current?.readyState === WebSocket.OPEN,
        send,
    };
}
