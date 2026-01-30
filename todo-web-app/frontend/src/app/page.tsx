/**
 * Landing page - Home
 * Showcases the Todo app with Navbar, Hero, Features, and Footer
 * @module app/page
 */

import dynamic from "next/dynamic";
import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/layout/Navbar";
import { LandingCursor } from "@/components/landing/LandingCursor";

const Features = dynamic(() => import("@/components/landing/Features").then(mod => mod.Features), {
    loading: () => <div className="min-h-50" />,
});
const Pricing = dynamic(() => import("@/components/landing/Pricing").then(mod => mod.Pricing));
const About = dynamic(() => import("@/components/landing/About").then(mod => mod.About));
const Footer = dynamic(() => import("@/components/layout/Footer").then(mod => mod.Footer));

export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden">
            <Navbar />
            <main className="flex-1">
                <Hero />
                <Features />
                <Pricing />
                <About />
            </main>
            <Footer />
            <LandingCursor />
        </div>
    );
}
