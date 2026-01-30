"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/lightswind/count-up";

interface StatsContentProps {
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    description?: string;
    color?: string;
    decimals?: number;
}

export function StatsContent({
    label,
    value,
    prefix = "",
    suffix = "",
    description,
    color = "text-primary",
    decimals = 0
}: StatsContentProps) {
    return (
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
            <div className={cn("text-4xl font-bold md:text-6xl mb-2", color)}>
                <div className="flex items-center justify-center">
                    {prefix && <span>{prefix}</span>}
                    <CountUp
                        value={value}
                        separator=","
                        decimals={decimals}
                        duration={2}
                        className="inline-block"
                    />
                    {suffix && <span className="ml-2 text-4xl">{suffix}</span>}
                </div>
            </div>
            <h4 className="text-lg font-semibold text-foreground">{label}</h4>
            {description && (
                <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    );
}
