# API Client Contract: Frontend Core

**Feature**: 006-frontend-core
**Date**: 2026-01-11
**Purpose**: Define API client interface for frontend-backend communication

---

## Base Configuration

```typescript
// src/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface RequestConfig extends RequestInit {
  skipAuth?: boolean
}

class APIError extends Error {
  constructor(
    public status: number,
    public data: unknown
  ) {
    super(`API Error: ${status}`)
    this.name = "APIError"
  }
}
```

---

## Task API Client

### Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/api/tasks` | List tasks (paginated, filtered) |
| GET | `/api/tasks/{id}` | Get single task |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/{id}` | Update task |
| DELETE | `/api/tasks/{id}` | Delete task |
| PATCH | `/api/tasks/{id}/complete` | Toggle completion |

### Request/Response Contracts

#### List Tasks
```typescript
// GET /api/tasks?status=todo&sort_by=created_at&order=desc&page=1&limit=10

interface ListTasksParams {
  status?: "todo" | "in_progress" | "completed" | "all"
  sort_by?: "created_at" | "due_date" | "priority" | "title"
  order?: "asc" | "desc"
  page?: number
  limit?: number
  search?: string
}

interface ListTasksResponse {
  data: Task[]
  total: number
  page: number
  limit: number
  total_pages: number
}
```

#### Get Task
```typescript
// GET /api/tasks/{id}

interface GetTaskResponse {
  data: Task
}
```

#### Create Task
```typescript
// POST /api/tasks
// Body: TaskCreate

interface CreateTaskRequest {
  title: string
  description?: string
  status?: "todo" | "in_progress" | "completed"
  priority?: "low" | "medium" | "high"
  due_date?: string  // ISO 8601
}

interface CreateTaskResponse {
  data: Task
}
```

#### Update Task
```typescript
// PUT /api/tasks/{id}
// Body: TaskUpdate

interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: "todo" | "in_progress" | "completed"
  priority?: "low" | "medium" | "high"
  due_date?: string
  completed?: boolean
}

interface UpdateTaskResponse {
  data: Task
}
```

#### Delete Task
```typescript
// DELETE /api/tasks/{id}

interface DeleteTaskResponse {
  message: string
}
```

---

## API Client Implementation

```typescript
// src/lib/api.ts

import { auth } from "./auth"

export async function apiClient<T>(
  endpoint: string,
  options: RequestConfig = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options

  let headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  }

  // Add auth header if authenticated
  if (!skipAuth) {
    const session = await auth.api.getSession()
    if (session?.token) {
      headers = {
        ...headers,
        Authorization: `Bearer ${session.token}`,
      }
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    throw new APIError(response.status, await response.json())
  }

  return response.json()
}

// Convenience methods
export const api = {
  get: <T>(url: string) => apiClient<T>(url, { method: "GET" }),

  post: <T>(url: string, data: unknown) =>
    apiClient<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(url: string, data: unknown) =>
    apiClient<T>(url, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T>(url: string, data?: unknown) =>
    apiClient<T>(url, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(url: string) => apiClient<T>(url, { method: "DELETE" }),
}
```

---

## Task API Functions

```typescript
// src/lib/api/tasks.ts

import { api } from "../api"
import type {
  Task,
  ListTasksParams,
  ListTasksResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@/types/task"

export async function getTasks(
  params: ListTasksParams = {}
): Promise<ListTasksResponse> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  return api.get<ListTasksResponse>(
    `/api/tasks${query ? `?${query}` : ""}`
  )
}

export async function getTask(id: string): Promise<Task> {
  const res = await api.get<{ data: Task }>(`/api/tasks/${id}`)
  return res.data
}

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  const res = await api.post<{ data: Task }>("/api/tasks", data)
  return res.data
}

export async function updateTask(
  id: string,
  data: UpdateTaskRequest
): Promise<Task> {
  const res = await api.put<{ data: Task }>(`/api/tasks/${id}`, data)
  return res.data
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/api/tasks/${id}`)
}

export async function toggleComplete(id: string): Promise<Task> {
  const res = await api.patch<{ data: Task }>(`/api/tasks/${id}/complete`)
  return res.data
}
```

---

## TanStack Query Hooks

```typescript
// src/hooks/useTasks.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as tasksApi from "@/lib/api/tasks"
import { taskKeys } from "@/lib/queries/keys"
import type { ListTasksParams, CreateTaskRequest, UpdateTaskRequest } from "@/types/task"

export function useTasksQuery(params: ListTasksParams = {}) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => tasksApi.getTasks(params),
  })
}

export function useTaskQuery(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksApi.getTask(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => tasksApi.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      tasksApi.updateTask(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export function useToggleComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksApi.toggleComplete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) })
    },
  })
}
```

---

## Error Handling

```typescript
// src/lib/errors.ts

export function handleAPIError(error: unknown): string {
  if (error instanceof APIError) {
    switch (error.status) {
      case 401:
        return "Please log in to continue"
      case 403:
        return "You don't have permission to do this"
      case 404:
        return "Task not found"
      case 422:
        return "Invalid data provided"
      case 500:
        return "Server error. Please try again later"
      default:
        return "An error occurred"
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unexpected error occurred"
}
```

---

*Generated by /sp.plan Phase 1*
