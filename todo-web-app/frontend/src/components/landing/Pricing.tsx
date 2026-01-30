"use client";

import { motion } from "framer-motion";
import { FiCheck as Check } from "react-icons/fi";
import { Button } from "@/components/lightswind/button";
import GlowingCards, { GlowingCard } from "../lightswind/glowing-cards";
import { cn } from "@/lib/utils";

export function Pricing() {
    const plans = [
        {
            name: "Free",
            price: "$0",
            description: "Perfect for getting started",
            features: ["Up to 5 Projects", "Basic Task Management", "Mobile App Access", "Community Support"],
            action: "Get Started",
            popular: false,
            glowColor: "#a7896c", // blue
        },
        {
            name: "Pro",
            price: "$9",
            description: "For power users and teams",
            features: ["Unlimited Projects", "Advanced Analytics", "Team Collaboration", "Priority Support", "AI Suggestions"],
            action: "Start Free Trial",
            popular: true,
            glowColor: "#a7896c", // purple
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "For large organizations",
            features: ["SSO & Security", "Dedicated Success Manager", "Custom Integrations", "SLA Guarantee", "Audit Logs"],
            action: "Contact Sales",
            popular: false,
            glowColor: "#a7896c", // orange
        },
    ];

    return (
        <section id="pricing" className="py-24 px-4 bg-muted/30">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Simple, transparent{" "}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            pricing
                        </span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm md:text-lg text-muted-foreground">
                        Choose the plan that fits your needs. No hidden fees.
                    </p>
                </motion.div>

                <GlowingCards
                    enableGlow={true}
                    glowRadius={50}
                    glowOpacity={5}
                    animationDuration={400}
                    gap="2rem"
                    responsive={true}
                    padding="0"
                >
                    {plans.map((plan, index) => (
                        <GlowingCard
                            key={index}
                            glowColor={plan.glowColor}
                            className={`flex flex-col min-w-[300px] h-full ${plan.popular ? "border-primary/50 shadow-xl shadow-primary/10" : ""}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium shadow-md backdrop-blur-sm z-20">
                                    Most Popular
                                </div>
                            )}

                            <div className="p-2 flex-1 flex flex-col text-foreground">
                                <div className="mb-6">
                                    <h3 className="text-4xl font-bold">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline">
                                        <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                                        {plan.price !== "Custom" && <span className="ml-2 text-muted-foreground">/month</span>}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                                                <Check className="h-3 w-3 text-primary" />
                                            </div>
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={cn(
                                        "w-full mt-auto h-12 text-base transition-all duration-300",
                                        plan.popular
                                            ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
                                            : "backdrop-blur-md bg-background/60 border-primary/20 hover:bg-primary/10 hover:border-primary/50 hover:text-primary shadow-sm hover:shadow-md"
                                    )}
                                    variant={plan.popular ? "default" : "outline"}
                                    size="lg"
                                >
                                    {plan.action}
                                </Button>
                            </div>
                        </GlowingCard>
                    ))}
                </GlowingCards>
            </div>
        </section>
    );
}
