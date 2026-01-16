"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TbArrowLeft, TbHomeFilled } from "react-icons/tb";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/lightswind/button";
import ParticlesBackgroundComponent from "@/components/lightswind/particles-background";

export default function NotFound() {
	return (
		<>
			{/* Particles Background - Behind everything */}
			<div className="fixed inset-0 z-0">
				<ParticlesBackgroundComponent
					colors={["#a7896c", "#d6ba89", "#ebd3a9"]}
					size={4}
					countDesktop={100}
					countTablet={80}
					countMobile={60}
					zIndex={0}
					height="100%"
				/>
				{/* Overlay gradient for better text readability */}
				<div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80 pointer-events-none" />
			</div>

			{/* Navbar - Absolute positioned at top */}
			<div className="absolute top-0 left-0 right-0 z-30">
				<Navbar />
			</div>

			{/* Main Content - Full viewport, centered */}
			<main className="relative min-h-screen flex items-center justify-center px-4 z-20">
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{
						delay: 0.2,
						duration: 0.8,
						ease: "easeInOut",
					}}
					className="relative flex flex-col items-center text-center max-w-3xl w-full"
				>
					{/* 404 Visual */}
					<div className="relative mb-8 sm:mb-12">
						{/* Glow effect */}
						<div className="absolute inset-0 blur-[100px] bg-primary/30 rounded-full scale-150 animate-pulse" />

						<h2 className="relative z-10 text-[6rem] sm:text-[8rem] md:text-[10rem] font-extrabold leading-none select-none text-primary drop-shadow-2xl">
							404
						</h2>
					</div>

					{/* Title */}
					<motion.h1
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4, duration: 0.6 }}
						className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6 text-foreground"
					>
						Page not found
					</motion.h1>

					{/* Description */}
					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.5, duration: 0.6 }}
						className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 sm:mb-12 max-w-md mx-auto leading-relaxed px-4"
					>
						The page you're looking for doesn't exist or has been moved.
					</motion.p>

					{/* Button Group */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6, duration: 0.6 }}
						className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-center w-full sm:w-auto px-4 sm:px-0"
					>
						<Button
							asChild
							size="lg"
							className="group rounded-full px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] active:scale-95 min-w-[180px]"
						>
							<Link href="/dashboard" className="flex items-center justify-center">
								<TbHomeFilled className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
								Back to Dashboard
							</Link>
						</Button>

						<Button
							asChild
							variant="outline"
							size="lg"
							className="group rounded-full px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base font-semibold border-2 border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 hover:scale-[1.02] active:scale-95 backdrop-blur-sm bg-background/60 min-w-[180px] hover:text-primary"
						>
							<Link href="/" className="flex items-center justify-center">
								<TbArrowLeft className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:-translate-x-1" />
								Go Home
							</Link>
						</Button>
					</motion.div>
				</motion.div>
			</main>

			{/* Footer - After the viewport */}
			<div className="relative z-20 bg-background">
				<Footer />
			</div>
		</>
	);
}
