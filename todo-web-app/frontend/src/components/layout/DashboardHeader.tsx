"use client";

/**
 * Dashboard Header Component
 * Header with Lightswind breadcrumb, search, and user actions (Avatar)
 * @module components/layout/DashboardHeader
 * @see plan.md - T044
 */

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { BsFillMenuButtonWideFill as Menu } from "react-icons/bs";
import {
	CiBellOn as Bell,
	CiCreditCard1 as CreditCard,
	CiLogout as LogOut,
	CiSearch as Search,
} from "react-icons/ci";
import { TbHomeFilled as Home, TbSettings as Settings } from "react-icons/tb";
import { TfiUser as UserIcon } from "react-icons/tfi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/lightswind/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/lightswind/breadcrumb";
import { Button } from "@/components/lightswind/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/lightswind/dropdown-menu";
import { Input } from "@/components/lightswind/input";
import { ToggleTheme } from "@/components/lightswind/toggle-theme";
import { signOut, useSession } from "@/lib/auth-client";
import { useTaskStore } from "@/stores/taskStore";

interface DashboardHeaderProps {
	onMenuClick?: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
	const pathname = usePathname();
	const [showSearch, setShowSearch] = useState(false);
	const { setSearchQuery, searchQuery } = useTaskStore();
	const { data: session } = useSession();

	// Generate breadcrumb from pathname
	const pathSegments = pathname.split("/").filter(Boolean);
	const breadcrumbItems = pathSegments.map((segment, index) => ({
		label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
		href: `/${pathSegments.slice(0, index + 1).join("/")}`,
		isLast: index === pathSegments.length - 1,
	}));

	const handleLogout = async () => {
		await signOut();
		window.location.href = "/";
	};

	return (
		<header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6">
			{/* Mobile Menu Button */}
			<Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
				<Menu className="h-5 w-5" />
			</Button>

			{/* Breadcrumb with Lightswind component */}
			<Breadcrumb className="hidden sm:flex">
				<BreadcrumbList>
					{/* Home link */}
					<BreadcrumbItem>
						<BreadcrumbLink asChild>
							<Link href="/" className="flex items-center gap-1">
								<Home className="h-4 w-4" />
								<span className="sr-only">Home</span>
							</Link>
						</BreadcrumbLink>
					</BreadcrumbItem>

					{breadcrumbItems.map((item, _index) => (
						<React.Fragment key={item.href}>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								{item.isLast ? (
									<BreadcrumbPage>{item.label}</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link href={item.href}>{item.label}</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</React.Fragment>
					))}
				</BreadcrumbList>
			</Breadcrumb>

			{/* Spacer */}
			<div className="flex-1" />

			{/* Search */}
			<div className="relative hidden sm:block">
				<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search tasks..."
					className="w-64 pl-9 bg-muted/50 focus:bg-background transition-colors"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>

			{/* Mobile Search Toggle */}
			<Button
				variant="ghost"
				size="icon"
				className="sm:hidden"
				onClick={() => setShowSearch(!showSearch)}
			>
				<Search className="h-5 w-5" />
			</Button>

			{/* Notifications */}
			<Button variant="ghost" size="icon" className="relative icon-xl">
				<Bell />
				<span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
			</Button>

			{/* Theme Toggle (desktop only) */}
			<div className="hidden md:block">
				<ToggleTheme animationType="diag-down-right" className="h-9 w-9" />
			</div>

			{/* User Avatar Dropdown */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-offset-background transition-colors hover:ring-2 hover:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<Avatar className="h-9 w-9">
							<AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
							<AvatarFallback>
								{session?.user?.name?.slice(0, 2).toUpperCase() || "U"}
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56 bg-background font-sans">
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">{session?.user?.name || "User"}</p>
							<p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem className="p-0">
						<Link href="/settings" className="flex w-full items-center px-2 py-1.5 cursor-pointer">
							<UserIcon className="mr-2 h-4 w-4" />
							<span>Profile</span>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem className="p-0">
						<Link href="/settings" className="flex w-full items-center px-2 py-1.5 cursor-pointer">
							<Settings className="mr-2 h-4 w-4" />
							<span>Settings</span>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem className="p-0">
						<Link
							href="/settings/billing"
							className="flex w-full items-center px-2 py-1.5 cursor-pointer"
						>
							<CreditCard className="mr-2 h-4 w-4" />
							<span>Billing</span>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleLogout}
						className="text-destructive focus:text-destructive cursor-pointer"
					>
						<LogOut className="mr-2 h-4 w-4" />
						<span>Log out</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Mobile Search Overlay */}
			<AnimatePresence>
				{showSearch && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="absolute left-0 right-0 top-16 border-b border-border bg-background p-4 sm:hidden shadow-lg"
					>
						<Input
							type="search"
							placeholder="Search tasks..."
							className="w-full"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							autoFocus
						/>
					</motion.div>
				)}
			</AnimatePresence>
		</header>
	);
}
