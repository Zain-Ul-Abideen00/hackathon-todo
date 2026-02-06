# Feature Specification: Advanced Task Features (Module 1)

**Feature Branch**: `013-advanced-task-features`
**Created**: 2026-02-02
**Status**: Draft
**Input**: User description: "Advanced Task Features - Module 1: Recurring tasks, tags/categories, search, filters, and reminders"

## Overview

This feature extends the existing Todo application with advanced task management capabilities including task categorization through tags, recurring task patterns, and preparation for due date reminders. The feature builds upon the existing Task model which already supports status, priority, and due dates.

### What Exists (Out of Scope for Implementation)

The following capabilities already exist in the codebase:
- **Priority levels** (low, medium, high) - Task model already has `priority` field
- **Sorting** by created_at, title, due_date, priority - Already in `list_tasks_paginated`
- **Status filtering** (todo, in_progress, completed, overdue) - Already implemented
- **Priority filtering** - Already implemented
- **Backend search API** - Already implemented via `search` parameter in `list_tasks_paginated`

### What This Feature Adds

1. **Search UI** - Command palette search component (frontend implementation)
2. Tags/Categories system for task organization
3. Recurring task patterns (daily, weekly, monthly)
4. Reminder infrastructure (preparing for Dapr integration in Module 2)
5. Enhanced filtering by tags
6. Notification Center (with persistence and management)

## Clarifications

### Session 2026-02-02
- Q: Do "read" notifications remain visible in the list? → A: Yes, they remain grayed out. Users can delete individual notifications or "Clear All" to remove them.
- Q: Should search match tag names? → A: Yes, search matches title, description, and assigned tag names.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Tasks (Priority: P1)

As a user, I want to quickly search for tasks by keyword so I can find specific tasks without scrolling through my entire list.

**Why this priority**: Search is a fundamental feature for task discovery. The backend API already supports search, but the frontend lacks a functional search UI. Using the Command palette component provides a modern, keyboard-friendly search experience.

**Independent Test**: User presses Ctrl+K (or clicks search), types "meeting", and sees all tasks containing "meeting" in title or description. Results appear in real-time as they type.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the dashboard, **When** they press Ctrl+K or Cmd+K, **Then** a command palette search dialog opens
2. **Given** the search dialog is open, **When** the user types a keyword, **Then** matching tasks appear in real-time (debounced)
3. **Given** search results are displayed, **When** the user clicks a task or presses Enter, **Then** they navigate to that task or it becomes focused in the list
4. **Given** the search dialog is open, **When** the user presses Escape, **Then** the dialog closes
5. **Given** no tasks match the search query, **When** results are shown, **Then** a "No tasks found" message appears

---

### User Story 2 - Tag/Categorize Tasks (Priority: P1)

As a user, I want to create custom tags with colors and assign them to my tasks so I can organize tasks by project, context, or any category that makes sense to me.

**Why this priority**: Tags provide the foundation for task organization and are the most commonly requested feature for task management. They enable filtering and visual categorization.

**Independent Test**: User can create a "Work" tag with a blue color, assign it to a task, and see the tag displayed on the task card. They can also filter to see only tasks with the "Work" tag.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they navigate to tags settings, **Then** they can create a new tag with a name (max 50 chars) and hex color code
2. **Given** a user with existing tags, **When** they edit a task, **Then** they can assign/unassign multiple tags using a multi-select component
3. **Given** tasks with tags, **When** viewing the task list, **Then** each task displays its assigned tags as colored badges
4. **Given** a user with tagged tasks, **When** they select a tag filter, **Then** only tasks with that tag are displayed
5. **Given** a user, **When** they delete a tag, **Then** the tag is removed from all associated tasks without deleting the tasks

---

### User Story 3 - Recurring Tasks (Priority: P2)

As a user, I want to set up recurring tasks that automatically regenerate based on a pattern (daily, weekly, monthly) so I don't have to manually create repetitive tasks.

**Why this priority**: Recurring tasks reduce manual effort for routine activities like "Weekly review" or "Daily standup" and are essential for habit tracking and routine management.

**Independent Test**: User creates a task "Water plants" with weekly recurrence. When they complete it, a new instance automatically appears with the next week's due date.

**Acceptance Scenarios**:

