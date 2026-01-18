# Quickstart Guide: Frontend Core (Module 5)

**Feature**: 006-frontend-core
**Date**: 2026-01-11

---

## Prerequisites

Before starting this module, ensure you have completed:

- [x] **Module 1**: Project Foundation (monorepo structure)
- [x] **Module 2**: Database Schema (Neon PostgreSQL)
- [x] **Module 3**: Task API (FastAPI backend)
- [x] **Module 4**: JWT Auth (Better Auth integration)

### Required Services Running

```bash
# Terminal 1: Backend API
cd todo-web-app/backend
uv run uvicorn src.main:app --reload
# Running at http://localhost:8000

# Terminal 2: Frontend Dev Server
cd todo-web-app/frontend
pnpm dev
# Running at http://localhost:3000
```

---

## Quick Start

### 1. Install New Dependencies

```bash
cd todo-web-app/frontend

# Core dependencies
pnpm add @tanstack/react-query zustand framer-motion

# Form handling
pnpm add react-hook-form @hookform/resolvers zod

# Icons
pnpm add lucide-react
```

### 2. Environment Setup

Ensure `.env.local` has:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-shared-secret-min-32-chars
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

### 3. Verify Setup

```bash
# Run dev server
pnpm dev

# Visit http://localhost:3000
# You should see the current landing page
```

---

## Development Workflow

### Phase Order (Recommended)

1. **Theme Setup** → Configure colors, fonts, CSS variables
2. **Landing Page** → Navbar, Hero, Features, Footer
3. **Auth Pages** → Login, Signup with Better Auth
4. **Dashboard Layout** → Sidebar, Header, Bottom Nav
5. **Task Components** → Card, List, Filters, Form
6. **Dashboard Pages** → Home, Tasks, Create/Edit
7. **Polish** → Animations, loading states, error handling

### Key Files to Create

| Phase | Files |
|:------|:------|
| 1 | `globals.css` (theme vars) |
| 2 | `Navbar.tsx`, `Hero.tsx`, `Features.tsx`, `Footer.tsx` |
| 3 | `auth/layout.tsx`, `LoginForm.tsx`, `SignupForm.tsx` |
| 4 | `DashboardSidebar.tsx`, `MobileBottomNav.tsx`, `DashboardHeader.tsx` |
| 5 | `TaskCard.tsx`, `TaskList.tsx`, `TaskFilters.tsx`, `TaskForm.tsx` |
| 6 | `dashboard/page.tsx`, `tasks/page.tsx`, `tasks/[id]/edit/page.tsx` |

---

## Testing Commands

```bash
# Unit tests
pnpm test

# Unit tests with coverage
pnpm test:coverage

# E2E tests
pnpm exec playwright test

# E2E tests with UI
pnpm exec playwright test --ui

# Lint
pnpm lint

# Type check
pnpm typecheck
```

---

## Lightswind Component Reference

Located at: `src/components/lightswind/`

### Most Used Components

| Category | Components |
|:---------|:-----------|
| **Navigation** | `morphing-navigation.tsx`, `sidebar.tsx`, `dock.tsx`, `hamburger-menu-overlay.tsx` |
| **Theme** | `toggle-theme.tsx` (use animationType="diag-down-right") |
| **Buttons** | `button.tsx`, `gradient-button.tsx`, `confetti-button.tsx` |
| **Cards** | `card.tsx`, `interactive-card.tsx`, `glowing-cards.tsx` |
| **Forms** | `input.tsx`, `textarea.tsx`, `select.tsx`, `checkbox.tsx`, `calendar.tsx`, `form.tsx` |
| **Feedback** | `toast.tsx`, `skeleton.tsx`, `alert-dialog.tsx`, `progress.tsx` |
| **Backgrounds** | `particles-background.tsx`, `dot-pattern.tsx` |
| **Text Effects** | `aurora-text-effect.tsx`, `scroll-reveal.tsx` |

### Usage Example

```tsx
import { Button } from "@/components/lightswind/button"
import { Card, CardHeader, CardContent } from "@/components/lightswind/card"
import { ToggleTheme } from "@/components/lightswind/toggle-theme"

export function Example() {
  return (
    <Card>
      <CardHeader>
        <ToggleTheme animationType="diag-down-right" />
      </CardHeader>
      <CardContent>
        <Button variant="default">Click Me</Button>
      </CardContent>
    </Card>
  )
}
```

---

## CRITICAL: Next.js 16 Patterns

### Dynamic Route Params

```tsx
// ❌ WRONG - Will fail in Next.js 16
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params  // Error!
}

// ✅ CORRECT - Await the Promise
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params  // Works!
}
```

### Search Params

```tsx
// ✅ CORRECT
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
}
```

---

## Color Reference (Chonkie.ai)

### Light Mode
- **Background**: `rgb(250, 246, 227)` / `#FAF6E3` (cream)
- **Text**: `oklch(0.145 0 0)` (soft black)
- **Accent**: `rgb(167, 137, 108)` / `#A7896C` (bronze)

### Dark Mode
- **Background**: `rgb(26, 26, 26)` / `#1A1A1A` (deep grey)
- **Text**: `rgb(255, 255, 255)` / `#FFFFFF` (white)
- **Accent**: `rgb(199, 169, 144)` / `#C7A990` (lighter bronze)

### Typography
- **Font**: Geist, sans-serif
- **H1**: 60px desktop / 36px mobile
- **H2**: 36px desktop / 30px mobile
- **Body**: 24px desktop / 20px mobile

---

## Troubleshooting

### Common Issues

1. **"params is not a promise"**
   - You're not using Next.js 16 pattern
   - Add `Promise<>` type and `await`

2. **Theme not persisting**
   - Check localStorage for "theme" key
   - Ensure ThemeProvider wraps app

3. **API calls failing**
   - Verify backend is running
   - Check CORS configuration
   - Validate JWT token

4. **Components not rendering**
   - Check import paths
   - Verify "use client" directive if using hooks

---

## Related Documents

- [spec.md](./spec.md) - Feature specification
- [plan.md](./plan.md) - Implementation plan
- [research.md](./research.md) - Technical decisions
- [data-model.md](./data-model.md) - Frontend types
- [contracts/api-client.md](./contracts/api-client.md) - API client

---

*Generated by /sp.plan Phase 1*
