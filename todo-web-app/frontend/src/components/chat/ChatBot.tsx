"use client";

import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useChatStore, syncThemeFromDocument } from "@/stores/chatStore";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import styles from "./chat.module.css";
import {
    CHATKIT_API_URL,
    CHATKIT_DOMAIN_KEY,
    GREETING,
    STARTER_PROMPTS,
    TOOL_CHOICES,
    FONT_SOURCES,
    getPlaceholder,
    MODEL_CHOICES,
    DISCLAIMER,
} from "./config";


interface ChatKitSessionProps {
    storageKey: string;
    config: { url: string; domainKey: string };
    token?: string;
}

/**
 * Inner component that handles a specific chat session
 * By keying this component, we ensure useChatKit is completely reset when the user changes
 */
const ChatKitSession: React.FC<ChatKitSessionProps> = ({ storageKey, config, token }) => {
    // Zustand store for chat state
    const scheme = useChatStore((state) => state.scheme);
    const setScheme = useChatStore((state) => state.setScheme);
    const isChatOpen = useChatStore((state) => state.isChatOpen);
    const setIsChatOpen = useChatStore((state) => state.setIsChatOpen);
    const storedThreadId = useChatStore((state) => state.threadId);
    const setStoredThreadId = useChatStore((state) => state.setThreadId);

    // Initialize with stored thread ID
    const [initialThread] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        // First check Zustand store (persisted)
        if (storedThreadId) return storedThreadId;
        // Fallback to localStorage for backwards compatibility
        const saved = localStorage.getItem(storageKey);
        if (saved) return saved;
        return null;
    });

    // Sync theme from document on mount and observe changes
    useEffect(() => {
        // Initial sync
        syncThemeFromDocument();

        // Observe document class changes for theme sync
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.classList.contains("dark");
            setScheme(isDark ? "dark" : "light");
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => observer.disconnect();
    }, [setScheme]);

    // Define custom fetch to inject Authorization header
    const customFetch: typeof fetch = useCallback(async (input, init) => {
        const headers = new Headers(init?.headers);
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return fetch(input, { ...init, headers });
    }, [token]);

    // Track active thread for dynamic placeholder
    const [hasActiveThread, setHasActiveThread] = useState(!!initialThread);

    // Memoized placeholder
    const placeholder = useMemo(() => getPlaceholder(hasActiveThread), [hasActiveThread]);

    const { control, setThreadId } = useChatKit({
        api: {
            ...config,
            fetch: customFetch
        },
        initialThread,
        theme: {
            colorScheme: scheme,
            radius: 'pill',
            density: 'spacious',
            color: {
                grayscale: {
                    hue: 40,
                    tint: scheme === 'dark' ? 4 : 9,
                    shade: scheme === 'dark' ? -1 : 3,
                },
                accent: {
                    primary: '#a7896c',
                    level: 3,
                },
            },
            typography: {
                baseSize: 18,
                fontFamily: 'Texturina, Lora, inter, system-ui, sans-serif',
                fontSources: FONT_SOURCES,
            },
        },
        header: {
            enabled: true,
            rightAction: {
                icon: 'close',
                onClick: () => setIsChatOpen(false),
            },
        },
        startScreen: {
            greeting: GREETING,
            prompts: STARTER_PROMPTS,
        },
        composer: {
            placeholder,
            attachments: { enabled: false },
            tools: TOOL_CHOICES,
            models: MODEL_CHOICES,
        },
        threadItemActions: {
            feedback: true,
            retry: true,
        },
        disclaimer: DISCLAIMER,
        onThreadChange: ({ threadId }) => {
            setHasActiveThread(!!threadId);
            if (threadId) {
                // Sync to Zustand store (persisted)
                setStoredThreadId(threadId);
                // Also store in localStorage for backwards compatibility
                if (typeof window !== "undefined") {
                    localStorage.setItem(storageKey, threadId);
                }
            }
        },
        onError: ({ error }) => {
            console.error("ChatKit error", error);
        },
    });

    // Always sync with latest server state on mount
    useEffect(() => {
        const restoreLatestThread = async () => {
            if (!token) return;

            try {
                const response = await customFetch(config.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'threads.list',
                        params: { limit: 1, order: 'desc' }
                    })
                });

                if (!response.ok) return;

                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    const latestThreadId = data.data[0].id;
                    // Always switch to latest thread on startup
                    setThreadId(latestThreadId);
                    setStoredThreadId(latestThreadId);
                    localStorage.setItem(storageKey, latestThreadId);
                } else {
                    // No threads found - ensure we show start screen
                    setThreadId(null);
                    setStoredThreadId(null);
                    localStorage.removeItem(storageKey);
                }
            } catch (e) {
                console.error('[ChatKitSession] Failed to restore thread:', e);
            }
        };

        restoreLatestThread();
    }, [token, config.url, customFetch, storageKey, setThreadId, setStoredThreadId]);

    return (
        <div className="h-full w-full">
            <ChatKit control={control} className={styles.chatkitFull} />
        </div>
    );
};

export function ChatBot() {
    const session = useSession();
    const pathname = usePathname();
    const [jwtToken, setJwtToken] = useState<string | null>(null);

    const userId = session.data?.user?.id;

    // Fetch JWT token from /api/token endpoint when authenticated
    useEffect(() => {
        const fetchToken = async () => {
            if (!session.data?.user) {
                setJwtToken(null);
                return;
            }
            try {
                const res = await fetch("/api/token");
                if (res.ok) {
                    const { token } = await res.json();
                    setJwtToken(token);
                } else {
                    setJwtToken(null);
                }
            } catch (e) {
                console.error("[ChatBot] Failed to fetch JWT:", e);
                setJwtToken(null);
            }
        };
        fetchToken();
    }, [session.data?.user]);

    // Don't render until we know user state
    if (session.isPending) return null;

    // Key ChatKitSession by storageKey to force remount/reset on user change
    const storageKey = userId
        ? `chatkit_thread_user_${userId}`
        : "chatkit_thread_anonymous";

    return (
        <ChatKitSession
            key={storageKey}
            storageKey={storageKey}
            config={{ url: CHATKIT_API_URL, domainKey: CHATKIT_DOMAIN_KEY }}
            token={jwtToken || undefined}
        />
    );
}

export default ChatBot;
