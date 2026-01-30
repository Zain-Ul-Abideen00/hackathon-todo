"use client";

/**
 * Hero section component for the landing page
 * Uses particles background and aurora text effect
 * @module components/landing/Hero
 */

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { FiCheckCircle } from "react-icons/fi";
import { TbArrowRightDashed } from "react-icons/tb";
import { Button } from "@/components/lightswind/button";
import { useSession } from "@/lib/auth-client";
import SmoothCursor from "../lightswind/smooth-cursor";

const ParticlesBackground = dynamic(() => import("../lightswind/particles-background"), { ssr: false });
const Companies = dynamic(() => import("./Companies"), { ssr: false });


const features = [
    "Organize your tasks effortlessly",
    "Collaborate with your team",
    "Track progress in real-time",
];

export function Hero() {

    // Connect to Better Auth
    const { data: session } = useSession();
    const isLoggedIn = !!session;
    const user = session?.user;

    return (
        <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pt-30">
            <div className="mx-auto max-w-5xl text-center relative z-10 ">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-75 sm:w-125 sm:h-125 bg-primary/20 blur-[80px] sm:blur-[120px] rounded-full -z-10 opacity-60 pointer-events-none" />

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className=" my-6 lg:my-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/50 px-4 py-1.5 text-sm text-foreground/80 backdrop-blur-md shadow-sm"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <span className="font-medium text-[10px] md:text-base">Now with AI-powered task management</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center font-bold tracking-tight relative z-10"
                >
                    <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground drop-shadow-sm tracking-tighter">
                        Manage Your Tasks
                    </span>
                    <span className="mt-1 sm:mt-2 block text-4xl sm:text-5xl md:text-6xl lg:text-7xl bg-linear-to-br from-foreground via-primary to-accent bg-clip-text text-transparent drop-shadow-sm pb-2 tracking-tighter">
                        With Effortless Simplicity
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mx-auto mt-6 max-w-4xl text-base text-muted-foreground sm:text-xl backdrop-blur-md bg-background/40 rounded-2xl px-6 py-2 shadow-sm border border-white/10"
                >
                    The beautiful, intuitive todo app that helps you stay organized and productive. Plan your
                    day, track your progress, and achieve your goals.
                </motion.p>

                {/* Feature bullets */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mx-auto mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm text-foreground/80 font-medium"
                >
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 backdrop-blur-sm"
                        >
                            <FiCheckCircle className="h-4 w-4 text-primary" />
                            <span>{feature}</span>
                        </div>
                    ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-8 sm:mt-10 flex flex-col w-full sm:w-auto items-stretch sm:items-center justify-center gap-3 sm:flex-row sm:gap-4 px-4 sm:px-0"
                >
                    {isLoggedIn && user ? (
                        <Link href="/dashboard" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="group h-12 w-full sm:w-auto min-w-40 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0"
                            >
                                Dashboard
                                <TbArrowRightDashed className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/auth/signup" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="group h-12 w-full sm:w-auto min-w-40 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 bg-linear-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0"
                            >
                                Get Started Free
                                <TbArrowRightDashed className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    )}
                    <Link href="#features" className="w-full sm:w-auto">
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-12 w-full sm:w-auto min-w-40 px-8 text-base backdrop-blur-md bg-background/60 border-primary/20 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            See Features
                        </Button>
                    </Link>
                </motion.div>

                {/* App Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="relative mx-auto mt-12 sm:mt-16 max-w-4xl px-4 sm:px-0"
                >
                    <div className="absolute -inset-4 rounded-xl bg-linear-to-r from-primary/20 via-accent/20 to-primary/20 blur-2xl opacity-50" />
                    <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl mb-20">
                        {/* Mock Dashboard Preview */}
                        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
                            <div className="flex gap-1.5">
                                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                                <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                                <div className="h-3 w-3 rounded-full bg-green-400/80" />
                            </div>
                            <div className="flex-1 text-center text-xs text-muted-foreground font-medium">
                                TodoApp Dashboard
                            </div>
                        </div>
                        <div className="flex min-h-62.5 sm:min-h-100">
                            {/* Sidebar */}
                            <div className="hidden w-48 border-r border-border bg-muted/10 p-4 sm:block">
                                <div className="space-y-3">
                                    <div className="h-4 w-24 rounded bg-primary/10" />
                                    <div className="h-3 w-20 rounded bg-muted/50" />
                                    <div className="h-3 w-16 rounded bg-muted/50" />
                                    <div className="h-3 w-18 rounded bg-muted/50" />
                                </div>
                            </div>
                            {/* Main Content */}
                            <div className="flex-1 p-4 sm:p-6 bg-background/50">
                                <div className="mb-4 h-6 w-32 rounded bg-foreground/5" />
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-3 shadow-sm"
                                        >
                                            <div className="h-5 w-5 rounded border-2 border-primary/30" />
                                            <div className="flex-1">
                                                <div className="h-3 w-full max-w-50 rounded bg-foreground/5" />
                                            </div>
                                            <div className="h-4 w-16 rounded-full bg-primary/10 text-xs" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
            <Companies />
            <ParticlesBackground
                colors={["#a7896c", "#d6ba89", "#ebd3a9"]}
                size={8}
                countDesktop={150}
                countTablet={120}
                countMobile={120}
                zIndex={-2}
                height="100vh"
            />
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
                disabled={true}
            />
        </section>
    );
}
