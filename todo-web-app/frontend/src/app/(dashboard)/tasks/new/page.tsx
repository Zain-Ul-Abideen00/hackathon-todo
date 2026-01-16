/**
 * New Task Page
 * Create a new task
 * @module app/(dashboard)/tasks/new/page
 */

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/lightswind/card";
import { TaskForm } from "@/components/tasks/TaskForm";

export default function NewTaskPage() {
	return (
		<div className="mx-auto max-w-2xl">
			<Card>
				<CardHeader>
					<CardTitle>Create New Task</CardTitle>
					<CardDescription>Add a new task to your list with all the details</CardDescription>
				</CardHeader>
				<CardContent>
					<TaskForm />
				</CardContent>
			</Card>
		</div>
	);
}
