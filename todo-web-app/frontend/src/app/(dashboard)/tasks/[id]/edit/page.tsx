/**
 * Edit Task Page
 * CRITICAL: Uses async params pattern for Next.js 16
 * @module app/(dashboard)/tasks/[id]/edit/page
 */

import { Suspense } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/lightswind/card";
import { Skeleton } from "@/components/lightswind/skeleton";
import { EditTaskForm } from "./EditTaskForm";

interface EditTaskPageProps {
	params: Promise<{ id: string }>;
}

function LoadingFallback() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-24 w-full" />
			<div className="grid gap-4 sm:grid-cols-2">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-full" />
			</div>
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full" />
		</div>
	);
}

/**
 * CRITICAL: Next.js 16 requires awaiting params Promise
 */
export default async function EditTaskPage({ params }: EditTaskPageProps) {
	// MUST await params - Next.js 16 breaking change
	const { id } = await params;

	return (
		<div className="mx-auto max-w-2xl">
			<Card>
				<CardHeader>
					<CardTitle>Edit Task</CardTitle>
					<CardDescription>Update your task details</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense fallback={<LoadingFallback />}>
						<EditTaskForm taskId={id} />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}
