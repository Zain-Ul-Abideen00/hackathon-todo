# Implementation Tasks: Advanced Task Features (Module 1)

**Feature**: `013-advanced-task-features`
**Spec**: [spec.md](specs/013-advanced-task-features/spec.md)
**Plan**: [plan.md](specs/013-advanced-task-features/plan.md)

## Current Focus: Phase 9 (UI Refinements)

- [x] Fix Frontend Crash: `useQuery` subscribe error in CommandPalette (Fixed with robust query config)
- [x] Fix Tag Filter: Backend not receiving tags (Fixed in `tasks.py` route)
- [x] Fix Search Command: Frontend calling wrong URL (Fixed by using `getTasks` helper)
- [x] Fix Regression: `ReferenceError: useQuery` in CommandPalette (FAILED - File Corrupted)
- [ ] **REPAIR**: Restore `CommandPalette.tsx` to working state (Prioritized)
- [x] T015 [US5] Update `list_tasks` endpoint to accept `tag_ids` filter in `todo-web-app/backend/src/api/routes/tasks.py`
- [x] T016 [US5] Update `TaskFilters` component to include Tag filter chips in `todo-web-app/frontend/src/components/tasks/TaskFilters.tsx`
- [x] T017 [US5] Implement filter state logic (tag array) in `todo-web-app/frontend/src/stores/taskStore.ts`

## Phase 1: Foundation (Blocking)

- [x] T001 Create Tag and TaskTag models in `todo-web-app/backend/src/models/tag.py` and `task_tag.py`
- [x] T002 Create RecurringPattern model in `todo-web-app/backend/src/models/recurring.py`
- [x] T003 Create Reminder and Notification models in `todo-web-app/backend/src/models/reminder.py` and `notification.py`
- [x] T004 Generate and apply Alembic migration for all new tables in `todo-web-app/backend/alembic/versions/`

## Phase 2: Tag System [US2]

- [x] T005 [US2] Implement `TagService` (CRUD, assign/unassign) in `todo-web-app/backend/src/services/tag_service.py`
- [x] T006 [US2] Implement Tag API endpoints in `todo-web-app/backend/src/api/routes/tags.py`
- [x] T007 [US2] Update `Task` model relationships (read-only link) in `todo-web-app/backend/src/models/task.py`
- [x] T008 [P] [US2] Create Tag API client functions in `todo-web-app/frontend/src/lib/api/tags.ts`
- [x] T009 [P] [US2] Create `TagSelector` component (using `lightswind/popover`) in `todo-web-app/frontend/src/components/tasks/TagSelector.tsx`
- [x] T010 [P] [US2] Create `ManageTagsDialog` component (using `lightswind/dialog`) in `todo-web-app/frontend/src/components/tasks/ManageTagsDialog.tsx`
- [x] T011 [US2] Integrate `TagSelector` into `TaskForm` (below Priority field) in `todo-web-app/frontend/src/components/tasks/TaskForm.tsx`

## Phase 3: Search UI [US1]

- [x] T012 [US1] Update `TaskService.list_tasks` to join/search Tags in `todo-web-app/backend/src/services/task_service.py`
- [x] T013 [P] [US1] Create `CommandPalette` component using `lightswind/command` in `todo-web-app/frontend/src/components/ui/command-palette.tsx`
- [x] T014 [US1] Integrate Search into `DashboardHeader` (replace current input with Ctrl+K Trigger) in `todo-web-app/frontend/src/components/layout/DashboardHeader.tsx`

## Phase 4: Filter by Tags [US5]

- [x] T015 [US5] Update `list_tasks` endpoint to accept `tag_ids` filter in `todo-web-app/backend/src/api/routes/tasks.py`
- [x] T016 [US5] Update `TaskFilters` component to include Tag filter chips in `todo-web-app/frontend/src/components/tasks/TaskFilters.tsx`
- [x] T017 [US5] Implement filter state logic (tag array) in `todo-web-app/frontend/src/stores/taskStore.ts`

## Phase 5: Notification Center [US6]

