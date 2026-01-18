import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { GlobalPageLoader } from "@/components/layout/GlobalPageLoader";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import "@/app/globals.css";
import { ChatBot } from "@/components/chat/ChatBot";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Todo App - Manage Your Tasks Effortlessly",
    description:
        "A beautiful, production-ready todo application with task management, calendar integration, and team collaboration features.",
    keywords: ["todo", "task management", "productivity", "organization"],
    authors: [{ name: "Todo App Team" }],
    openGraph: {
        title: "Todo App - Manage Your Tasks Effortlessly",
        description:
            "A beautiful, production-ready todo application with task management, calendar integration, and team collaboration features.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* ChatKit Web Component Script - MUST be beforeInteractive */}
                <Script
                    src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
                    strategy="beforeInteractive"
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryProvider>
                        <GlobalPageLoader />
                        {children}
                        <ChatBot />
                        <ToastProvider />
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
