"use client";

import { useSession } from "@/lib/auth-client";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useCallback, useEffect, useState } from "react";
import { TbMessageChatbot } from "react-icons/tb";

// Environment variables
const CHATKIT_URL = process.env.NEXT_PUBLIC_CHATKIT_URL || "http://localhost:8000/api/chat";
const CHATKIT_DOMAIN_KEY = process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || "localhost";

interface ChatKitSessionProps {
    storageKey: string;
    config: { url: string; domainKey: string };
    token?: string;
}

// Inner component that handles a specific chat session
// By keying this component, we ensure useChatKit is completely reset when the user changes
const ChatKitSession: React.FC<ChatKitSessionProps> = ({ storageKey, config, token }) => {
    // Always initialize with a thread ID from storage if available, otherwise null (New Thread)
    const [initialThread] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            return saved;
        }
        return null;
    });

    const [isChatOpen, setIsChatOpen] = useState(false);

    // Define custom fetch to inject Authorization header
    // ChatKit generic types for fetch are compatible with window.fetch
    const customFetch: typeof fetch = useCallback(async (input, init) => {
        const headers = new Headers(init?.headers);
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return fetch(input, { ...init, headers });
    }, [token]);

    const { control, setThreadId } = useChatKit({
        api: {
            ...config,
            fetch: customFetch
        },
        initialThread,
        theme: {
            colorScheme: 'light',
            radius: 'pill',
            density: 'spacious',
            color: {
                grayscale: {
                    hue: 34,
                    tint: 9,
                    shade: 3
                },
                accent: {
                    primary: '#a7896c',
                    level: 3
                }
            },
            typography: {
                baseSize: 16,
                fontFamily: 'Geist Sans, sans-serif',
            }
        },
        startScreen: {
            greeting: "Hi! I'm here to help you get things done.",
            prompts: [
                { icon: 'write', label: 'Plan', prompt: 'Draft a plan for my project' },
                { icon: 'book-open', label: 'Tasks', prompt: 'Suggest tasks for organizing my week' },
                { icon: 'search', label: 'Help', prompt: 'How do I use the calendar view?' }
            ],
        },
        composer: {
            placeholder: 'Ask about your tasks...',
            attachments: { enabled: false },
            tools: [],
        },
        onThreadChange: ({ threadId }) => {
            if (typeof window !== "undefined" && threadId) {
                localStorage.setItem(storageKey, threadId);
            }
        },
    });

    // Restore latest thread for authenticated users if starting new
    useEffect(() => {
        const restoreLatestThread = async () => {
            // Only attempt restore if:
            // 1. User is authenticated (token exists)
            // 2. We are currently in "New Thread" mode (initialThread was null)
            // 3. We haven't already loaded a thread (check current thread via control?)
            if (!token || initialThread) return;

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
                    setThreadId(latestThreadId);
                    // Update storage so next reload uses it immediately
                    localStorage.setItem(storageKey, latestThreadId);
                }
            } catch (e) {
                console.error('[ChatKitSession] Failed to restore thread:', e);
            }
        };

        restoreLatestThread();
    }, [token, initialThread, config.url, customFetch, control, storageKey, setThreadId]);

    return (
        <>
            {/* Floating Launcher Button */}
            {!isChatOpen && (
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-8 right-8 z-50 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-background border-2 border-[rgba(167,137,108,0.3)] shadow-[0_8px_30px_rgba(167,137,108,0.3)] transition-all hover:-translate-y-0.5 hover:scale-110 hover:border-[#A7896C] hover:shadow-[0_12px_40px_rgba(167,137,108,0.5)] animate-[pulseGlow_3s_infinite]"
                    aria-label="Open Chat"
                >
                    <TbMessageChatbot className="text-[#A7896C] text-[34px] drop-shadow-[0_0_2px_rgba(167,137,108,0.4)] transition-transform duration-500 hover:rotate-[15deg] hover:scale-110" />
                </button>
            )}

            {/* Widget Container */}
            <AnimatePresence>
                {isChatOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            onClick={() => setIsChatOpen(false)}
                            className="fixed inset-0 z-[999] bg-black/10 backdrop-blur-[4px]"
                        />

                        {/* Widget */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="fixed bottom-8 right-8 z-[1000] flex h-[600px] w-[420px] max-h-[calc(100vh-4rem)] max-w-[calc(100vw-4rem)] flex-col overflow-hidden rounded-[24px] bg-background shadow-[0_20px_60px_rgba(0,0,0,0.1)] md:max-w-[420px] xs:bottom-0 xs:right-0 xs:w-full xs:h-full xs:max-w-none xs:max-h-none xs:rounded-none"
                            // Inline style override for mobile media query equivalent not fully covered by Tailwind 'xs' custom utility
                            style={{
                                // Logic handled by util classes + custom media query below
                            }}
                        >
                            <style jsx global>{`
                                @keyframes pulseGlow {
                                    0% { box-shadow: 0 0 0 0 rgba(167, 137, 108, 0.4); }
                                    70% { box-shadow: 0 0 0 15px rgba(167, 137, 108, 0); }
                                    100% { box-shadow: 0 0 0 0 rgba(167, 137, 108, 0); }
                                }
                                @media (max-width: 480px) {
                                  .chatkit-widget-mobile {
                                    /* Force full screen on mobile */
                                    position: fixed !important;
                                    bottom: 0 !important;
                                    right: 0 !important;
                                    width: 100vw !important; /** Force viewport width */
                                    height: 100vh !important; /** Force viewport height */
                                    max-width: none !important;
                                    max-height: none !important;
                                    border-radius: 0 !important;
                                  }
                                }
                            `}</style>
                            <div className="flex-1 relative overflow-hidden chatkit-widget-mobile">
                                <ChatKit control={control} className="h-full w-full" />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export function ChatBot() {
    const session = useSession();
    const [jwtToken, setJwtToken] = useState<string | null>(null);

    const userId = session.data?.user?.id;

    // Fetch JWT token from /api/token endpoint when authenticated
    // Better Auth doesn't expose raw JWT in session.data - we must fetch it
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
            config={{ url: CHATKIT_URL, domainKey: CHATKIT_DOMAIN_KEY }}
            token={jwtToken || undefined}
        />
    );
}

export default ChatBot;
