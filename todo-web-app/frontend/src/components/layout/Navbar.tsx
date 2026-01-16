"use client";

/**
 * Landing page Navbar component
 * Uses morphing-navigation style with all elements in a single floating nav
 * Refined UI/UX:
 * - Desktop Top: Links + Theme, Log In button
 * - Desktop Scrolled: Hamburger, Get Started button
 * - Mobile: Hamburger, Log In/Get Started dynamic
 * @module components/layout/Navbar
 */

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BsFillMenuButtonWideFill as Menu, BsX as X } from "react-icons/bs";
import { CiLogout as LogOut } from "react-icons/ci";
import {
	FiCheckSquare as CheckSquare,
	FiDollarSign as DollarSign,
	FiInfo as Info,
} from "react-icons/fi";
import {
	TbLayoutDashboard as LayoutDashboard,
	TbLayoutGrid as LayoutGrid,
	TbLogin as LogIn,
	TbRocket as Rocket,
} from "react-icons/tb";
import { TfiUser as User } from "react-icons/tfi";
import { Button } from "@/components/lightswind/button";
import { ToggleTheme } from "@/components/lightswind/toggle-theme";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface NavLink {
	id: string;
	label: string;
	href: string;
	icon?: React.ReactNode;
}

const navLinks: NavLink[] = [
	{
		id: "features",
		label: "Features",
		href: "#features",
		icon: <LayoutGrid className="h-4 w-4" />,
	},
	{ id: "pricing", label: "Pricing", href: "#pricing", icon: <DollarSign className="h-4 w-4" /> },
	{ id: "about", label: "About", href: "#about", icon: <Info className="h-4 w-4" /> },
];

