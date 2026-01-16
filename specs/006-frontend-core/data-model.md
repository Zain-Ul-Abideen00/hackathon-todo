# Data Model: Frontend Core (Module 5)

**Feature**: 006-frontend-core
**Date**: 2026-01-11
**Purpose**: Define frontend data structures and state management

---

## API Response Types

### Task Entity

```typescript
// src/types/task.ts

export type TaskStatus = "todo" | "in_progress" | "completed"
export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null  // ISO 8601 format
  completed: boolean
  created_at: string
  updated_at: string
  user_id: string
}

export interface TaskCreate {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string
}

export interface TaskUpdate {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  due_date?: string
  completed?: boolean
}
```

### User Entity (from Better Auth)

```typescript
// src/types/user.ts

export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Session {
  user: User
  token: string
  expiresAt: string
}
```

---

## Form Schemas (Zod)

### Task Form Schema

```typescript
// src/lib/schemas/task.ts
import { z } from "zod"

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z
    .string()
    .max(1000, "Description must be 1000 characters or less")
    .optional(),
  status: z.enum(["todo", "in_progress", "completed"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  due_date: z.string().datetime().optional().nullable(),
})

export type TaskFormData = z.infer<typeof taskSchema>
```

### Auth Form Schemas

```typescript
// src/lib/schemas/auth.ts
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
```

---

## Client State (Zustand)

### Task Filter Store

```typescript
// src/stores/taskStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type FilterStatus = "all" | "todo" | "in_progress" | "completed" | "overdue"
export type SortBy = "created_at" | "due_date" | "priority" | "title"
export type SortOrder = "asc" | "desc"
export type ViewMode = "grid" | "list"

interface TaskFilterState {
  // Filter state
  status: FilterStatus
  sortBy: SortBy
  sortOrder: SortOrder
  viewMode: ViewMode
  searchQuery: string

  // Actions
  setStatus: (status: FilterStatus) => void
  setSortBy: (sortBy: SortBy) => void
  setSortOrder: (order: SortOrder) => void
  setViewMode: (mode: ViewMode) => void
  setSearchQuery: (query: string) => void
  resetFilters: () => void
}

const defaultState = {
  status: "all" as FilterStatus,
  sortBy: "created_at" as SortBy,
  sortOrder: "desc" as SortOrder,
  viewMode: "grid" as ViewMode,
  searchQuery: "",
}

export const useTaskStore = create<TaskFilterState>()(
  persist(
    (set) => ({
      ...defaultState,
      setStatus: (status) => set({ status }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (sortOrder) => set({ sortOrder }),
      setViewMode: (viewMode) => set({ viewMode }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      resetFilters: () => set(defaultState),
    }),
    {
      name: "task-filters",
    }
  )
)
```

---

## Server State (TanStack Query)

### Task Query Keys

```typescript
// src/lib/queries/keys.ts

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
}

interface TaskFilters {
  status?: FilterStatus
  sortBy?: SortBy
  sortOrder?: SortOrder
  search?: string
  page?: number
  limit?: number
}
```

### Task Query Hooks

```typescript
// src/hooks/useTasks.ts or outlined pattern

// useTasksQuery - List all tasks with filters
// useTaskQuery - Single task by ID
// useCreateTask - Mutation for creating
// useUpdateTask - Mutation for updating
// useDeleteTask - Mutation for deleting
// useToggleComplete - Mutation for toggling completion
```

---

## API Response Shapes

### Paginated Response

```typescript
interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Usage: PaginatedResponse<Task>
```

### Error Response

```typescript
interface APIError {
  status: number
  message: string
  detail?: string
  errors?: Record<string, string[]>
}
```

---

## Theme State

Theme preference is managed via localStorage and CSS classes:

```typescript
// Theme is NOT in React state - uses CSS classes
// Managed by toggle-theme.tsx component

// Read: document.documentElement.classList.contains("dark")
// Write: document.documentElement.classList.toggle("dark")
// Persist: localStorage.setItem("theme", "dark" | "light")
```

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Zustand    │    │  TanStack    │    │  localStorage │  │
│  │   (UI State) │    │   Query      │    │   (Theme)     │  │
│  │              │    │ (Server Data)│    │               │  │
│  │ • filters    │    │ • tasks[]    │    │ • dark/light  │  │
│  │ • sortBy     │    │ • user       │    │               │  │
│  │ • viewMode   │    │ • session    │    │               │  │
│  └──────┬───────┘    └──────┬───────┘    └───────────────┘  │
│         │                   │                                │
│         └───────────┬───────┘                                │
│                     ▼                                        │
│            ┌────────────────┐                                │
│            │   Components   │                                │
│            │    (React)     │                                │
│            └────────┬───────┘                                │
│                     │                                        │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  FastAPI      │
              │  (Backend)    │
              │  Module 3 API │
              └───────────────┘
```

---

*Generated by /sp.plan Phase 1*
