/**
 * Calendar Page Placeholder
 * @module app/(dashboard)/calendar/page
 */

import { TbCalendarMonth as CalendarIcon } from "react-icons/tb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/lightswind/card";

export default function CalendarPage() {
	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-bold">Calendar</h1>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CalendarIcon className="h-5 w-5" />
						Calendar View
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center py-16 text-center">
						<CalendarIcon className="h-16 w-16 text-muted-foreground" />
						<h3 className="mt-4 text-lg font-medium">Coming Soon</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							Calendar view with task scheduling will be available in a future update.
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
