"use client";

/**
 * Mobile Bottom Navigation Component
 * Uses Lightswind dock.tsx for mobile navigation
 * @module components/layout/MobileBottomNav
 * @see plan.md - T048
 */

import { usePathname, useRouter } from "next/navigation";
import { FiCheckSquare as CheckSquare } from "react-icons/fi";
import { TbCalendarMonth as Calendar, TbHomeFilled as Home, TbPlus as Plus } from "react-icons/tb";
import { TfiUser as User } from "react-icons/tfi";

import Dock from "@/components/lightswind/dock";

const navItems = [
	{ label: "Home", icon: <Home className="h-5 w-5" />, href: "/dashboard" },
	{ label: "Tasks", icon: <CheckSquare className="h-5 w-5" />, href: "/tasks" },
	{
		label: "Add",
		icon: (
			<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-lg">
				<Plus className="h-5 w-5" />
			</div>
		),
		href: "/tasks/new",
	},
	{ label: "Calendar", icon: <Calendar className="h-5 w-5" />, href: "/calendar" },
	{ label: "Profile", icon: <User className="h-5 w-5" />, href: "/settings" },
];

export function MobileBottomNav() {
	const router = useRouter();
	const _pathname = usePathname();

	// Create dock items from nav items
	const dockItems = navItems.map((item) => ({
		icon: item.icon,
		label: item.label,
		onClick: () => router.push(item.href),
	}));

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