export function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const navRef = useRef<HTMLElement>(null);

	// Connect to Better Auth
	const { data: session } = useSession();
	const isLoggedIn = !!session;
	const user = session?.user;

	useEffect(() => {
		const handleScroll = () => {
			const scrolled = window.scrollY >= 50;
			setIsScrolled(scrolled);
			if (scrolled) setIsMenuOpen(false);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleLinkClick = (href: string, e: React.MouseEvent) => {
		e.preventDefault();
		setIsMenuOpen(false);
		const target = document.querySelector(href);
		if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (navRef.current && !navRef.current.contains(e.target as Node) && isMenuOpen) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, [isMenuOpen]);

	return (
		<>
			{/* Page blur overlay when menu is open */}
			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setIsMenuOpen(false)}
					/>
				)}
			</AnimatePresence>

			{/* Main Navigation Bar */}
			<motion.header
				className="fixed left-0 right-0 z-50 px-4 flex justify-center"
				initial={false}
				animate={{ top: isScrolled ? 12 : 20 }}
				transition={{ duration: 0.3 }}
			>
				<motion.nav
					ref={navRef}
					className={cn(
						"flex items-center justify-between backdrop-blur-md border shadow-sm",
						"bg-background/90 dark:bg-background/80 border-border/50",
						"rounded-full pl-4 pr-2",
					)}
					initial={false}
					animate={{
						height: isScrolled ? 50 : 56,
						width: "100%",
						maxWidth: isScrolled ? 600 : 900,
					}}
					transition={{ duration: 0.3 }}
				>
					{/* Left: Logo */}
					<Link
						href="/"
						className="flex items-center gap-2.5 font-bold text-lg shrink-0 mr-4 hover:scale-105 transition-all duration-500 hover:text-foreground text-primary cursor-pointer"
					>
						<div className="bg-primary/10 p-1.5 rounded-lg">
							<CheckSquare className="h-5 w-5" />
						</div>
						<span>TodoApp</span>
					</Link>

					{/* Center: Links + Theme (Top) OR Hamburger (Scrolled/Mobile) */}
					<div className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
						{/* Desktop Links + Theme (Visible only when NOT scrolled) */}
						<AnimatePresence>
							{!isScrolled && (
								<motion.div
									className="hidden md:flex items-center gap-1"
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
								>
									{navLinks.map((link) => (
										<a
											key={link.id}
											href={link.href}
											onClick={(e) => handleLinkClick(link.href, e)}
											className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 rounded-full hover:bg-muted/50 hover:scale-110 transition-all duration-500"
										>
											{link.icon}
											{link.label}
										</a>
									))}
									<div className="w-px h-4 bg-border mx-2" />
									<div className="flex items-center justify-center">
										<ToggleTheme
											animationType="diag-down-right"
											className="text-muted-foreground"
										/>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Menu Toggle (Visible on Mobile OR when Scrolled) */}
						<div className={cn("flex items-center", !isScrolled && "md:hidden")}>
							<button
								onClick={() => setIsMenuOpen(!isMenuOpen)}
								className={cn(
									"flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted/50 text-primary bg-primary/10 cursor-pointer hover:scale-105 transition-all duration-500 hover:text-foreground",
									isMenuOpen && "bg-muted text-foreground",
								)}
								aria-label="Menu"
							>
								{isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
							</button>
						</div>
					</div>

					{/* Right: Primary Action */}
					<div className="flex items-center gap-2 shrink-0 ml-auto">
						{isLoggedIn && user ? (
							<Link href="/dashboard">
								<Button
									size="sm"
									className="gap-2 rounded-full h-9 px-6 shadow-sm border border-border hover:scale-105 transition-all duration-500 hover:bg-muted/50 hover:text-foreground text-primary bg-primary/10 cursor-pointer"
								>
									<LayoutDashboard className="h-4 w-4" />
									<span className="hidden sm:inline">Dashboard</span>
								</Button>
							</Link>
						) : /* Logged Out State Logic */
						!isScrolled ? (
							/* Top: Show Log in */
							<Link href="/auth/login">
								<Button
									size="sm"
									className="gap-2 rounded-full h-9 px-6 shadow-sm border border-border hover:scale-105 transition-all duration-500 hover:bg-muted/50 hover:text-foreground text-primary bg-primary/10 cursor-pointer"
								>
									<LogIn className="h-4 w-4" />
									<span>Log in</span>
								</Button>
							</Link>
						) : (
							/* Scrolled: Show Get Started */
							<Link href="/auth/signup">
								<Button
									size="sm"
									className="gap-2 rounded-full h-9 px-6 shadow-sm border border-border hover:scale-105 transition-all duration-500 hover:bg-muted/50 hover:text-foreground text-primary bg-primary/10 cursor-pointer"
								>
									<Rocket className="h-4 w-4" />
									<span className="hidden sm:inline">Get Started</span>
									<span className="sm:hidden">Start</span>
								</Button>
							</Link>
						)}
					</div>
				</motion.nav>
			</motion.header>

			{/* Dropdown Menu */}
			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						className="fixed left-0 right-0 z-40 flex justify-center"
						style={{ top: isScrolled ? 70 : 85 }}
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.2 }}
					>
						<div className="w-full max-w-sm mx-4 p-2 rounded-2xl backdrop-blur-xl border bg-background/80 border-border/50 shadow-xl overflow-hidden">
							{/* Mobile Links */}
							<div className="flex flex-col p-2 space-y-1">
								{navLinks.map((link) => (
									<a
										key={link.id}
										href={link.href}
										onClick={(e) => handleLinkClick(link.href, e)}
										className="flex items-center gap-3 font-medium text-sm text-foreground/80 hover:text-foreground hover:bg-muted/50 p-2.5 rounded-xl hover:scale-105 transition-all duration-500"
									>
										<div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border/50 shadow-sm">
											{link.icon}
										</div>
										{link.label}
									</a>
								))}
							</div>

							{/* Divider with Label */}
							<div className="flex items-center gap-4 px-4 py-2">
								<div className="h-px bg-border/50 flex-1" />
								<span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
									Account & Settings
								</span>
								<div className="h-px bg-border/50 flex-1" />
							</div>

							{/* Theme & Actions Row */}
							<div className="p-2 grid grid-cols-2 gap-2">
								{/* Theme Toggle */}
								<div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-background border border-border/50 hover:bg-muted/30 transition-colors hover:text-foreground h-full">
									<div className="flex items-center gap-2 overflow-hidden">
										<ToggleTheme
											animationType="diag-down-right"
											className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary"
										/>
										<span className="text-sm font-medium truncate">Theme</span>
									</div>
								</div>

								{/* Login/Settings Action */}
								{!isLoggedIn ? (
									<Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
										<div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border/50 hover:bg-muted/30 transition-colors hover:text-foreground cursor-pointer h-full">
											<span className="text-sm font-medium ml-1">Log in</span>
											<div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted/50">
												<LogIn className="h-4 w-4" />
											</div>
										</div>
									</Link>
								) : (
									<Link href="/settings" onClick={() => setIsMenuOpen(false)}>
										<div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-background border border-border/50 hover:bg-muted/30 transition-colors hover:text-foreground cursor-pointer h-full">
											<div className="flex items-center gap-2 overflow-hidden">
												{user?.image ? (
													<img src={user.image} alt={user.name} className="h-6 w-6 rounded-full" />
												) : (
													<div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
														<User />
													</div>
												)}
												<span className="text-sm font-medium truncate">{user?.name}</span>
											</div>
										</div>
									</Link>
								)}
							</div>

							{/* Sign Out Button */}
							{isLoggedIn && (
								<div className="px-2 pb-2">
									<button
										onClick={async () => {
											await signOut();
											setIsMenuOpen(false);
											window.location.href = "/";
										}}
										className="w-full flex items-center justify-between p-2.5 px-3 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-colors cursor-pointer"
									>
										<span className="text-sm font-medium ml-1">Sign out</span>
										<div className="flex items-center justify-center h-8 w-8">
											<LogOut className="h-4 w-4" />
										</div>
									</button>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
