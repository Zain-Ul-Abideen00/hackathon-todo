"use client";

/**
 * User Button Component
 *
 * Shows authenticated user info and logout button.
 * Used in header/navigation for auth status.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "@/lib/auth-client";

export function UserButton() {
	const router = useRouter();
	const { data: session, isPending } = useSession();
	const [isLoading, setIsLoading] = useState(false);

	async function handleSignOut() {
		setIsLoading(true);
		try {
			await signOut({
				fetchOptions: {
					onSuccess: () => {
						router.push("/");
						router.refresh();
					},
				},
			});
		} catch (error) {
			console.error("Sign out error:", error);
		} finally {
			setIsLoading(false);
		}
	}

	// Show loading state while checking session
	if (isPending) {
		return <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-lg" />;
	}

	// Show auth buttons if not signed in
	if (!session) {
		return (
			<div className="flex items-center gap-2">
				<Link
					href="/auth/signin"
					className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
				>
					Sign In
				</Link>
				<Link
					href="/auth/signup"
					className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Sign Up
				</Link>
			</div>
		);
	}

	// Show user info and sign out button
	return (
		<div className="flex items-center gap-3">
			<span className="text-sm text-gray-600">{session.user.name || session.user.email}</span>
			<button
				onClick={handleSignOut}
				disabled={isLoading}
				className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
			>
				{isLoading ? "Signing out..." : "Sign Out"}
			</button>
		</div>
	);
}
