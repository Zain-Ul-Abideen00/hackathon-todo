"use client";

/**
 * Hero section component for the landing page
 * Uses particles background and aurora text effect
 * @module components/landing/Hero
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";
import { TbArrowRightDashed } from "react-icons/tb";
import { Button } from "@/components/lightswind/button";
import { AnimatedHeading } from "../lightswind/animated-heading";
import ParticlesBackground from "../lightswind/particles-background";
import SmoothCursor from "../lightswind/smooth-cursor";
import Companies from "./Companies";

const features = [
	"Organize your tasks effortlessly",
	"Collaborate with your team",
	"Track progress in real-time",
];

export function Hero() {
	return (
		<section className="relative flex flex-col items-center justify-center overflow-hidden px-4 pt-16">
			<div className="mx-auto max-w-5xl text-center">
				{/* Badge */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="my-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
				>
					<span className="relative flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
						<span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
					</span>
					Now with AI-powered task suggestions
				</motion.div>

				{/* Headline */}
				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="text-4xl bg-transparent font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
				>
					{/* <span className="block">Manage Your Tasks</span>
                    <span className="mt-2 block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                        With Effortless Simplicity
                    </span> */}
					<AnimatedHeading
						text="Manage Your Tasks"
						textClassName="mt-2 block text-foreground"
						variant="glow"
						fontSize="clamp(2.3rem, 6vw, 4.3rem)"
						duration={2.5}
						gradientColors={{
							from: "var(--primary)",
							via: "var(--foreground)",
							to: "var(--accent)",
						}}
					/>
					<AnimatedHeading
						text="With Effortless Simplicity"
						textClassName="mt-2 block text-background"
						variant="glow"
						fontSize="clamp(2rem, 6vw, 4.3rem)"
						duration={2.5}
						gradientColors={{
							from: "var(--primary)",
							via: "var(--foreground)",
							to: "var(--accent)",
						}}
					/>
				</motion.h1>

				{/* Subheadline */}
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mx-auto mt-6 max-w-2xl text-sm text-muted-foreground sm:text-xl backdrop-blur-xs rounded-full"
				>
					The beautiful, intuitive todo app that helps you stay organized and productive. Plan your
					day, track your progress, and achieve your goals.
				</motion.p>

				{/* Feature bullets */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground backdrop-blur-xs rounded-full"
				>
					{features.map((feature, index) => (
						<div key={index} className="flex items-center gap-2">
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
					className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
				>
					<Link href="/auth/signup">
						<Button size="lg" className="group h-12 px-8 text-base">
							Get Started Free
							<TbArrowRightDashed className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Button>
					</Link>
					<Link href="#features">
						<Button variant="outline" size="lg" className="h-12 px-8 text-base">
							See Features
						</Button>
					</Link>
				</motion.div>

				{/* App Preview */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.5 }}
					className="relative mx-auto mt-16 max-w-4xl"
				>
					<div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl" />
					<div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl mb-20">
						{/* Mock Dashboard Preview */}
						<div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 py-3">
							<div className="flex gap-1.5">
								<div className="h-3 w-3 rounded-full bg-red-500" />
								<div className="h-3 w-3 rounded-full bg-yellow-500" />
								<div className="h-3 w-3 rounded-full bg-green-500" />
							</div>
							<div className="flex-1 text-center text-xs text-muted-foreground">
								TodoApp Dashboard
							</div>
						</div>
						<div className="flex min-h-[300px] sm:min-h-[400px]">
							{/* Sidebar */}
							<div className="hidden w-48 border-r border-border bg-muted/20 p-4 sm:block">
								<div className="space-y-3">
									<div className="h-4 w-24 rounded bg-primary/20" />
									<div className="h-3 w-20 rounded bg-muted" />
									<div className="h-3 w-16 rounded bg-muted" />
									<div className="h-3 w-18 rounded bg-muted" />
								</div>
							</div>
							{/* Main Content */}
							<div className="flex-1 p-4 sm:p-6">
								<div className="mb-4 h-6 w-32 rounded bg-foreground/10" />
								<div className="space-y-3">
									{[1, 2, 3].map((i) => (
										<div
											key={i}
											className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm"
										>
											<div className="h-5 w-5 rounded border-2 border-primary" />
											<div className="flex-1">
												<div className="h-3 w-full max-w-[200px] rounded bg-foreground/10" />
											</div>
											<div className="h-4 w-16 rounded-full bg-primary/20 text-xs" />
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
