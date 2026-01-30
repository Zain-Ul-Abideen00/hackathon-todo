"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { TbMessageChatbot } from "react-icons/tb";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./chat.module.css";
import { useChatStore } from "@/stores/chatStore";
import { LuLoaderPinwheel } from "react-icons/lu";

// Lazy load the real ChatBot component
const ChatBot = dynamic(() => import("./ChatBot"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-background/50">
            <LuLoaderPinwheel className="h-8 w-8 animate-spin text-primary" />
        </div>
    ),
});

export function ChatWidgetFacade() {
    const [isLoaded, setIsLoaded] = useState(false);
    const pathname = usePathname();
    const isChatOpen = useChatStore((state) => state.isChatOpen);
    const setIsChatOpen = useChatStore((state) => state.setIsChatOpen);

    // Initial load check - if chat was left open, load the bundle immediately
    useEffect(() => {
        if (isChatOpen) {
            setIsLoaded(true);
        }
    }, [isChatOpen]);

    const handleInteraction = () => {
        if (!isLoaded) setIsLoaded(true);
        setIsChatOpen(true);
    };

    // Check if we are on a dashboard page to hide the floating launcher on mobile
    const isDashboard = pathname?.startsWith("/dashboard") ||
        pathname?.startsWith("/tasks") ||
        pathname?.startsWith("/calendar") ||
        pathname?.startsWith("/settings");

    return (
        <>
            {/* Master Launcher Button - Always Present (unless chat is open) */}
            <AnimatePresence>
                {!isChatOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            boxShadow: [
                                "0 0 0 0 rgba(167, 137, 108, 0.4)",
                                "0 0 0 15px rgba(167, 137, 108, 0)",
                                "0 0 0 0 rgba(167, 137, 108, 0)"
                            ]
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                            boxShadow: {
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            },
                            scale: { duration: 0.3 }
                        }}
                        onClick={handleInteraction}
                        className={`${styles.launcherBtn} ${isDashboard ? styles.hiddenOnMobile : ''}`}
                        aria-label="Open Chat"
                    >
                        <TbMessageChatbot className={styles.chatIcon} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Main Chat Window - Always Rendered but Hidden/Shown */}
            <AnimatePresence>
                {isChatOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsChatOpen(false)}
                            className={styles.backdrop}
                        />

                        {/* Widget Container - The "Frame" */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className={styles.widgetContainer}
                        >
                            {/* Lazy Loaded Chat Content */}
                            {isLoaded && (
                                <>
                                    <Script
                                        src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
                                        strategy="lazyOnload"
                                    />
                                    <ChatBot />
                                </>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
