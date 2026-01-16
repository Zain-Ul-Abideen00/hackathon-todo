/**
 * Landing page - Home
 * Showcases the Todo app with Navbar, Hero, Features, and Footer
 * @module app/page
 */

import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex-1">
				<Hero />
				<Features />
			</main>
			<Footer />
		</div>
	);
}
