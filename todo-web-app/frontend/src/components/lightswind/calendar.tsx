"use client";

import type * as React from "react";
import { DayPicker } from "react-day-picker";
import { FiChevronLeft as ChevronLeft, FiChevronRight as ChevronRight } from "react-icons/fi";

import { cn } from "@/lib/utils";
// We don't need the custom Select for the new simple calendar
// import { buttonVariants } from "@/components/lightswind/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("p-3", className)}
			classNames={{
				months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
				month: "space-y-4",
				caption: "flex justify-start pt-1 relative items-center pl-2", // Align text left
				caption_label: "text-sm font-bold text-foreground",
				nav: "ml-auto flex items-center gap-1 absolute right-2", // Position nav absolute right
				nav_button: cn(
					"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground",
					"h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
				),
				nav_button_previous: "", // Removed absolute positioning
				nav_button_next: "", // Removed absolute positioning
				table: "w-full border-collapse space-y-1",
				head_row: "flex",
				weekdays: "flex w-full justify-between mb-2", // Fixed: Added w-full and justify-between
				head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
				weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
				row: "flex w-full mt-2 justify-between", // Fixed: Added justify-between
				week: "flex w-full mt-2 justify-between",
				cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
				day: cn(
					"inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground",
					"h-9 w-9 p-0 font-normal aria-selected:opacity-100",
				),
				day_range_end: "day-range-end",
				day_selected:
					"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-md scale-105 transition-all text-white",
				selected: // v9
					"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground shadow-md scale-105 transition-all text-white",
				day_today: "text-primary font-bold underline decoration-primary/50 underline-offset-4",
				today: "text-primary font-bold underline decoration-primary/50 underline-offset-4", // v9
				day_outside:
					"day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
				outside: // v9
					"day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
				day_disabled: "text-muted-foreground opacity-50",
				disabled: "text-muted-foreground opacity-50", // v9
				day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
				range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground", // v9
				day_hidden: "invisible",
				hidden: "invisible", // v9
				...classNames,
			}}
			components={{
				Chevron: ({ orientation }) => {
					const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
					return <Icon className="h-4 w-4" />;
				},
			}}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export default Calendar;
