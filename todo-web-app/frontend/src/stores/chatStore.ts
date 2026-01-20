/**
 * Zustand store for ChatKit state management
 * @module stores/chatStore
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ColorScheme = "light" | "dark";

interface ChatState {
	// Thread state
	threadId: string | null;
	setThreadId: (threadId: string | null) => void;

	// Theme state (synced with document.documentElement.classList for ChatKit)
	scheme: ColorScheme;
	setScheme: (scheme: ColorScheme) => void;

	// Chat UI state
	isChatOpen: boolean;
	setIsChatOpen: (isOpen: boolean) => void;
	toggleChat: () => void;
}

/**
 * Get initial color scheme from document or localStorage
 */
function getInitialScheme(): ColorScheme {
	if (typeof window === "undefined") {
		return "light";
	}

	// Check localStorage first (consistent with toggle-theme.tsx)
	const stored = localStorage.getItem("theme") as ColorScheme | null;
	if (stored === "light" || stored === "dark") {
		return stored;
	}

	// Fallback to checking document class
	if (document.documentElement.classList.contains("dark")) {
		return "dark";
	}

	// Finally check system preference
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

export const useChatStore = create<ChatState>()(
	persist(
		(set, get) => ({
			// Thread state
			threadId: null,
			setThreadId: (threadId) => set({ threadId }),

			// Theme state - initialized lazily on first access
			scheme: "light", // Will be synced on mount
			setScheme: (scheme) => set({ scheme }),

			// Chat UI state
			isChatOpen: false,
			setIsChatOpen: (isChatOpen) => set({ isChatOpen }),
			toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
		}),
		{
			name: "chat-store",
			// Only persist threadId, not theme (theme is managed by toggle-theme.tsx)
			partialize: (state) => ({ threadId: state.threadId }),
		},
	),
);

/**
 * Hook to sync theme with document on mount
 * Call this in ChatBot component useEffect
 */
export function syncThemeFromDocument(): ColorScheme {
	const scheme = getInitialScheme();
	useChatStore.setState({ scheme });
	return scheme;
}
