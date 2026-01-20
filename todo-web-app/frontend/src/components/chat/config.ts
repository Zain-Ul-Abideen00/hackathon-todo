/**
 * ChatKit Configuration
 *
 * Centralized configuration for ChatKit including API URLs,
 * starter prompts, tool choices, and theme settings.
 */

import { DisclaimerOption, ModelOption, StartScreenPrompt, ToolOption } from "@openai/chatkit-react";
import { FaLessThanEqual } from "react-icons/fa6";



// API Configuration
export const CHATKIT_API_URL =
	process.env.NEXT_PUBLIC_CHATKIT_URL || "http://localhost:8000/api/chat";

export const CHATKIT_DOMAIN_KEY =
	process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || "localhost";

// Theme Configuration
export const THEME_STORAGE_KEY = "theme";

// Start Screen
export const GREETING = "Hi! I'm your Todo Assistant. I can help you manage your tasks. 📝";

export const STARTER_PROMPTS: StartScreenPrompt[] = [
	{
		label: "Add a new task",
		prompt: "Add a task to buy groceries",
		icon: "write",
	},
	{
		label: "Show my tasks",
		prompt: "What tasks do I have?",
		icon: "book-open",
	},
	{
		label: "Complete a task",
		prompt: "I finished one of my tasks",
		icon: "check",
	},
	{
		label: "Get help",
		prompt: "How do I use this assistant?",
		icon: "info",
	},
];

/**
 * Tool choices for the composer toolbar
 * These match the backend agent tools exactly
 */
export const TOOL_CHOICES: ToolOption[] = [
	{
		id: "add_task",
		label: "Add Task",
		shortLabel: "Add",
        icon: "write-alt",
        pinned: true,
		placeholderOverride: "What task do you want to add?",
	},
	{
		id: "list_tasks",
		label: "View Tasks",
		shortLabel: "Tasks",
		icon: "book-open",
		placeholderOverride: "Show my tasks (all, pending, or completed)",
	},
	{
		id: "complete_task",
		label: "Complete Task",
		shortLabel: "Done",
		icon: "check",
		placeholderOverride: "Which task did you complete?",
	},
	{
		id: "update_task",
		label: "Update Task",
		shortLabel: "Edit",
		icon: "notebook-pencil",
		placeholderOverride: "What would you like to change?",
	},
	{
		id: "delete_task",
		label: "Delete Task",
		shortLabel: "Delete",
		icon: "atom",
		placeholderOverride: "Which task should I remove?",
	},
];

export const MODEL_CHOICES: ModelOption[] = [
    {
        default: true,
        description: "MoE model with thinking mode",
        id: "groq-kimi-k2",
        label: "Groq Kimi K2",
    },
	{
		default: false,
		description: "Multi-language model",
		id: "groq-llama-3.3-70b",
		label: "Groq Llama 3.3",
	},
	{
		default: false,
		description: "Fast & powerful",
		id: "gemini-2.5-flash",
		label: "Gemini Flash",
	},
];

export const DISCLAIMER: DisclaimerOption = {
    text: "Made with ❤️ by Zain Ul Abideen",
	highContrast: false,
};

/**
 * Dynamic placeholder based on thread state
 */
export const getPlaceholder = (hasThread: boolean): string => {
	return hasThread
		? "What else can I help with?"
		: "What would you like to do today?";
};

/**
 * Font sources for ChatKit typography
 */
export const FONT_SOURCES = [
	// {
	// 	family: "Texturina",
	// 	src: "https://fonts.gstatic.com/s/texturina/v32/c4mM1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjMwhAgliHhVrXy2d_HfUg.ttf",
	// 	weight: 700,
	// 	style: "normal" as const,
	// 	display: "swap" as const,
	// },
	{
		family: "Texturina",
		src: "https://fonts.gstatic.com/s/texturina/v32/c4mM1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjMwhAgliHhVrXy2eYGvUg.ttf",
		weight: 400,
		style: "normal" as const,
		display: "swap" as const,
	},
	{
		family: "Inter",
		src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZg.woff2",
		weight: 600,
		style: "normal" as const,
		display: "swap" as const,
	},
];
