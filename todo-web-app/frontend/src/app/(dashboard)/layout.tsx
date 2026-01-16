"use client";

/**
 * Dashboard Layout
 * Responsive layout with sidebar (desktop) and bottom nav (mobile)
 * Protected route wrapper
 * @module app/(dashboard)/layout
 */

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Sheet, SheetContent } from "@/components/lightswind/sheet";
import { useSession } from "@/lib/auth-client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const _pathname = usePathname();
	const { data: session, isPending } = useSession();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Redirect to login if not authenticated
	useEffect(() => {
		if (!isPending && !session) {
			router.push("/auth/login");
		}
	}, [session, isPending, router]);

	// Close mobile menu on route change
	useEffect(() => {
		setMobileMenuOpen(false);
	}, []);

	// Show loading state while checking auth
	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	// Don't render dashboard if not authenticated
	if (!session) {
		return null;
	}

	return (
		<div className="flex min-h-screen bg-background">
			{/* Desktop Sidebar */}
			<DashboardSidebar />

			{/* Mobile Sidebar (Sheet) */}
			<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
				<SheetContent side="left" className="p-0 w-[85%] sm:w-80 border-r border-border/40">
					{/* Removed pt-10 to let sidebar fill the height naturally */}
					<DashboardSidebar className="w-full relative flex h-full border-none bg-background/95 backdrop-blur-xl shadow-none" />
				</SheetContent>
			</Sheet>

			{/* Main Content */}
			<div className="flex flex-1 flex-col">
				{/* Header */}
				<DashboardHeader onMenuClick={() => setMobileMenuOpen(true)} />

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto p-4 pb-20 sm:p-6 md:pb-6">{children}</main>
			</div>

			{/* Mobile Bottom Navigation */}
			<MobileBottomNav />
		</div>
	);
}
