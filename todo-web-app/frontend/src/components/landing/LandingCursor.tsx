"use client";

import { useEffect, useState } from "react";
import SmoothCursor from "@/components/lightswind/smooth-cursor";

export function LandingCursor() {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        // Check if window exists (client-side)
        if (typeof window === "undefined") return;

        // Use matchMedia for efficient breakpoint detection
        // 1024px corresponds to Tailwind's 'lg' breakpoint
        const mediaQuery = window.matchMedia("(min-width: 1024px)");

        const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsDesktop(e.matches);
        };

        // Initial check
        handleChange(mediaQuery);

        // Add listener
        mediaQuery.addEventListener("change", handleChange);

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
        };
    }, []);

    if (!isDesktop) return null;

    return (
        <SmoothCursor
            size={20}
            color="#a7896c"
            showTrail={true}
            trailLength={8}
            magneticDistance={60}
            magneticElements="[data-magnetic]"
            springConfig={{
                damping: 50,
                stiffness: 450,
                mass: 0.8,
                restDelta: 0.001,
            }}
            disabled={false}
        />
    );
}
