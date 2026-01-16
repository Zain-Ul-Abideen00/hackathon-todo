# Feature Specification: Todo Web Frontend - Production Ready

**Feature Branch**: `006-frontend-core`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Todo Web Frontend - Production Ready (Module 5) with landing page, auth pages, sidebar dashboard, mobile bottom navigation, and exclusive Lightswind components"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Landing Page Experience (Priority: P1)

As a visitor, I see a stunning landing page with navbar, hero section, features section, and footer that showcases the Todo app and encourages sign-up.

**Why this priority**: The landing page is the first impression and primary conversion funnel. Without an attractive landing page, users won't sign up.

**Independent Test**: Can be fully tested by visiting the home page `/` and verifying all sections render correctly with Chonkie.ai design system colors and smooth animations.

**Acceptance Scenarios**:

1. **Given** I am a visitor on the home page, **When** the page loads, **Then** I see a navbar with logo, navigation links (Features, Pricing, About), theme toggle, and Login/Sign Up buttons
2. **Given** I am on the landing page, **When** I view the hero section, **Then** I see a bold headline with aurora text effect, descriptive subtext, a prominent CTA button, and an app preview with electro-border effect
3. **Given** I am on the landing page, **When** I scroll to the features section, **Then** I see 3-4 animated feature cards using glowing-cards component with icons and descriptions
4. **Given** I am on the landing page, **When** I scroll to the footer, **Then** I see navigation links, social icons, theme toggle, and copyright information
5. **Given** I am viewing the landing page, **When** I click the theme toggle, **Then** the entire page smoothly transitions between light and dark mode with diag-down-right animation

---

### User Story 2 - Theme Toggle & Persistence (Priority: P1)

As a visitor, I can toggle between light and dark mode using a beautiful theme switcher with the "diag-down-right" polygon reveal animation, and my preference is remembered.

**Why this priority**: Theme support is a core UX feature that affects every page; implementing it first ensures consistency throughout development.

**Independent Test**: Can be tested by toggling the theme on any page and verifying the animation, color changes, and localStorage persistence.

**Acceptance Scenarios**:

1. **Given** I am in light mode, **When** I click the theme toggle, **Then** a diagonal polygon animation reveals the dark mode from top-left to bottom-right
2. **Given** I have set dark mode, **When** I refresh the page or navigate to another page, **Then** dark mode persists
3. **Given** I am in dark mode, **When** I view any page, **Then** the background is rgb(26, 26, 26), text is white, and accent is rgb(199, 169, 144)
4. **Given** I am in light mode, **When** I view any page, **Then** the background is rgb(250, 246, 227), text is soft black, and accent is rgb(167, 137, 108)

---

### User Story 3 - User Authentication Pages (Priority: P2)

As a visitor, I can sign in or sign up using beautifully designed auth pages that use Lightswind components exclusively.

**Why this priority**: Authentication gates access to protected features; must work before implementing protected routes.

**Independent Test**: Can be tested by navigating to `/auth/login` and `/auth/signup`, filling forms, and verifying validation and submission work.

**Acceptance Scenarios**:

1. **Given** I am on the login page `/auth/login`, **When** the page loads, **Then** I see a centered card with email input, password input with typewriter effect, and login button
2. **Given** I am on the login page, **When** I enter invalid credentials and submit, **Then** I see a toast notification with an error message
3. **Given** I am on the login page, **When** I click "Sign up" link, **Then** I am navigated to `/auth/signup`
4. **Given** I am on the signup page `/auth/signup`, **When** I enter a password, **Then** I see the password-strength-indicator updating in real-time
5. **Given** I have valid credentials, **When** I submit the login form, **Then** I am redirected to `/dashboard` with a success toast

---

### User Story 4 - Dashboard Layout (Desktop) (Priority: P2)

As a logged-in user on desktop (≥768px), I see a sidebar-based dashboard with navigation, user profile, and main content area showing my tasks.

**Why this priority**: The dashboard is the core application experience where users manage tasks daily.

**Independent Test**: Can be tested by logging in on a desktop viewport and verifying sidebar navigation, user section, and main content area render correctly.

