"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/lightswind/select";
import { cn } from "@/lib/utils";
import { TbRepeat } from "react-icons/tb";

export type RecurringPattern = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurringConfig {
    pattern: RecurringPattern;
    interval: number;
    end_date?: string | null;
}

interface RecurringPickerProps {
    value?: RecurringConfig | null;
    onChange: (value: RecurringConfig | null) => void;
    className?: string;
}

export function RecurringPicker({ value, onChange, className }: RecurringPickerProps) {
    const pattern = value?.pattern || "none";

    const handlePatternChange = (newPattern: string) => {
        if (newPattern === "none") {
            onChange(null);
        } else {
            onChange({
                pattern: newPattern as RecurringPattern,
                interval: value?.interval || 1,
                end_date: value?.end_date || null
            });
        }
    };

    return (
        <div className={cn("relative", className)}>
            <Select value={pattern} onValueChange={handlePatternChange}>
                <SelectTrigger className="w-full">
                    <div className="flex items-center text-muted-foreground group-hover:text-foreground">
                        <TbRepeat className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Does not repeat" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none">Does not repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
