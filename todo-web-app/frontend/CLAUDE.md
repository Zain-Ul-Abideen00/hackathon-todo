# Todo Web App - Frontend

## Overview

This is the **Next.js 16+** frontend for the Todo Web Application, built with:

- **Framework**: Next.js 16.1.1 (App Router)
- **UI**: React 19 with Server Components
- **Styling**: Tailwind CSS v4 + Lightswind UI
- **Animation**: Framer Motion
- **Validation**: Zod + React Hook Form
- **Auth**: Better Auth with JWT plugin
- **Chat**: OpenAI ChatKit (Phase 3)

## Project Structure

```text
frontend/
├── src/
│   ├── app/              # App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Protected routes
│   │   └── chat/         # Phase 3: Chat page
│   ├── components/       # React components
│   │   ├── ui/           # Lightswind UI components
│   │   ├── features/     # Feature-specific components
│   │   └── chat/         # Phase 3: ChatBot component
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

### ChatKit Integration (Phase 3)

```tsx
"use client";

import { useChatKit } from "@openai/chatkit";

export default function ChatBot() {
  const { threads, sendMessage, isLoading } = useChatKit({
    apiUrl: process.env.NEXT_PUBLIC_CHATKIT_URL,
    customFetch: async (url, options) => {
      const token = await getToken(); // From Better Auth
      return fetch(url, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${token}` },
      });
    },
  });

  return <ChatInterface threads={threads} onSend={sendMessage} />;
}
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `BETTER_AUTH_SECRET` | Shared JWT secret (min 32 chars) |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Frontend URL for auth |
| `NEXT_PUBLIC_CHATKIT_URL` | ChatKit backend URL (Phase 3) |
| `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY` | ChatKit domain key (Phase 3) |

## Related Documentation

- [spec.md](../../../specs/002-project-foundation/spec.md) - Feature specification
- [plan.md](../../../specs/002-project-foundation/plan.md) - Implementation plan
- [quickstart.md](../../../specs/002-project-foundation/quickstart.md) - Setup guide
- [008-frontend-chatbot](../../../specs/008-frontend-chatbot/) - Phase 3 frontend spec