**Acceptance Scenarios**:

1. **Given** I am logged in on desktop, **When** the dashboard loads, **Then** I see a fixed left sidebar (240px) with logo, navigation menu, and user profile at bottom
2. **Given** I am on the dashboard, **When** I view the sidebar, **Then** I see navigation items: Dashboard, Tasks, Calendar, Settings with icons
3. **Given** I am on the dashboard, **When** I view the main content area, **Then** I see a header with search (command palette), breadcrumb, notifications bell, and user avatar dropdown
4. **Given** I am on the dashboard, **When** I view below the header, **Then** I see a welcome message, stats overview (bento-grid), task filters (tabs), and task cards
5. **Given** I am on the dashboard, **When** I click the theme toggle in the sidebar, **Then** the theme changes with diag-down-right animation

---

### User Story 5 - Dashboard Layout (Mobile) (Priority: P2)

As a logged-in user on mobile (<768px), I see a mobile-optimized dashboard with hamburger menu, full-width content, and bottom navigation bar.

**Why this priority**: Mobile responsiveness is essential for modern web apps; many users will access on phones.

**Independent Test**: Can be tested by logging in on a mobile viewport (375px) and verifying top header, bottom dock navigation, and content area.

**Acceptance Scenarios**:

1. **Given** I am logged in on mobile, **When** the dashboard loads, **Then** I see a top header with hamburger menu icon, logo, and notifications
2. **Given** I am on mobile, **When** I view the bottom of the screen, **Then** I see a fixed dock with 5 icons: Home, Tasks, Add (prominent center), Calendar, Profile
3. **Given** I am on mobile, **When** I tap the hamburger menu, **Then** a full-screen overlay menu slides in with navigation options
4. **Given** I am on mobile, **When** I tap the center Add button, **Then** I am navigated to the new task creation page/modal
5. **Given** I am on mobile, **When** I view tasks, **Then** they display in a full-width card list optimized for touch

---

### User Story 6 - Task CRUD Operations (Priority: P3)

As a user, I can create, view, edit, delete, and mark tasks as complete with smooth animations and feedback.

**Why this priority**: Core task management functionality builds on the dashboard layout.

**Independent Test**: Can be tested by performing full CRUD cycle: create task → view in list → edit → mark complete → delete.

**Acceptance Scenarios**:

1. **Given** I am on the dashboard, **When** I click "New Task", **Then** a dialog/drawer opens with a form containing title, description, due date (calendar), priority (select), and status (select)
2. **Given** I am filling the task form, **When** I enter a title and submit, **Then** the task is created with a success toast and appears in the task list with enter animation
3. **Given** I see a task card, **When** I click the checkbox, **Then** the task is marked complete with a completion animation and status updates
4. **Given** I see a task card, **When** I click the edit button, **Then** the edit page `/tasks/[id]/edit` loads with pre-filled data (async params awaited)
5. **Given** I am editing a task, **When** I click delete, **Then** an alert-dialog confirmation appears before deletion

---

### User Story 7 - Task Filtering & Sorting (Priority: P3)

As a user, I can filter tasks by status and sort them by date, priority, or title.

**Why this priority**: Filtering enhances usability as task lists grow.

**Independent Test**: Can be tested by creating multiple tasks with different statuses and verifying filter tabs work correctly.

**Acceptance Scenarios**:

1. **Given** I have tasks in various statuses, **When** I click the "All" filter tab, **Then** all tasks are displayed
2. **Given** I have tasks, **When** I click "To Do" filter, **Then** only tasks with "To Do" status are shown
3. **Given** I have tasks, **When** I click "Completed" filter, **Then** only completed tasks are shown
4. **Given** I am viewing tasks, **When** I select "Sort by Priority", **Then** tasks reorder with High priority first
5. **Given** I am on mobile, **When** I view filter tabs, **Then** they are horizontally scrollable

---

### Edge Cases

