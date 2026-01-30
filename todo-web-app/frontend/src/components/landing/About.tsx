"use client";

import { motion } from "framer-motion";
import { BiWorld } from "react-icons/bi";
import { FiActivity, FiStar } from "react-icons/fi";
import GlowingCards, { GlowingCard } from "@/components/lightswind/glowing-cards";
import { MissionContent } from "./about/MissionContent";
import { StatsContent } from "./about/StatsContent";
import { FeatureContent } from "./about/FeatureContent";
import { SecurityContent } from "./about/SecurityContent";
import { CountUp } from "@/components/lightswind/count-up";

export function About() {
    return (
        <section id="about" className="relative py-32 px-4 overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-1/4 -left-64 h-125 w-125 rounded-full bg-primary/20 blur-[120px] pointer-events-none opacity-50" />
            <div className="absolute bottom-0 -right-64 h-125 w-125 rounded-full bg-accent/20 blur-[120px] pointer-events-none opacity-50" />

            <div className="mx-auto max-w-7xl relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                        Building the future of{" "}
                        <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                            work
                        </span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-sm md:text-lg text-muted-foreground">
                        We're on a mission to help people achieve more with less stress.
                        Here's the impact we've made so far.
                    </p>
                </motion.div>

                {/* Bento Grid Layout using GlowingCards */}
                <GlowingCards
                    containerClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]"
                    gap="0"
                    glowRadius={40}
                    glowOpacity={5}
                    animationDuration={400}
                    enableGlow={true}
                    responsive={false} /* Handled by grid class */
                >

                    {/* Mission Card - Spans 2 cols, 2 rows */}
                    <GlowingCard className="md:col-span-2 lg:col-span-2 lg:row-span-2 min-h-100" glowColor="#a7896c">
                        <MissionContent />
                        {/* <MissionCard /> */}
                    </GlowingCard>

                    {/* Primary Stat Card */}
                    <GlowingCard className="md:col-span-1 lg:col-span-1 lg:row-span-2" glowColor="#a7896c">
                        <StatsContent
                            label="Tasks Completed"
                            value={1000}
                            suffix="+"
                            description="Helping you get things done every day."
                            color="text-primary"
                        />
                    </GlowingCard>

                    {/* Secondary Stat Card */}
                    <GlowingCard className="md:col-span-1 lg:col-span-1" glowColor="#a7896c">
                        <StatsContent
                            label="Active Users"
                            value={50}
                            suffix="+"
                            color="text-accent"
                        />
                    </GlowingCard>

                    {/* Uptime Feature - Replacing Uptime Guarantee with CountUp */}
                    <GlowingCard glowColor="#a7896c">
                        <FeatureContent
                            title="Uptime Guarantee"
                            value={<CountUp value={99.9} decimals={1} suffix="%" duration={2} />}
                            icon={FiActivity}
                            iconColor="text-accent bg-accent/10"
                        />
                    </GlowingCard>

                    {/* Rating Feature */}
                    <GlowingCard glowColor="#a7896c">
                        <FeatureContent
                            title="Average Rating"
                            value="4.9/5"
                            icon={FiStar}
                            iconColor="text-accent bg-accent/10"
                        />
                    </GlowingCard>

                    {/* Global Team Feature */}
                    <GlowingCard glowColor="#a7896c">
                        <FeatureContent
                            title="Global Team"
                            value="24/7"
                            icon={BiWorld}
                            iconColor="text-accent bg-accent/10"
                        />
                    </GlowingCard>

                    {/* New Security Feature to fill slot */}
                    <GlowingCard className=" lg:col-span-2" glowColor="#a7896c">
                        <SecurityContent />
                    </GlowingCard>

                </GlowingCards>
            </div>
        </section>
    );
}
