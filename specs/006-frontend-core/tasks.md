# Tasks: Todo Web Frontend (Production Ready)

**Input**: Design documents from `/specs/006-frontend-core/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: E2E tests with Playwright included as per constitution (TDD required)

**Organization**: Tasks grouped by user story for independent implementation and testing

---

## Agent & Skill References

> **CRITICAL**: Use these references for all implementation tasks

**Agents**:
- `@nextjs-developer` - ALL Next.js 16 work (handles async params correctly)
- `@ui-designer` - Lightswind components and premium design decisions
- `@frontend-developer` - Component composition and integration

**Skill Directories**:
- `.claude/skills/building-nextjs-apps/` - **CRITICAL**: async params pattern, Server Components
- `.claude/skills/lightswind-ui/` - All component usage patterns

**MCP Servers**:
- `next-devtools` - Runtime diagnostics and error detection
- `playwright` - E2E browser testing

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `todo-web-app/frontend/src/`
- **Components**: `todo-web-app/frontend/src/components/`
- **App Router**: `todo-web-app/frontend/src/app/`
- **Lib**: `todo-web-app/frontend/src/lib/`
- **Tests**: `todo-web-app/frontend/tests/` and `todo-web-app/frontend/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project dependencies and configuration
**Agent**: `@nextjs-developer`

- [x] T001 Install new dependencies: @tanstack/react-query, zustand, framer-motion, react-hook-form, @hookform/resolvers, zod, lucide-react
- [x] T002 [P] Add Chonkie.ai color palette CSS variables to `src/app/globals.css`
- [x] T003 [P] Add Geist font import and typography scale to `src/app/globals.css`
- [x] T004 Configure QueryClientProvider in `src/app/layout.tsx`
- [x] T005 [P] Add Toaster component from Lightswind to `src/app/layout.tsx`
- [x] T006 [P] Create TypeScript types in `src/types/task.ts` per data-model.md
- [x] T007 [P] Create TypeScript types in `src/types/user.ts` per data-model.md
- [x] T008 [P] Create Zod schemas in `src/lib/schemas/task.ts` per data-model.md
- [x] T009 [P] Create Zod schemas in `src/lib/schemas/auth.ts` per data-model.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story
**Agent**: `@nextjs-developer`, `@frontend-developer`

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 Create API client with JWT headers in `src/lib/api.ts` per contracts/api-client.md
- [x] T011 [P] Create Task API functions in `src/lib/api/tasks.ts` per contracts/api-client.md *(Fixed: uses /api/{user_id}/tasks pattern)*
- [x] T012 [P] Create query keys in `src/lib/queries/keys.ts` per data-model.md
- [x] T013 Create TanStack Query hooks in `src/hooks/useTasks.ts` per contracts/api-client.md
- [x] T014 [P] Create Zustand task filter store in `src/stores/taskStore.ts` per data-model.md
- [x] T015 [P] Create useAuth hook in `src/hooks/useAuth.ts` for session state
- [ ] T016 [P] Create error handler utility in `src/lib/errors.ts`
- [x] T017 Verify Better Auth client config in `src/lib/auth.ts` works with JWT

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Landing Page Experience (Priority: P1) 🎯 MVP

**Goal**: Stunning landing page with navbar, hero, features, and footer
**Independent Test**: Visit `/` and verify all sections render with Chonkie.ai colors and animations
**Agent**: `@ui-designer`, `@frontend-developer`
**Skill**: `.claude/skills/lightswind-ui/`

### E2E Test for User Story 1

- [ ] T018 [P] [US1] Create E2E test for landing page in `e2e/landing.spec.ts`

### Implementation for User Story 1

- [ ] T019 [P] [US1] Create Navbar component in `src/components/layout/Navbar.tsx` using `morphing-navigation.tsx` or `dynamic-navigation.tsx`
- [ ] T020 [P] [US1] Create Hero component in `src/components/landing/Hero.tsx` using `particles-background.tsx`, `aurora-text-effect.tsx`, `confetti-button.tsx`
- [ ] T021 [P] [US1] Create Features component in `src/components/landing/Features.tsx` using `glowing-cards.tsx`, `scroll-reveal.tsx`
- [ ] T022 [P] [US1] Create Footer component in `src/components/layout/Footer.tsx` with links and theme toggle
- [ ] T023 [US1] Update landing page in `src/app/page.tsx` to compose Navbar, Hero, Features, Footer
- [ ] T024 [US1] Add hamburger menu for mobile using `hamburger-menu-overlay.tsx` in Navbar
- [ ] T025 [US1] Add `smokey-cursor.tsx` effect to landing page

