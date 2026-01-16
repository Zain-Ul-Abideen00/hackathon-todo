# Research: Frontend Core (Module 5)

**Feature**: 006-frontend-core
**Date**: 2026-01-11
**Purpose**: Resolve technical unknowns and document best practices

---

## 1. Lightswind Component Integration

### Decision
Use Lightswind components exclusively from `src/components/lightswind/` directory. No custom CSS or styling outside the component library.

### Rationale
- Ensures visual consistency across the application
- Components are pre-built with accessibility features
- Reduces development time and maintenance burden
- Matches the design requirement for "premium aesthetics"

### Alternatives Considered
| Option | Pros | Cons |
|:-------|:-----|:-----|
| shadcn/ui | More popular, larger community | Would require separate styling |
| Custom components | Full control | High effort, consistency issues |
| **Lightswind (chosen)** | Pre-themed, available in repo | Less documentation |

---

## 2. Theme System Architecture

### Decision
Use CSS variables with Tailwind CSS v4 and `toggle-theme.tsx` component with "diag-down-right" animation.

### Rationale
- CSS variables enable instant theme switching without re-renders
- `toggle-theme.tsx` already implements the required animation
- localStorage persistence is built into the component
- Tailwind CSS v4 supports CSS variables natively

### Implementation Pattern
```css
:root {
  --chonkie-bg: rgb(250, 246, 227);
  --chonkie-text: oklch(0.145 0 0);
  --chonkie-accent: rgb(167, 137, 108);
}

.dark {
  --chonkie-bg: rgb(26, 26, 26);
  --chonkie-text: rgb(255, 255, 255);
  --chonkie-accent: rgb(199, 169, 144);
}
```

---

## 3. Next.js 16 Async Params Handling

### Decision
Always use `Promise<{ param: type }>` for params and `await` them in page components.

### Rationale
- Next.js 16 breaking change requires async params
- Server Components must await dynamic data
- Client components can use React's `use()` hook

### Patterns Documented
```tsx
// Server Component (recommended)
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // ...
}

// Client Component (when needed)
"use client"
import { use } from "react"

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  // ...
}
```

---

## 4. State Management Strategy

### Decision
Use **Zustand** for client-side UI state and **TanStack Query** for server state (API data).

### Rationale
- Clear separation of concerns
- TanStack Query handles caching, refetching, and optimistic updates
- Zustand is lightweight and simple for UI state (filters, sort order)
- Both integrate well with React 19

### State Boundaries
| State Type | Library | Examples |
|:-----------|:--------|:---------|
| Server data | TanStack Query | Tasks, user profile |
| UI preferences | Zustand | Filter selection, view mode |
| Theme | localStorage + CSS | Light/dark mode |
| Auth session | Better Auth | User session |

---

## 5. Responsive Breakpoint Strategy

### Decision
Use three breakpoints: mobile (<768px), tablet (768px-1024px), desktop (>1024px).

### Rationale
- Aligns with spec requirements for sidebar (desktop) vs dock (mobile)
- Tailwind default breakpoints (`md:`, `lg:`) map well
- Tablet uses collapsible sidebar for hybrid experience

### Component Visibility
| Component | Mobile | Tablet | Desktop |
|:----------|:-------|:-------|:--------|
| Bottom dock | ✅ Visible | ❌ Hidden | ❌ Hidden |
| Sidebar | ❌ Hidden | ⚪ Collapsed | ✅ Full |
| Hamburger menu | ✅ Visible | ⚪ Optional | ❌ Hidden |
| Dashboard header | ✅ Visible | ✅ Visible | ✅ Visible |

---

## 6. Form Validation Strategy

### Decision
Use React Hook Form + Zod for all forms with inline error display.

### Rationale
- React Hook Form provides excellent performance (minimal re-renders)
- Zod schemas are reusable and type-safe
- Better Auth forms already use this pattern
- Toast notifications for submission feedback

### Validation Flow
1. Schema definition with Zod
2. Form setup with React Hook Form + zodResolver
3. Inline field errors below inputs
4. Toast notification on submit success/failure

---

## 7. Animation Library Choice

### Decision
Use **Framer Motion** for all animations and transitions.

### Rationale
- Already included in project dependencies
- Provides layout animations for smooth transitions
- AnimatePresence for enter/exit animations
- Works well with React 19 and Server Components

### Animation Categories
| Type | Implementation |
|:-----|:---------------|
| Page transitions | Framer Motion layout |
| Card hover | `interactive-card.tsx` + Framer |
| Theme toggle | CSS `clip-path` animation (built in) |
| Toast notifications | Sonner (via Lightswind) |
| Loading states | `skeleton.tsx` shimmer |

---

## 8. API Client Architecture

### Decision
Create a typed fetch wrapper with JWT injection from Better Auth session.

### Rationale
- Centralized auth header management
- Type safety for API responses
- Easy error handling and retry logic
- Works with TanStack Query

### Pattern
```typescript
async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await auth.api.getSession()
  const headers = {
    "Content-Type": "application/json",
    ...(session?.token && {
      Authorization: `Bearer ${session.token}`,
    }),
    ...options.headers,
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    throw new APIError(res.status, await res.json())
  }

  return res.json()
}
```

---

## Summary

All technical unknowns have been resolved:

| Area | Decision |
|:-----|:---------|
| Component library | Lightswind (exclusive) |
| Theme system | CSS variables + toggle-theme.tsx |
| Async params | Promise type + await |
| State management | Zustand + TanStack Query |
| Breakpoints | 768px (tablet), 1024px (desktop) |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion |
| API client | Typed fetch with JWT |

**Next Step**: Proceed to data-model.md and contracts/