1. **Given** a user creating a task, **When** they enable recurrence, **Then** they can select a pattern (daily, weekly, monthly) and set an optional end date
2. **Given** a recurring task is marked complete, **When** the next occurrence is due, **Then** a new task instance is automatically created with updated due date
3. **Given** a weekly recurring task, **When** the user views task details, **Then** they see the recurrence pattern displayed (e.g., "Repeats weekly")
4. **Given** a recurring task with an end date, **When** the end date passes, **Then** no new task instances are created
5. **Given** a user edits a recurring task, **When** they modify the recurrence pattern, **Then** future instances follow the new pattern

---

### User Story 4 - Reminder Infrastructure (Priority: P3)

As a user, I want to set reminders for tasks with due dates so I receive notifications before deadlines. (Note: Actual notification delivery will be implemented in Module 2 via Dapr pub/sub)

**Why this priority**: While reminders are valuable, the notification infrastructure (Dapr) is in Module 2. This story focuses on the data model and API for setting reminders.

**Independent Test**: User sets a reminder for 1 hour before a task's due date. The reminder is stored and can be retrieved via API. (Notification triggering is Module 2 scope)

**Acceptance Scenarios**:

1. **Given** a task with a due date, **When** the user enables reminders, **Then** they can choose reminder timing (e.g., 15 min, 1 hour, 1 day before)
2. **Given** a task with a reminder, **When** viewing task details, **Then** the reminder configuration is visible
3. **Given** multiple tasks with reminders, **When** querying the API, **Then** reminders due within a time window can be retrieved (for Dapr scheduler to poll)
4. **Given** a task reminder, **When** the task is deleted, **Then** the associated reminder is also removed

---

### User Story 5 - Filter by Tags (Priority: P1)

As a user, I want to filter my task list by tags so I can focus on specific categories of work.

**Why this priority**: Filtering by tags is the primary value proposition of the tagging system and makes tags useful for organization.

**Independent Test**: User with 10 tasks tagged across "Work", "Personal", and "Errands" can filter to see only "Work" tasks.

**Acceptance Scenarios**:

1. **Given** a task list with tagged tasks, **When** the user selects one or more tag filters, **Then** only tasks matching ALL selected tags are shown
2. **Given** an active tag filter, **When** combined with other filters (status, priority), **Then** the combined filter logic works correctly (AND logic)
3. **Given** a tag filter applied, **When** the user clears the filter, **Then** all tasks are shown again

---

### User Story 6 - Notification Center (Priority: P2)

As a user, I want to click the notification bell icon to see my pending reminders and overdue tasks so I stay informed about urgent items.

**Why this priority**: The notification icon already exists in the dashboard header but has no functionality. This story activates it to display reminder-based notifications, connecting the reminder infrastructure to a user-facing feature.

**Independent Test**: User clicks the bell icon, sees a dropdown with upcoming reminders and overdue tasks sorted by urgency. Clicking a notification navigates to that task.

**Acceptance Scenarios**:

1. **Given** a user with reminders or overdue tasks, **When** they click the notification bell, **Then** a dropdown/popover displays the notifications
2. **Given** notifications in the dropdown, **When** the user clicks one, **Then** they navigate to or focus on that task
3. **Given** unread notifications, **When** viewing the header, **Then** a badge shows the count of unread items
4. **Given** an unread notification, **When** the user dismisses/clicks it, **Then** it becomes "read" (grayed out) but remains in the list
5. **Given** a notification in the list, **When** user clicks "Delete/X", **Then** it is removed from the list permanently
6. **Given** multiple notifications, **When** user clicks "Clear All", **Then** all notifications are deleted
7. **Given** no notifications, **When** the user clicks the bell, **Then** an empty state message appears ("All caught up!")

---

### Edge Cases

- What happens when a user creates a tag with the same name as an existing tag? → Reject with validation error
- What happens when a recurring task has no due date? → Recurrence cannot be enabled without a base due date
- How does system handle monthly recurrence on dates like Jan 31? → Falls back to last day of target month
- What happens when a user deletes a recurring task? → Only deletes current instance, template is unaffected (or prompt user)
- What if a tag color is not valid hex? → Frontend validates, backend rejects with 400 error
- What happens when search returns too many results? → Limit to 20 results with "show more" option
- What if search is triggered with empty query? → Show recent tasks or popular tags as suggestions
- What happens when notification count exceeds 99? → Display "99+" badge
- How are notifications sorted? → By urgency: overdue first, then by reminder time ascending