**Checkpoint**: Landing page fully functional and independently testable

---

## Phase 4: User Story 2 - Theme Toggle & Persistence (Priority: P1)

**Goal**: Light/dark mode toggle with diag-down-right animation and localStorage persistence
**Independent Test**: Toggle theme, refresh page, verify persistence
**Agent**: `@ui-designer`, `@nextjs-developer`
**Skill**: `.claude/skills/lightswind-ui/`

### E2E Test for User Story 2

- [ ] T026 [P] [US2] Create E2E test for theme toggle in `e2e/theme.spec.ts`

### Implementation for User Story 2

- [ ] T027 [US2] Integrate `toggle-theme.tsx` with animationType="diag-down-right" in Navbar
- [ ] T028 [US2] Add theme toggle to Footer component
- [ ] T029 [US2] Verify CSS variables switch correctly between light and dark mode
- [ ] T030 [US2] Test localStorage persistence across page refreshes

**Checkpoint**: Theme toggle works with animation and persists

---

## Phase 5: User Story 3 - Authentication Pages (Priority: P2)

**Goal**: Login and signup pages with Lightswind components and form validation
**Independent Test**: Navigate to `/auth/login`, `/auth/signup`, complete forms
**Agent**: `@nextjs-developer`, `@ui-designer`
**Skill**: `.claude/skills/building-nextjs-apps/`, `.claude/skills/lightswind-ui/`

### E2E Test for User Story 3

- [ ] T031 [P] [US3] Create E2E test for auth flow in `e2e/auth.spec.ts`

### Implementation for User Story 3

- [x] T032 [US3] Create auth layout in `src/app/auth/layout.tsx` with centered card and `dot-pattern.tsx` background *(+ auth redirect for signed-in users)*
- [x] T033 [P] [US3] Create LoginForm component in `src/components/auth/LoginForm.tsx` using `card.tsx`, `input.tsx`, `button.tsx`, React Hook Form + Zod
- [x] T034 [P] [US3] Create SignupForm component in `src/components/auth/SignupForm.tsx` with `password-strength-indicator.tsx`, `checkbox.tsx` *(Updated to Lightswind)*
- [x] T035 [US3] Create login page in `src/app/auth/login/page.tsx` with LoginForm
- [x] T036 [US3] Create signup page in `src/app/auth/signup/page.tsx` with SignupForm *(Deleted duplicate signin page)*
- [x] T037 [US3] Integrate Better Auth signIn/signUp in form submissions
- [x] T038 [US3] Add toast notifications for auth success/failure using `toast.tsx`
- [ ] T039 [US3] Add loading states with `ripple-loader.tsx`

**Checkpoint**: Auth pages functional with form validation and Better Auth integration

---

## Phase 6: User Story 4 - Dashboard Layout Desktop (Priority: P2)

**Goal**: Sidebar-based dashboard layout for desktop (≥768px)
**Independent Test**: Login on desktop, verify sidebar and main content area
**Agent**: `@ui-designer`, `@frontend-developer`
**Skill**: `.claude/skills/lightswind-ui/`

### Implementation for User Story 4

- [x] T040 [US4] Create DashboardSidebar component in `src/components/layout/DashboardSidebar.tsx` using `sidebar.tsx`
- [x] T041 [P] [US4] Add navigation items (Dashboard, Tasks, Calendar, Settings) with icons to sidebar
- [x] T042 [P] [US4] Add user profile section at bottom of sidebar with avatar and logout
- [x] T043 [US4] Add theme toggle to sidebar using `toggle-theme.tsx` with diag-down-right animation
- [x] T044 [US4] Create DashboardHeader component in `src/components/layout/DashboardHeader.tsx` with `command.tsx`, `breadcrumb.tsx`, `dropdown-menu.tsx`, `animated-notification.tsx`
- [x] T045 [US4] Create dashboard layout in `src/app/(dashboard)/layout.tsx` with sidebar, header, and protected route wrapper
- [x] T046 [US4] Add responsive logic to show sidebar only on desktop (≥768px)

