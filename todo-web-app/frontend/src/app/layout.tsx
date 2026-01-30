import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "@/app/globals.css";
import { ChatWidgetFacade } from "@/components/chat/ChatWidgetFacade";
import Loading from "./loading";

// Lazy load non-critical UI components
// const Loader = dynamic(() => import("@/app/loading").then(mod => mod.loading));
const ToastProvider = dynamic(() => import("@/components/providers/ToastProvider").then(mod => mod.ToastProvider));

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
            <head />
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
                        {/* <Loading /> */}
                        {children}
                        <ChatWidgetFacade />
                        <ToastProvider />
                    </QueryProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
