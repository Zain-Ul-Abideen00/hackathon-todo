# Research & Architecture Decisions

**Feature**: Advanced Task Features (Module 1)
**Date**: 2026-02-02

## 1. Recurring Tasks Pattern
**Decision**: Use "Lazy Generation" (Record next occurrence only when current is completed).
**Rationale**:
- Simple state management (no need to manage future instances that might change).
- aligns with "GTD" (Getting Things Done) where future tasks are not "Todo" yet.
- Spec FR-014 supports this: "automatically generate next... when completed".

**Alternative**: "Batch Pre-generation" (Create next 10 instances).
- **Rejected**: Too complex to handle edits to the pattern (must update/delete all future instances).

## 2. Notification Persistence
**Decision**: Create a dedicated `Notification` table + `Reminder` table.
**Rationale**:
- `Reminder`: Stores the configuration (e.g., "1 hour before due_date").
- `Notification`: Stores the *delivered* event (title, message, is_read).
- Separation of concerns: Reminder is "Config", Notification is "Inbox".
- API: `GET /api/notifications` returns items from `Notification` table.

## 3. Frontend State Management for Notifications
**Decision**: Use **TanStack React Query** for polling/fetching notifications.
**Rationale**:
- `@tanstack/react-query` is already installed in `package.json`.
- Provides caching, auto-refetching, and window focus refetching out of the box.
- Notification badge needs real-time-ish updates; polling every 60s is standard for MVP.

## 4. Search Filter Logic
**Decision**: Join `TaskTag` table for filtering (Backend).
**Rationale**:
- Efficient SQL `JOIN` vs fetching all tags and filtering in memory.
- Scalable if user has 1000s of tasks.

## 5. Tag Colors
**Decision**: Store as hex string (e.g. `FF5500`) without `#`.
**Rationale**:
- Simplifies URL param validation.
- Frontend adds `#` for display.
