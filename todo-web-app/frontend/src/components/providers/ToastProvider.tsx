"use client";

/**
 * Toaster provider using Sonner
 * @module components/providers/ToastProvider
 */

import { Toaster } from "sonner";

export function ToastProvider() {
	return (
		<Toaster
			position="top-right"
			toastOptions={{
				classNames: {
					toast: "bg-card text-card-foreground border-border",
					title: "text-foreground",
					description: "text-muted-foreground",
					success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
					error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
				},
			}}
			richColors
			closeButton
		/>
	);
}
