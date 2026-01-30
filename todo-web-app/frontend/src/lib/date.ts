
const TARGET_TIMEZONE = "Asia/Karachi";

/**
 * Helper to parse a date string (assumed UTC if naive) into a Date object
 */
function parseUTC(date: string | Date | null | undefined): Date | null {
    if (!date) return null;
    if (date instanceof Date) return date;

    // If string is naive format (e.g. "2026-01-26T12:00:00"), append Z to treat as UTC
    // If it already has Z or offset, parseISO handles it.
    let dateStr = date;
    if (!dateStr.endsWith("Z") && !dateStr.includes("+") && dateStr.includes("T")) {
        dateStr += "Z";
    }
    return new Date(dateStr);
}

/**
 * Format a date string or object to a standard display format in Karachi Time
 * Example: "Jan 24, 2026"
 */
export function formatDate(date: string | Date | null | undefined): string {
    const d = parseUTC(date);
    if (!d) return "";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: TARGET_TIMEZONE
    }).format(d);
}

/**
 * Format a date string or object to a standard datetime format in Karachi Time
 * Example: "Jan 24, 2026, 10:00 PM"
 */
export function formatDateTime(date: string | Date | null | undefined): string {
    const d = parseUTC(date);
    if (!d) return "";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone: TARGET_TIMEZONE
    }).format(d);
}

/**
 * Format a due date relatively (Today, Tomorrow, or standard date) in Karachi Time
 */
export function formatDueDate(date: string | Date | null | undefined): string {
    const d = parseUTC(date);
    if (!d) return "";

    // To calculate "Today" / "Tomorrow" in Karachi:
    // 1. Get current time in Karachi
    // 2. Get target time in Karachi
    // 3. Compare their "YYYY-MM-DD" parts

    const fmt = (date: Date) => new Intl.DateTimeFormat("en-CA", { // YYYY-MM-DD
        timeZone: TARGET_TIMEZONE
    }).format(date);

    const nowKarachi = fmt(new Date());
    const targetKarachi = fmt(d);

    if (nowKarachi === targetKarachi) {
        return "Today";
    }

    // Check tomorrow (add 1 day to now, format as Karachi)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKarachi = fmt(tomorrow);

    if (targetKarachi === tomorrowKarachi) {
        return "Tomorrow";
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKarachi = fmt(yesterday);
    if (targetKarachi === yesterdayKarachi) {
        return "Yesterday";
    }

    // Check if within next 7 days (show Weekday Name e.g., "Wednesday")
    // Compare timestamp of the "start of day" in Karachi to count full days
    // Simplified approach: Parse the YYYY-MM-DD strings back to compare days difference
    const nowKDate = new Date(nowKarachi);
    const targetKDate = new Date(targetKarachi);
    const diffTime = targetKDate.getTime() - nowKDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1 && diffDays < 7) {
        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            timeZone: TARGET_TIMEZONE
        }).format(d);
    }

    // Default: Just the date
    return formatDate(d);
}
