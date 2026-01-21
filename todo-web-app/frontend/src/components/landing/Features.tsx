"use client";

/**
 * Features section component for the landing page
 * Uses glowing cards with scroll reveal animations
 * @module components/landing/Features
 */

import { motion } from "framer-motion";
import { FaUsers } from "react-icons/fa";
import { FiCheckSquare } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
import { TbCalendarMonth } from "react-icons/tb";
import { TfiBarChart, TfiShield } from "react-icons/tfi";
import GlowingCards, { GlowingCard } from "../lightswind/glowing-cards";

const features = [
	{
		icon: FiCheckSquare,
		title: "Task Management",
		description:
			"Create, organize, and track your tasks with an intuitive interface. Set priorities, due dates, and categories.",
		glowColor: "#3b82f6", // blue
	},
	{
		icon: TbCalendarMonth,
		title: "Calendar Integration",
		description:
			"View your tasks in a calendar view. Never miss a deadline with smart reminders and scheduling.",
		glowColor: "#a855f7", // purple
	},
	{
		icon: FaUsers,
		title: "Team Collaboration",
		description:
			"Share tasks and projects with your team. Assign responsibilities and track progress together.",
		glowColor: "#f97316", // orange
	},
	{
		icon: TfiBarChart,
		title: "Analytics & Insights",
		description:
			"Track your productivity with detailed analytics. Understand your work patterns and improve.",
		glowColor: "#22c55e", // green
	},
	{
		icon: HiOutlineSparkles,
		title: "AI-Powered Suggestions",
		description: "Get smart task suggestions and prioritization recommendations powered by AI.",
		glowColor: "#8b5cf6", // violet
	},
	{
		icon: TfiShield,
		title: "Secure & Private",
		description:
			"Your data is encrypted and secure. We never share your information with third parties.",
		glowColor: "#64748b", // slate
	},
];

export function Features() {
	return (
		<section id="features" className="py-24 px-4">
			<div className="mx-auto max-w-7xl">
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="text-center"
				>
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						Everything you need to{" "}
						<span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
							stay productive
						</span>
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
						Powerful features designed to help you manage your tasks more efficiently and achieve
						your goals faster.
					</p>
				</motion.div>

				{/* Features Grid with GlowingCards */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mt-16"
				>
					<GlowingCards
						enableGlow={true}
						glowRadius={30}
						glowOpacity={1}
						animationDuration={400}
						gap="1.5rem"
						responsive={true}
						padding="0"
					>
						{features.map((feature, index) => (
							<GlowingCard
								key={index}
								glowColor={feature.glowColor}
								className="space-y-4 min-h-50"
							>
								<div className="flex items-center space-x-3">
									<div
										className="p-2.5 rounded-lg"
										style={{ backgroundColor: `${feature.glowColor}20` }}
									>
										<feature.icon className="w-6 h-6" style={{ color: feature.glowColor }} />
									</div>
									<h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
								</div>
								<p className="text-muted-foreground leading-relaxed">{feature.description}</p>
							</GlowingCard>
						))}
					</GlowingCards>
				</motion.div>
			</div>
		</section>
	);
}