## Requirements *(mandatory)*

### Functional Requirements

**Search UI:**
- **FR-001**: System MUST provide a command palette search accessible via Ctrl+K / Cmd+K keyboard shortcut
- **FR-002**: System MUST search task titles, descriptions, and assigned tag names as user types (debounced, 300ms)
- **FR-003**: System MUST display search results in real-time within the command palette
- **FR-004**: System MUST allow navigation to selected task from search results
- **FR-005**: System MUST close search dialog on Escape key or clicking outside

**Tag System:**
- **FR-006**: System MUST allow users to create tags with a name (1-50 characters) and hex color code
- **FR-007**: System MUST enforce unique tag names per user (case-insensitive)
- **FR-008**: System MUST allow users to update tag name and color
- **FR-009**: System MUST allow users to delete tags, removing them from all associated tasks
- **FR-010**: System MUST allow assigning multiple tags to a single task (many-to-many relationship)
- **FR-011**: System MUST support filtering tasks by one or more tags using AND logic

**Recurring Tasks:**
- **FR-012**: System MUST support recurrence patterns: daily, weekly, monthly
- **FR-013**: System MUST allow optional end date for recurrence
- **FR-014**: System MUST automatically generate next task instance when a recurring task is completed
- **FR-015**: System MUST copy title, description, priority, and tags to new instances
- **FR-016**: System MUST calculate next due date based on pattern from current due date
- **FR-017**: System MUST indicate recurrence pattern on task details

**Reminders:**
- **FR-018**: System MUST allow setting reminder timing relative to due date
- **FR-019**: System MUST support reminder offsets: 15 minutes, 1 hour, 1 day, 1 week before
- **FR-020**: System MUST provide API endpoint to query reminders due within a time window
- **FR-021**: System MUST mark reminders as triggered after being processed
- **FR-022**: System MUST delete reminders when associated task is deleted

**Notification Center:**
- **FR-023**: System MUST persist notifications in database (read/unread status)
- **FR-024**: System MUST display notifications in dropdown: unread first, then read (sorted by time)
- **FR-025**: System MUST visually distinguish unread (highlighted) vs read (grayed out) items
- **FR-026**: System MUST allow deleting individual notifications
- **FR-027**: System MUST provide a "Clear All" action to remove all notifications
- **FR-028**: System MUST update unread badge count in real-time

### Key Entities

- **Tag**: Represents a user-defined category with name and color. Belongs to a user, can be associated with many tasks.
- **TaskTag**: Junction entity representing the many-to-many relationship between tasks and tags.
- **RecurringPattern**: Configuration for task recurrence including pattern type (daily/weekly/monthly), interval, and optional end date. Belongs to a task.
- **Reminder**: Configuration for task reminders including offset timing and triggered status. Belongs to a task.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Search dialog opens within 100ms of keyboard shortcut
- **SC-002**: Search results appear within 500ms of typing (including debounce)
- **SC-003**: Users can find a specific task using search in under 5 seconds
- **SC-004**: Users can create, edit, and delete tags in under 3 seconds per operation
- **SC-005**: Users can assign/unassign tags to tasks in under 2 seconds
- **SC-006**: Filter by tag returns results in under 1 second for users with up to 1000 tasks
- **SC-007**: Recurring task generation completes within 5 seconds of task completion
- **SC-008**: 95% of users successfully create and assign at least one tag within their first session
- **SC-009**: Reminder query API returns all due reminders within 500ms for a 24-hour window
- **SC-010**: Tag filtering combined with existing filters (status, priority) works correctly in all combinations

## Assumptions

1. **Color format**: Tags use 6-character hex color codes (e.g., "FF5733") without the # prefix for backend storage
2. **Recurrence calculation**: Monthly recurrence from Jan 31 lands on Feb 28/29, Mar 31, Apr 30, etc. (last day logic)
3. **Reminder polling**: Module 2 will implement a Dapr scheduled job that polls the reminder API every minute
4. **Tag limit**: Users can create up to 50 tags (reasonable limit for most use cases)
5. **Tags per task**: A task can have up to 10 tags
6. **Default reminder timing**: If user enables reminder without selecting timing, default to 1 hour before
7. **Search debounce**: 300ms debounce on search input to avoid excessive API calls
8. **Search component**: Uses Lightswind Command palette component (`command.tsx`) for keyboard-friendly search UX