- What happens when a user has no tasks? → Empty state with illustration and "Create your first task" CTA
- What happens when the API is slow? → Skeleton loaders display during data fetch
- What happens when task creation fails? → Error toast with retry option
- What happens when user session expires? → Redirect to login with notification
- What happens on network error? → Toast notification with offline indicator
- What happens with very long task titles? → Text truncation with ellipsis and tooltip on hover

## Requirements *(mandatory)*

### Functional Requirements

**Landing Page**
- **FR-001**: System MUST display a responsive navbar with logo, navigation links, theme toggle, and auth CTAs
- **FR-002**: System MUST display hero section with animated headline (aurora-text-effect), subtext, and CTA button (confetti-button)
- **FR-003**: System MUST display features section with 3-4 animated cards (glowing-cards) using scroll-reveal
- **FR-004**: System MUST display footer with navigation links, social icons, and copyright

**Theme & Styling**
- **FR-005**: System MUST implement light/dark mode toggle using toggle-theme.tsx with "diag-down-right" animation
- **FR-006**: System MUST persist theme preference in localStorage
- **FR-007**: System MUST apply Chonkie.ai color palette: Cream/Bronze (light), Deep Grey/Lighter Bronze (dark)
- **FR-008**: System MUST use Geist font family with specified typography scale

**Authentication Pages**
- **FR-009**: System MUST display login page at `/auth/login` with email/password form using Lightswind components
- **FR-010**: System MUST display signup page at `/auth/signup` with password-strength-indicator
- **FR-011**: System MUST validate forms using React Hook Form + Zod
- **FR-012**: System MUST display toast notifications for auth success/failure

**Dashboard**
- **FR-013**: System MUST display sidebar layout on desktop (≥768px) with 240px fixed sidebar
- **FR-014**: System MUST display bottom dock navigation on mobile (<768px) with 5 navigation items
- **FR-015**: System MUST display hamburger menu overlay on mobile for additional navigation
- **FR-016**: System MUST display command palette search in dashboard header
- **FR-017**: System MUST display breadcrumb navigation in dashboard header
- **FR-018**: System MUST protect dashboard routes and redirect unauthenticated users to login

**Task Management**
- **FR-019**: System MUST display task list with skeleton loading states
- **FR-020**: System MUST allow task creation via form with title, description, due date, priority, status
- **FR-021**: System MUST allow task editing with pre-filled form data
- **FR-022**: System MUST allow task deletion with confirmation dialog (alert-dialog)
- **FR-023**: System MUST allow marking tasks complete/incomplete with checkbox animation
- **FR-024**: System MUST filter tasks by status (All, To Do, In Progress, Completed, Overdue)
- **FR-025**: System MUST sort tasks by date, priority, or title
- **FR-026**: System MUST display pagination for large task lists

**Components**
- **FR-027**: System MUST use ONLY components from `src/components/lightswind/` directory
- **FR-028**: System MUST await params and searchParams in dynamic routes (Next.js 16 requirement)

### Key Entities

- **Task**: Represents a todo item with title, description, due_date, priority, status, created_at, updated_at
- **User**: Represents the authenticated user with id, email, name (managed by Better Auth)
- **Theme Preference**: User's light/dark mode preference stored in localStorage

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can load the landing page in under 2 seconds (LCP < 2s)
- **SC-002**: Theme toggle animation completes smoothly without frame drops (60fps)
- **SC-003**: Users can complete signup flow in under 90 seconds
- **SC-004**: Users can create a new task in under 30 seconds
- **SC-005**: Dashboard loads and displays tasks within 1.5 seconds
- **SC-006**: Application achieves Lighthouse accessibility score ≥ 90
- **SC-007**: All task CRUD operations provide visual feedback within 200ms
- **SC-008**: Application functions correctly on viewports from 375px to 1920px
- **SC-009**: 100% of UI components are from Lightswind library (no custom CSS)
- **SC-010**: Theme preference persists across page refreshes and sessions

## Assumptions

- Better Auth is already configured from Module 4
- Backend API endpoints for task CRUD are available from Module 3
- Tailwind CSS v4 is configured in the frontend project
- Framer Motion is used for animations
- TanStack Query is used for data fetching
- Zustand is used for client-side state management
