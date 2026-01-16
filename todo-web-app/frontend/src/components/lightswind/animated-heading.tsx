"use client";

import { cn } from "../../lib/utils";

export interface AnimatedHeadingProps {
	text: string;
	className?: string;
	/** Additional classes for the text element */
	textClassName?: string;
	/** Animation variant */
	variant?: "gradient" | "glow" | "gradient-glow";
	/** Font size - use any CSS value */
	fontSize?: string;
	/** Animation duration in seconds */
	duration?: number;
	/** Custom gradient colors */
	gradientColors?: {
		from?: string;
		via?: string;
		to?: string;
	};
	/** Glow color */
	glowColor?: string;
}

export function AnimatedHeading({
	text,
	className,
	textClassName,
	variant = "gradient",
	fontSize = "clamp(2.5rem, 6vw, 4.5rem)",
	duration = 3,
	gradientColors = {
		from: "var(--primary)",
		via: "var(--accent)",
		to: "var(--foreground)",
	},
	glowColor = "var(--primary)",
}: AnimatedHeadingProps) {
	const keyframes = `
    @keyframes gradient-flow {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    @keyframes glow-pulse {
      0%, 100% {
        text-shadow: 0 0 10px ${glowColor}, 0 0 20px ${glowColor}, 0 0 30px ${glowColor};
        opacity: 1;
      }
      50% {
        text-shadow: 0 0 25px ${glowColor}, 0 0 50px ${glowColor}, 0 0 75px ${glowColor};
        opacity: 0.95;
      }
    }
  `;

	// Gradient variant - smooth animated color flow
	if (variant === "gradient") {
		return (
			<div className={cn("flex items-center justify-center", className)}>
				<style>{keyframes}</style>
				<h1
					className={cn("font-extrabold tracking-tight", textClassName)}
					style={{
						fontSize,
						background: `linear-gradient(
              90deg,
              ${gradientColors.from} 0%,
              ${gradientColors.via} 33%,
              ${gradientColors.to} 66%,
              ${gradientColors.via} 100%
            )`,
						backgroundSize: "300% 100%",
						WebkitBackgroundClip: "text",
						backgroundClip: "text",
						WebkitTextFillColor: "transparent",
						animation: `gradient-flow ${duration}s ease-in-out infinite`,
					}}
				>
					{text}
				</h1>
			</div>
		);
	}

	// Glow variant - pulsing glow effect
	if (variant === "glow") {
		return (
			<div className={cn("flex items-center justify-center", className)}>
				<style>{keyframes}</style>
				<h1
					className={cn("font-extrabold tracking-tight text-foreground", textClassName)}
					style={{
						fontSize,
						animation: `glow-pulse ${duration}s ease-in-out infinite`,
					}}
				>
					{text}
				</h1>
			</div>
		);
	}

	// Gradient-Glow variant - combines animated gradient with pulsing glow
	if (variant === "gradient-glow") {
		return (
			<div className={cn("flex items-center justify-center", className)}>
				<style>{keyframes}</style>
				<h1
					className={cn("font-extrabold tracking-tight", textClassName)}
					style={{
						fontSize,
						background: `linear-gradient(
              90deg,
              ${gradientColors.from} 0%,
              ${gradientColors.via} 33%,
              ${gradientColors.to} 66%,
              ${gradientColors.via} 100%
            )`,
						backgroundSize: "300% 100%",
						WebkitBackgroundClip: "text",
						backgroundClip: "text",
						WebkitTextFillColor: "transparent",
						animation: `gradient-flow ${duration}s ease-in-out infinite`,
						filter: `drop-shadow(0 0 15px ${glowColor}) drop-shadow(0 0 30px ${glowColor})`,
					}}
				>
					{text}
				</h1>
			</div>
		);
	}

	// Default fallback
	return (
		<div className={cn("flex items-center justify-center", className)}>
			<h1
				className={cn("font-extrabold tracking-tight text-foreground", textClassName)}
				style={{ fontSize }}
			>
				{text}
			</h1>
		</div>
	);
}

export default AnimatedHeading;
