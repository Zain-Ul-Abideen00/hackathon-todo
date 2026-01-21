"use client";

/**
 * Mobile Bottom Navigation Component
 * Uses Lightswind dock.tsx for mobile navigation
 * @module components/layout/MobileBottomNav
 * @see plan.md - T048
 */

import { usePathname, useRouter } from "next/navigation";
import { FiCheckSquare as CheckSquare } from "react-icons/fi";
import { TbHomeFilled as Home, TbPlus as Plus, TbMessageChatbot as Chat } from "react-icons/tb";
import { TfiUser as User } from "react-icons/tfi";

import Dock from "@/components/lightswind/dock";
import { useChatStore } from "@/stores/chatStore";

export function MobileBottomNav() {
    const router = useRouter();
    const _pathname = usePathname();
    const setIsChatOpen = useChatStore((state) => state.setIsChatOpen);

    const dockItems = [
        {
            label: "Home",
            icon: <Home className="h-6 w-6" />,
            onClick: () => router.push("/dashboard")
        },
        {
            label: "Tasks",
            icon: <CheckSquare className="h-6 w-6" />,
            onClick: () => router.push("/tasks")
        },
        {
            label: "Add",
            icon: (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-lg">
                    <Plus className="h-6 w-6" />
                </div>
            ),
            onClick: () => router.push("/tasks/new"),
        },
        {
            label: "Chat",
            icon: <Chat className="h-6 w-6" />,
            onClick: () => setIsChatOpen(true)
        },
        {
            label: "Profile",
            icon: <User className="h-6 w-6" />,
            onClick: () => router.push("/settings")
        },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full lg:hidden pb-safe">
            <Dock
                items={dockItems}
                className="bg-background/80 backdrop-blur-lg border-border"
                panelHeight={72}
                baseItemSize={54}
                magnification={70}
                distance={130}
            />
        </div>
    );
}
