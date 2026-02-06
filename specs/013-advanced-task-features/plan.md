# Implementation Plan - Advanced Task Features (Module 1)

**Branch**: `013-advanced-task-features` | **Date**: 2026-02-02 | **Spec**: [spec.md](specs/013-advanced-task-features/spec.md)
**Input**: Feature specification and user-provided technical implementation details.

## Summary

Implement advanced task management features including:
1. **Tags System**: Categorize tasks with colored tags (Many-to-Many).
2. **Recurring Tasks**: Pattern-based task generation (Daily/Weekly/Monthly).
3. **Reminder Infrastructure**: Data model and API for setting reminders (delivery in Module 2).
4. **Notification Center**: Dashboard UI to view/manage persistence notifications.
5. **Search**: Command palette for tasks and tags.
6. **UI Refinements**: New Date/Time picker for reminders, Icons for Task Form.

## Technical Context

**Language/Version**: Python 3.12 (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel (Async), Alembic, Pydantic v2
- Frontend: Next.js 16 (App Router), React 19, Zustand (Store), Lightswind UI, Framer Motion
**Storage**: Neon PostgreSQL (asyncpg)
**Testing**: pytest (Backend), Vitest (Frontend), Playwright (E2E)
**Target Platform**: Kubernetes (Minikube dev, OKE prod) - Feature is application-layer.
**Project Type**: Full-stack Web Application
**Performance Goals**: Search < 100ms response, Recurrence generation < 5s
**Constraints**:
- Recursion: "Lazy" generation (on completion of previous task)
- Notifications: Soft-delete (read = boolean)
- Max 50 tags per user

## Constitution Check

- [x] **Authoritative Source**: Using `spec.md` and user-provided architecture.
- [x] **Execution Flow**: Plan -> Tasks -> Code.
- [x] **Knowledge Capture**: PHR to be created.
- [x] **ADR Significance**: Schema changes for Recurring/Tags are standard, no ADR needed unless complex recursion logic is introduced. (Simple patterns chosen: Daily/Weekly/Monthly).

## Project Structure

### Documentation (this feature)

```text
specs/013-advanced-task-features/
├── plan.md              # This file
├── research.md          # Architecture decisions
├── data-model.md        # DB Schema & API Contracts
├── checklists/          # Verification checklists
└── tasks.md             # Implementation tasks
```

### Source Code

```text
# Backend
backend/src/
├── models/
│   ├── tag.py           # [NEW] Tag model
│   ├── task_tag.py      # [NEW] Link table
│   ├── recurring.py     # [NEW] Pattern model
│   ├── reminder.py      # [NEW] Reminder model
│   └── notification.py  # [NEW] Notification model
├── services/
│   ├── tag_service.py         # [NEW] Tag CRUD
│   ├── recurring_service.py   # [NEW] Pattern logic
│   └── notification_service.py # [NEW] Notif logic
└── api/routes/
    ├── tags.py          # [NEW] Tag endpoints
    └── notifications.py # [NEW] Notif endpoints

# Frontend
frontend/src/
├── components/
│   ├── tasks/
│   │   ├── TagSelector.tsx      # [NEW] UI
│   │   └── RecurringPicker.tsx  # [NEW] UI
│   └── layout/
│       └── DashboardHeader.tsx  # [MODIFY] Add Notification Center
├── stores/
│   └── notificationStore.ts     # [NEW] State
└── app/dashboard/
    └── page.tsx                 # [MODIFY] Search/Filters
```

## Complexity Tracking

## Phase 10: Notification Enhancements (Premium Real-time UX)

### Backend
#### [MODIFY] [notification.py](file:///backend/src/models/notification.py)
- Add `type` field (reminder, system, recurring, achievement).
- Add `link` field (optional URL to navigate to).

#### [MODIFY] [notification_service.py](file:///backend/src/services/notification_service.py)
- Create helper methods for system notifications.

#### [MODIFY] [task_service.py](file:///backend/src/services/task_service.py)
- Trigger notifications on Task Creation and Completion.

#### [MODIFY] [recurring_service.py](file:///backend/src/services/recurring_service.py)
- Trigger notification when a recurring task is automatically generated.

### Frontend
#### [NEW] [ToastProvider.tsx](file:///frontend/src/providers/ToastProvider.tsx)
- Implement a premium toast system (using `sonner` or custom framer-motion).

#### [MODIFY] [useNotifications.ts](file:///frontend/src/hooks/useNotifications.ts)
- Implement SWR/TanStack Query polling for "real-time" notification updates (e.g., every 15s or dynamic).

## Phase 11: Overdue & Smart Notifications

### Backend
#### [MODIFY] [task.py](file:///backend/src/models/task.py)
- Add `overdue_notified_at` (datetime) to track if we've already alerted the user.

#### [NEW] [overdue_service.py](file:///backend/src/services/overdue_service.py)
- Implement `process_overdue_tasks(session)` to find tasks where `due_date < now` AND `status != completed` AND `overdue_notified_at IS NULL`.
- Send system notification with type="error" (Critical).

#### [MODIFY] [main.py](file:///backend/src/main.py)
- Add background loop for `process_overdue_tasks` (e.g., every 5 minutes).

#### [MODIFY] [reminder_service.py](file:///backend/src/services/reminder_service.py)
- Enhance message generation to be dynamic:
  - "Task is due in 15 minutes."
  - "Task is due tomorrow at 10 AM." (if remind_at is day before)
  - "Task is due NOW."

### Frontend
- Update `NotificationCenter` to handle "critical" notifications with distinct styling (Red border/icon).
