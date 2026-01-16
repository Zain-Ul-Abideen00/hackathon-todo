"use client";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

type RippleLoaderProps = {
	icon?: React.ReactNode;
	size?: number;
	duration?: number; // in seconds
	logoColor?: string | { light: string; dark: string };
	rippleColor?: string | { light: string; dark: string };
};

// Helper to convert hex to rgb
const hexToRgb = (hex: string) => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
		: "100, 100, 100"; // default gray
};

const RippleLoader: React.FC<RippleLoaderProps> = ({
	icon,
	size = 250,
	duration = 2,
	logoColor = "grey",
	rippleColor = "#646464", // default gray
}) => {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const isDark = resolvedTheme === "dark";

	const resolveColor = (color: string | { light: string; dark: string }) => {
		if (typeof color === "string") return color;
		return isDark ? color.dark : color.light;
	};

	const finalLogoColor = resolveColor(logoColor);
	const finalRippleColor = resolveColor(rippleColor);

	const baseInset = 40;
	const rgb = hexToRgb(finalRippleColor);

	const rippleBoxes = Array.from({ length: 5 }, (_, i) => ({
		inset: `${baseInset - i * 10}%`,
		zIndex: -1 - i,
		delay: i * 0.2,
		opacity: 1 - i * 0.2,
	}));

	return (
		<div className="relative" style={{ width: size, height: size }}>
			{rippleBoxes.map((box, i) => (
				<motion.div
					key={i}
					className="absolute rounded-full border-t backdrop-blur-[5px]"
					style={{
						inset: box.inset,
						zIndex: box.zIndex,
						borderColor: `rgba(${rgb},${box.opacity})`,
						background: `linear-gradient(0deg, rgba(${rgb}, 0.2), rgba(${rgb}, 0.2))`,
					}}
					animate={{
						scale: [1, 1.3, 1],
						boxShadow: [
							`rgba(0, 0, 0, 0.3) 0px 10px 10px 0px`,
							`rgba(0, 0, 0, 0.3) 0px 30px 20px 0px`,
							`rgba(0, 0, 0, 0.3) 0px 10px 10px 0px`,
						],
					}}
					transition={{
						repeat: Infinity,
						duration,
						delay: box.delay,
						ease: "easeInOut",
					}}
				/>
			))}

			<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
				<motion.span
					className="z-100 flex items-center justify-center"
					style={{ width: "18%", height: "18%" }}
					animate={{ scale: [1, 1.7, 1] }}
					transition={{
						repeat: Infinity,
						duration,
						ease: "easeInOut",
					}}
				>
					{icon &&
						React.cloneElement(icon as React.ReactElement<{ style?: React.CSSProperties }>, {
							style: {
								width: "100%",
								height: "100%",
								fill: finalLogoColor,
								// stroke: finalLogoColor,
							},
						})}
				</motion.span>
			</div>
		</div>
	);
};

export default RippleLoader;
