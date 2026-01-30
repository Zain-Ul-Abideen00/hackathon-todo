"use client";

/**
 * Footer component for the landing page
 * @module components/layout/Footer
 */

import Link from "next/link";
import { FaXTwitter as Twitter } from "react-icons/fa6";
import { FiCheckSquare as CheckSquare, FiGithub as Github } from "react-icons/fi";
import { ToggleTheme } from "@/components/lightswind/toggle-theme";

const footerLinks = {
    product: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Integrations", href: "#" },
        { label: "Changelog", href: "#" },
    ],
    company: [
        { label: "About", href: "#about" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
    ],
    legal: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Security", href: "#" },
    ],
};

const socialLinks = [
    { label: "GitHub", href: "https://github.com", icon: Github },
    { label: "Twitter", href: "https://twitter.com", icon: Twitter },
];

export function Footer() {
    return (
        <footer className="border-t border-border bg-muted/30">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                            <CheckSquare className="h-6 w-6 text-primary" />
                            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                TodoApp
                            </span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                            The beautiful, intuitive todo app that helps you stay organized and productive.
                        </p>
                        <div className="mt-6 flex items-center gap-4">
                            <ToggleTheme animationType="diag-down-right" />
                            {socialLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg p-2 text-muted-foreground hover:scale-110 transition-all duration-500 cursor-pointer hover:bg-muted hover:text-accent"
                                    aria-label={link.label}
                                >
                                    <link.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Product
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Company
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Legal
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} TodoApp. All rights reserved.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Made with{" "}
                        <span className="inline-block text-lg animate-pulse" role="img" aria-label="heart">
                            ❤️
                        </span>{" "}
                        by Zain Ul Abideen
                    </p>
                </div>
            </div>
        </footer>
    );
}