**Checkpoint**: Desktop dashboard layout functional with sidebar

---

## Phase 7: User Story 5 - Dashboard Layout Mobile (Priority: P2)

**Goal**: Mobile-optimized dashboard with bottom navigation bar (<768px)
**Independent Test**: Login on mobile (375px), verify bottom dock and hamburger menu
**Agent**: `@ui-designer`, `@frontend-developer`
**Skill**: `.claude/skills/lightswind-ui/`

### E2E Test for User Story 5

- [ ] T047 [P] [US5] Create E2E test for responsive layout in `e2e/responsive.spec.ts`

### Implementation for User Story 5

- [x] T048 [US5] Create MobileBottomNav component in `src/components/layout/MobileBottomNav.tsx` using `dock.tsx`
- [x] T049 [US5] Add 5 navigation items: Home, Tasks, Add (center), Calendar, Profile
- [x] T050 [US5] Style center Add button prominently with `gradient-button.tsx`
- [ ] T051 [US5] Add safe area padding for iOS devices
- [x] T052 [US5] Update dashboard layout to show MobileBottomNav on mobile (<768px)
- [ ] T053 [US5] Add hamburger menu trigger in mobile header for sidebar overlay

**Checkpoint**: Mobile dashboard layout functional with bottom dock

---

## Phase 8: User Story 6 - Task CRUD Operations (Priority: P3)

**Goal**: Create, view, edit, delete, and complete tasks with animations
**Independent Test**: Perform full CRUD cycle: create → view → edit → complete → delete
**Agent**: `@nextjs-developer`, `@ui-designer`
**Skill**: `.claude/skills/building-nextjs-apps/` (CRITICAL: async params), `.claude/skills/lightswind-ui/`

### E2E Test for User Story 6

- [ ] T054 [P] [US6] Create E2E test for task CRUD in `e2e/tasks.spec.ts`

### Implementation for User Story 6

- [ ] T055 [P] [US6] Create TaskCard component in `src/components/tasks/TaskCard.tsx` using `card.tsx`, `interactive-card.tsx`, `checkbox.tsx`, `badge.tsx`
- [ ] T056 [P] [US6] Create TaskList component in `src/components/tasks/TaskList.tsx` with Framer Motion animations and `skeleton.tsx` loading
- [ ] T057 [P] [US6] Create TaskForm component in `src/components/tasks/TaskForm.tsx` using `input.tsx`, `textarea.tsx`, `select.tsx`, `calendar.tsx`, `popover.tsx`, React Hook Form + Zod
- [ ] T058 [US6] Create tasks list page in `src/app/(dashboard)/tasks/page.tsx` with TaskList
- [ ] T059 [US6] Create new task page in `src/app/(dashboard)/tasks/new/page.tsx` with TaskForm in dialog/drawer
- [ ] T060 [US6] **CRITICAL**: Create edit task page in `src/app/(dashboard)/tasks/[id]/edit/page.tsx` - MUST await params Promise
- [ ] T061 [US6] Add delete confirmation using `alert-dialog.tsx`
- [ ] T062 [US6] Add success/error toasts for all CRUD operations
- [ ] T063 [US6] Add loading states with `ripple-loader.tsx` and `top-loader.tsx`

**Checkpoint**: Task CRUD fully functional with animations

---

## Phase 9: User Story 7 - Task Filtering & Sorting (Priority: P3)

**Goal**: Filter tasks by status and sort by date, priority, or title
**Independent Test**: Create multiple tasks, verify filters work correctly
**Agent**: `@frontend-developer`, `@ui-designer`
**Skill**: `.claude/skills/lightswind-ui/`

### Implementation for User Story 7

