"use client";

/**
 * Dashboard Sidebar Component
 * Styled with premium look, "Pro Plan" call-to-action
 * Uses Lightswind sidebar components with custom styling overrides
 * @module components/layout/DashboardSidebar
 * @see plan.md - T040
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiCheckSquare as CheckSquare } from "react-icons/fi";
import {
	TbCalendarMonth as Calendar,
	TbHelp as CircleHelp,
	TbHomeFilled as Home,
	TbSettings as Settings,
} from "react-icons/tb";
import { Button } from "@/components/lightswind/button";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "@/components/lightswind/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
	{ href: "/dashboard", label: "Dashboard", icon: Home, value: "dashboard" },
	{ href: "/tasks", label: "Tasks", icon: CheckSquare, value: "tasks" },
	{ href: "/calendar", label: "Calendar", icon: Calendar, value: "calendar" },
	{ href: "/settings", label: "Settings", icon: Settings, value: "settings" },
];

interface DashboardSidebarProps {
	className?: string;
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
	const pathname = usePathname();

	return (
		<SidebarProvider defaultExpanded={true}>
			<Sidebar
				className={cn(
					"hidden lg:flex flex-col bg-background/80 backdrop-blur-2xl border-r border-border/60 font-sans shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]",
					className,
				)}
			>
				{/* Header with logo */}
				<SidebarHeader className="h-20 border-b-0 px-6">
					<Link href="/" className="flex items-center gap-3 group">
						<div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30">
							<CheckSquare className="h-5 w-5" />
							<div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/5 dark:ring-white/10" />
						</div>
						<div className="flex flex-col">
							<span className="font-bold text-lg tracking-tight text-foreground">TodoApp</span>
							<span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
								Workspace
							</span>
						</div>
					</Link>
				</SidebarHeader>

				{/* Main navigation */}
				<SidebarContent className="px-3 py-6 space-y-8">
					<SidebarGroup className="p-0">
						<SidebarGroupLabel className="px-4 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-2">
							Menu
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu className="gap-2 lg:gap-1">
								{navItems.map((item) => {
									const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
									return (
										<SidebarMenuItem key={item.value} value={item.value}>
											<SidebarMenuButton
												asChild
												value={item.value}
												className="w-full rounded-lg transition-all duration-200 pe-2"
											>
												<Link
													href={item.href}
													className={cn(
														"relative flex w-full items-center gap-4 lg:gap-3 px-5 lg:px-4 py-4 lg:py-2.5 text-lg lg:text-sm transition-all duration-200",
														isActive
															? "bg-primary/10 text-primary font-semibold shadow-sm hover:text-primary"
															: "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
													)}
												>
													<item.icon className="h-[26px] w-[26px] lg:h-6 lg:w-6 shrink-0" />
													<span className="truncate">{item.label}</span>
													{isActive && (
														<motion.div
															layoutId="active-nav-indicator"
															className="absolute left-0 top-1/2 -translate-y-1/2 h-8 lg:h-6 w-1 bg-primary rounded-r-full"
															initial={{ opacity: 0, scaleY: 0.5 }}
															animate={{ opacity: 1, scaleY: 1 }}
															transition={{ duration: 0.2 }}
														/>
													)}
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				{/* Footer with Pro Plan card */}
				<SidebarFooter className="p-4 border-t border-border/40 mt-auto">
					<div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 p-5 lg:p-4 border border-border/50">
						<div className="flex items-start gap-3">
							<div className="flex h-9 w-9 lg:h-8 lg:w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<CircleHelp className="h-5 w-5 lg:h-4 lg:w-4" />
							</div>
							<div className="flex flex-col gap-0.5">
								<span className="text-sm font-semibold text-foreground">Help Center</span>
								<span className="text-xs text-muted-foreground leading-tight">
									Need assistance? Check our docs.
								</span>
							</div>
						</div>
						<Button
							className="mt-4 lg:mt-3 w-full bg-background hover:bg-background/80 text-foreground border border-border/50 h-10 lg:h-8 text-sm lg:text-xs font-medium shadow-sm transition-all hover:shadow-md"
							asChild
						>
							<Link href="/docs">Documentation</Link>
						</Button>
					</div>
				</SidebarFooter>
			</Sidebar>
		</SidebarProvider>
	);
}

// Importing motion for the active indicator
import { motion } from "framer-motion";