- [x] T018 [US6] Implement `NotificationService` (create, list, mark_read, delete) in `todo-web-app/backend/src/services/notification_service.py`
- [x] T019 [US6] Implement Notification API endpoints in `todo-web-app/backend/src/api/routes/notifications.py`
- [x] T020 [P] [US6] Create Notification API client in `todo-web-app/frontend/src/lib/api/notifications.ts`
- [x] T021 [P] [US6] Create `NotificationCenter` component (using `lightswind/popover`) in `todo-web-app/frontend/src/components/layout/NotificationCenter.tsx`
- [x] T022 [US6] Integrate `NotificationCenter` into `DashboardHeader` (replace static Bell) in `todo-web-app/frontend/src/components/layout/DashboardHeader.tsx`

## Phase 6: Recurring Tasks [US3]

- [x] T023 [US3] Implement `RecurringService` (generate next, process completion) in `todo-web-app/backend/src/services/recurring_service.py`
- [x] T024 [US3] Update `TaskService.create_task` and `update_task` to handle recurring pattern in `todo-web-app/backend/src/services/task_service.py`
- [x] T025 [P] [US3] Create `RecurringPicker` component (Select/Radio) in `todo-web-app/frontend/src/components/tasks/RecurringPicker.tsx`
- [x] T026 [US3] Integrate `RecurringPicker` into `TaskForm` (below Due Date) in `todo-web-app/frontend/src/components/tasks/TaskForm.tsx`

## Phase 7: Reminder Infrastructure [US4]

- [x] T027 [US4] Implement Reminder endpoints (CRUD) in `todo-web-app/backend/src/api/routes/tasks.py` (nested)
- [x] T028 [P] [US4] Add Reminder UI (Select offset) to `TaskForm` (optional section) in `todo-web-app/frontend/src/components/tasks/TaskForm.tsx`

## Phase 9: UI Refinements (Current)

- [x] T032 Update `Reminder` model/schemas to use `remind_at` (datetime) instead of offset in `backend`.
- [x] T033 Create `DateTimePicker` component in `frontend/src/components/ui/date-time-picker.tsx` (using `lightswind` + `input-group`).
- [x] T034 Update `TaskForm` to use `DateTimePicker` for reminders list.
- [x] T035 Add Icons (Calendar, Repeat, Bell) to `TaskForm` inputs.
- [x] T036 Implement background reminder poller in `backend/src/main.py` (checks every 60s).
- [x] T037 Fix `TaskForm` not sending `recurring` and `reminders` data to API.
- [x] T038 Fix `MissingGreenlet` error in recurring task logic by avoiding lazy load after commit.
- [x] T039 Fix task deletion failure for tasks with recurring patterns/tags by adding cascade and manual cleanup.

## Phase 8: Verification & Polish

- [ ] T029 Verify E2E Search workflow (Cmd+K -> Find labeled task)
- [ ] T030 Verify Recurring Task generation (Complete -> New instance created)
## Phase 10: Notification Enhancements

- [x] T040 Backend: Add `type` (info, success, warning, error) and `category` (task, reminder, system) to `Notification` model to support rich UI.
- [x] T041 Backend: Update `recurring_service` to create a notification when a new recurring task is generated.
- [x] T042 Frontend: Install `sonner` for premium toast notifications.
- [x] T043 Frontend: Create `useToast` hook or wrapper for consistent toast styling.
- [x] T044 Frontend: Enhance `NotificationCenter` to show different icons/colors based on notification type.
- [x] T045 Frontend: Add "real-time" polling (SWR/Query) to `NotificationCenter` to auto-fetch new notifications.
## Phase 11: Overdue & Smart Notifications

- [x] T047 Backend: Add `overdue_notified_at` to `Task` model in `src/models/task.py`.
- [x] T048 Backend: Implement `process_overdue_tasks` in `src/services/overdue_service.py` (check `due_date < now` & `overdue_notified_at is None`).
- [x] T049 Backend: Add background loop for overdue checks in `main.py` (every 5 mins).
- [x] T050 Backend: Update `process_due_reminders` in `reminder_service.py` to use dynamic message logic (time-to-due calc).
- [x] T051 Frontend: Update `NotificationCenter` to show "Overdue" notifications with red alert styling.
