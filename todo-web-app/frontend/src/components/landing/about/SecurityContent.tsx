"use client";

import { cn } from "@/lib/utils";
import { FiShield } from "react-icons/fi";

export function SecurityContent() {
    return (
        <div className="relative z-10 flex flex-col justify-center h-full">
            <div className="inline-flex w-fit rounded-xl bg-accent/10 p-3 mb-4 text-accent">
                <FiShield className="h-6 w-6" />
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-2">Secure by Design</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
                Enterprise-grade encryption and privacy controls built-in. Your data is safe with us.
            </p>
        </div>
    );
}
