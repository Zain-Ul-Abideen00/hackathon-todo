"use client";

/**
 * Auth Layout
 * Centered card design with background pattern
 * Redirects authenticated users to dashboard
 * @module app/auth/layout
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiCheckSquare } from "react-icons/fi";
import { LuLoaderPinwheel } from "react-icons/lu";

import { useSession } from "@/lib/auth-client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { data: session, isPending } = useSession();
	const [isCheckingAuth, setIsCheckingAuth] = useState(true);

	// Redirect authenticated users to dashboard
	useEffect(() => {
		if (!isPending) {
			if (session?.user) {
				router.replace("/dashboard");
			} else {
				setIsCheckingAuth(false);
			}
		}
	}, [session, isPending, router]);

	// Show loading while checking auth
	if (isPending || isCheckingAuth) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<LuLoaderPinwheel className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
			{/* Background pattern */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
				{/* Dot pattern */}
				<svg
					className="absolute inset-0 h-full w-full stroke-border/20 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
					aria-hidden="true"
				>
					<defs>
						<pattern id="auth-pattern" width={40} height={40} patternUnits="userSpaceOnUse">
							<circle cx={2} cy={2} r={1} fill="currentColor" className="text-border" />
						</pattern>
					</defs>
					<rect width="100%" height="100%" strokeWidth={0} fill="url(#auth-pattern)" />
				</svg>
			</div>

			{/* Logo */}
			<Link href="/" className="mb-8 flex items-center gap-2 font-semibold text-xl">
				<FiCheckSquare className="h-7 w-7 text-primary" />
				<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					TodoApp
				</span>
			</Link>

			{/* Auth Card */}
			<div className="w-full max-w-md">
				<div className="rounded-xl border border-border bg-card p-8 shadow-lg">{children}</div>
			</div>

			{/* Footer */}
			<p className="mt-8 text-center text-sm text-muted-foreground">
				© {new Date().getFullYear()} TodoApp. All rights reserved.
			</p>
		</div>
	);
}
