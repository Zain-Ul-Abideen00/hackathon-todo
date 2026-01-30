"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function MissionContent() {
    return (
        <div className="relative z-10 flex flex-col justify-center h-full">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Our Mission
            </span>
            <h3 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl text-foreground">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
                    Simplifying productivity
                </span>{" "}
                for everyone, everywhere.
            </h3>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
                We believe that great tools should get out of your way. Our goal is to create a seamless, intuitive experience that helps you focus on what truly matters—your work, your goals, and your peace of mind.
            </p>

            <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                            <div className={`w-full h-full bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-900 opacity-${i * 20 + 20}`} />
                        </div>
                    ))}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                    Joined by <span className="text-foreground">50+</span> users
                </div>
            </div>
        </div>
    );
}
