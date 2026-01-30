"use client";

import { cn } from "@/lib/utils";
import { IconType } from "react-icons";

interface FeatureContentProps {
    title: string;
    value: string | React.ReactNode;
    icon: IconType;
    iconColor?: string;
}

export function FeatureContent({
    title,
    value,
    icon: Icon,
    iconColor = "text-primary",
}: FeatureContentProps) {
    return (
        <div className="relative z-10 flex flex-col justify-center items-center text-center h-full w-full">
            <div className={cn("inline-flex w-fit rounded-xl bg-white/10 p-3 mb-4", iconColor)}>
                <Icon className="h-6 w-6" />
            </div>

            <div>
                <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
                <div className="text-sm font-medium text-muted-foreground">{title}</div>
            </div>
        </div>
    );
}