- [ ] T064 [US7] Create TaskFilters component in `src/components/tasks/TaskFilters.tsx` using `tabs.tsx`, `select.tsx`
- [ ] T065 [US7] Add filter tabs: All, To Do, In Progress, Completed, Overdue
- [ ] T066 [US7] Add sort dropdown: Date, Priority, Title
- [ ] T067 [US7] Connect filters to Zustand store from `src/stores/taskStore.ts`
- [ ] T068 [US7] Update TaskList to use filtered/sorted data from store
- [ ] T069 [US7] Add horizontal scroll for filter tabs on mobile
- [ ] T070 [US7] Add pagination using `pagination.tsx`

**Checkpoint**: Task filtering and sorting fully functional

---

## Phase 10: Dashboard Home & Polish

**Purpose**: Dashboard home page and cross-cutting improvements
**Agent**: `@nextjs-developer`, `@ui-designer`

### Dashboard Home

- [ ] T071 Create dashboard home page in `src/app/(dashboard)/dashboard/page.tsx`
- [ ] T072 [P] Add welcome message with user name
- [ ] T073 [P] Add stats overview using `bento-grid.tsx` (Total, Completed, Pending, Overdue)
- [ ] T074 Add recent tasks section
- [ ] T075 Add quick actions (New Task, View Calendar)

### Empty States

- [ ] T076 [P] Add empty state with illustration to TaskList when no tasks
- [ ] T077 [P] Add "Create your first task" CTA in empty state

### Animations & Polish

- [ ] T078 [P] Add Framer Motion page transitions to dashboard layout
- [ ] T079 [P] Add card hover/press effects to TaskCard
- [ ] T080 [P] Add checkbox completion animation
- [ ] T081 [P] Add toast slide-in animations

### Error Handling

- [ ] T082 Create error boundary component in `src/components/ErrorBoundary.tsx`
- [ ] T083 Add error handling to all API calls with user-friendly messages

### Documentation

- [ ] T084 Update frontend README with new components
- [ ] T085 Run quickstart.md validation steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **US1-US2 (Phase 3-4)**: Landing + Theme - can run in parallel after Foundation
- **US3 (Phase 5)**: Auth Pages - can run after Foundation
- **US4-US5 (Phase 6-7)**: Dashboard Layouts - depend on US3 (auth) being complete
- **US6-US7 (Phase 8-9)**: Task Features - depend on US4-US5 (dashboard) being complete
- **Polish (Phase 10)**: Depends on all user stories

### User Story Dependencies

```
Foundation (Phase 2)
    ├── US1: Landing Page ──┬── (MVP deliverable)
    │                       │
    ├── US2: Theme Toggle ──┘
    │
    └── US3: Auth Pages ─────┬── US4: Desktop Layout ──┬── US6: Task CRUD
                             │                         │
                             └── US5: Mobile Layout ───┤
                                                       │
                                                       └── US7: Filtering
```

### Parallel Opportunities

**Within Phase 1 (Setup)**:
- T002, T003, T005, T006, T007, T008, T009 can run in parallel

**Within Phase 2 (Foundation)**:
- T011, T012, T014, T015, T016 can run in parallel

**Within User Stories**:
- All [P] marked tasks can run in parallel within their phase
- Different user stories can be worked on in parallel by different agents

---

## Implementation Strategy

### MVP First (Landing + Theme)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundation
3. Complete Phase 3: US1 - Landing Page
4. Complete Phase 4: US2 - Theme Toggle
5. **STOP and VALIDATE**: Landing page with theme works
6. Deploy/demo as marketing site

### Add Auth + Dashboard

7. Complete Phase 5: US3 - Auth Pages
8. Complete Phases 6-7: US4-US5 - Dashboard Layouts
9. **STOP and VALIDATE**: Login works, dashboard renders

### Add Task Management

10. Complete Phases 8-9: US6-US7 - Task CRUD + Filtering
11. Complete Phase 10: Polish
12. **FINAL VALIDATION**: Full E2E tests pass

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- **CRITICAL**: Task T060 MUST use async params pattern for Next.js 16
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Use `@nextjs-developer` agent for all Next.js 16 specific patterns
- Use `@ui-designer` agent for all Lightswind component decisions
- Reference `.claude/skills/building-nextjs-apps/` for async params code examples
- Reference `.claude/skills/lightswind-ui/` for component usage patterns

---

*Generated by /sp.tasks | Module 5: Frontend Core | 85 tasks total*
