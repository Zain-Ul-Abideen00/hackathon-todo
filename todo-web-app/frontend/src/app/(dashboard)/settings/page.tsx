"use client";

/**
 * Settings Page
 * User profile and preferences
 * @module app/(dashboard)/settings/page
 */

import Image from "next/image";
import { useState } from "react";
import { CiBellOn as Bell, CiLogout } from "react-icons/ci";
import { LuLoaderPinwheel } from "react-icons/lu";
import { TfiPalette, TfiUser } from "react-icons/tfi";
import { toast } from "sonner";

import { Button } from "@/components/lightswind/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/lightswind/card";
import { Label } from "@/components/lightswind/label";
import { Switch } from "@/components/lightswind/switch";
import { ToggleTheme } from "@/components/lightswind/toggle-theme";
import { signOut, useSession } from "@/lib/auth-client";

export default function SettingsPage() {
	const { data: session } = useSession();
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await signOut();
			toast.success("Logged out successfully");
			window.location.href = "/";
		} catch {
			toast.error("Failed to log out");
		} finally {
			setIsLoggingOut(false);
		}
	};

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<h1 className="text-2xl font-bold">Settings</h1>

			{/* Profile */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TfiUser className="h-5 w-5" />
						Profile
					</CardTitle>
					<CardDescription>Your account information</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
							{session?.user?.image ? (
								<Image
									src={session.user.image}
									alt={session.user.name || "User"}
									width={64}
									height={64}
									className="rounded-full object-cover"
								/>
							) : (
								<TfiUser className="h-8 w-8 text-primary" />
							)}
						</div>
						<div>
							<p className="font-medium">{session?.user?.name || "User"}</p>
							<p className="text-sm text-muted-foreground">{session?.user?.email || ""}</p>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Appearance */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TfiPalette className="h-5 w-5" />
						Appearance
					</CardTitle>
					<CardDescription>Customize how the app looks</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<div>
							<Label>Theme</Label>
							<p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
						</div>
						<ToggleTheme animationType="diag-down-right" className="h-10 w-10" />
					</div>
				</CardContent>
			</Card>

			{/* Notifications */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 icon-xl">
						<Bell />
						Notifications
					</CardTitle>
					<CardDescription>Manage your notification preferences</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<Label>Email notifications</Label>
							<p className="text-sm text-muted-foreground">Receive email reminders for due tasks</p>
						</div>
						<Switch />
					</div>
					<div className="flex items-center justify-between">
						<div>
							<Label>Push notifications</Label>
							<p className="text-sm text-muted-foreground">Get browser notifications</p>
						</div>
						<Switch />
					</div>
				</CardContent>
			</Card>

			{/* Account Actions */}
			<Card className="border-destructive/50">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-destructive">
						<CiLogout className="h-5 w-5" />
						Account
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Button variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
						{isLoggingOut ? (
							<>
								<LuLoaderPinwheel className="mr-2 h-4 w-4 animate-spin" />
								Logging out...
							</>
						) : (
							<>
								<CiLogout className="mr-2 h-4 w-4" />
								Log out
							</>
						)}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
