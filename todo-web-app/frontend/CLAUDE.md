# Todo Web App - Frontend

## Overview

This is the **Next.js 16+** frontend for the Todo Web Application, built with:

- **Framework**: Next.js 16.1.1 (App Router)
- **UI**: React 19 with Server Components
- **Styling**: Tailwind CSS v4 + Lightswind UI
- **Animation**: Framer Motion
- **Validation**: Zod + React Hook Form
- **Auth**: Better Auth with JWT plugin

## Project Structure

```text
frontend/
├── src/
│   ├── app/              # App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   ├── auth/         # Authentication pages
│   │   └── dashboard/    # Protected routes
│   ├── components/       # React components
│   │   ├── ui/           # Lightswind UI components
│   │   └── features/     # Feature-specific components
│   ├── lib/              # Utilities
│   │   ├── auth.ts       # Better Auth config
│   │   └── api.ts        # API client
│   └── actions/          # Server Actions
├── public/               # Static assets
└── tests/                # Vitest tests
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run linting
pnpm lint

# Format code
pnpm format

# Build for production
pnpm build
```

## Key Patterns

### Server Components (Default)

```tsx
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const data = await fetchData();
  return <Dashboard data={data} />;
}
```

### Client Components (Interactive)

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Async Params (Next.js 16 Breaking Change)

```tsx
// ALWAYS await params in page components
export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TaskDetail id={id} />;
}
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `BETTER_AUTH_SECRET` | Shared JWT secret (min 32 chars) |
| `BETTER_AUTH_URL` | Frontend URL for auth |

## Related Documentation

- [spec.md](../../../specs/002-project-foundation/spec.md) - Feature specification
- [plan.md](../../../specs/002-project-foundation/plan.md) - Implementation plan
- [quickstart.md](../../../specs/002-project-foundation/quickstart.md) - Setup guide
