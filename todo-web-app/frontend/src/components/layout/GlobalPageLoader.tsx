"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MdEmojiEmotions } from "react-icons/md";
import RippleLoader from "@/components/lightswind/ripple-loader";

export function GlobalPageLoader() {
	const [loading, setLoading] = useState(true);
	const _pathname = usePathname();

	useEffect(() => {
		// Simulate a small delay or wait for hydration
		const timer = setTimeout(() => {
			setLoading(false);
		}, 3000); // 500ms minimum display time to prevent flickering

		return () => clearTimeout(timer);
	}, []);

	if (!loading) return null;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
			<RippleLoader
				icon={<MdEmojiEmotions />}
				size={400}
				duration={3}
				logoColor={{ light: "#664b31", dark: "#f2d5b8" }}
				rippleColor={{ light: "#946e4a", dark: "#c7a990" }}
			/>
		</div>
	);
}
