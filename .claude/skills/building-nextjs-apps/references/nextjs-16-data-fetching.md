# Next.js 16 Data Fetching & Caching Patterns

> **Source**: Next.js 16 Official Documentation

## 1. Fetching Data (Server Components)

Next.js extends the native `fetch` API.

```tsx
export default async function Page() {
  const data = await fetch('https://api.example.com/data')
  const posts = await data.json()
  // ...
}
```

> **Note**: `fetch` requests are NOT cached by default in Next.js 16. To cache them, you must opt-in.

### Caching Options

| Strategy | Syntax | Description |
|----------|--------|-------------|
| **No Cache (Default)** | `fetch(url)` or `cache: 'no-store'` | Fetched on every request. |
| **Force Cache** | `cache: 'force-cache'` | Cached indefinitely (until revalidated). |
| **Next.js Revalidate** | `next: { revalidate: 3600 }` | Cache with lifetime (ISR). |
| **Tags** | `next: { tags: ['collection'] }` | Cache tagged for on-demand invalidation. |

```tsx
// Cached forever
fetch('https://...', { cache: 'force-cache' })

// Revalidate every hour
fetch('https://...', { next: { revalidate: 3600 } })

// Tagged for invalidation
fetch('https://...', { next: { tags: ['collection'] } })
```

## 2. `use cache` Directive (New in Next.js 16)

The `use cache` directive marks a function or component output as cacheable. Requires `cacheComponents: true` in `next.config.ts`.

```tsx
// File-level (caches everything exported)
'use cache'

export default async function Page() { ... }
```

```tsx
// Function-level
export async function getData() {
  'use cache'
  const data = await db.query(...)
  return data
}
```

```tsx
// Component-level
export async function MyComponent() {
  'use cache'
  return <div>...</div>
}
```

### With `cacheLife`, `cacheTag`

Control cache behavior with helper functions.

```tsx
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache'

export async function getData() {
  'use cache'
  cacheLife('hours') // 'seconds', 'minutes', 'days', 'weeks', 'max'
  cacheTag('my-data')

  return await db.query(...)
}
```

## 3. Data Fetching Alternatives

### `unstable_cache` (Legacy API)

If you cannot use `use cache` yet, use `unstable_cache` for database queries.

```tsx
import { unstable_cache } from 'next/cache'

const getCachedUser = unstable_cache(
  async (userId) => getUser(userId),
  ['user-key'],
  { tags: ['user'], revalidate: 3600 }
)
```

## 4. Revalidation

Manually purge cache entries.

### `revalidatePath`

Revalidates data associated with a specific path.

```tsx
import { revalidatePath } from 'next/cache'
revalidatePath('/blog/[slug]')
```

### `revalidateTag`

Revalidates data associated with a specific cache tag.

```tsx
import { revalidateTag } from 'next/cache'
revalidateTag('collection')
```

## 5. Parallel Data Fetching

Always execute requests in parallel when possible to avoid waterfalls.

```tsx
// WRONG (Sequential)
const users = await getUsers()
const posts = await getPosts()

// CORRECT (Parallel)
const [users, posts] = await Promise.all([
  getUsers(),
  getPosts()
])
```

## 6. Preloading Pattern

Prevent waterfalls by preloading data in a parent component/layout.

```tsx
// utils/get-item.ts
import { cache } from 'react'
import 'server-only'

export const preload = (id: string) => {
  void getItem(id)
}

export const getItem = cache(async (id: string) => {
  // ...
})

// app/page.tsx
import { preload, getItem } from '@/utils/get-item'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  preload(id) // Start fetching immediately

  // checkIsAvailable uses getItem internally
  const isAvailable = await checkIsAvailable(id)

  return isAvailable ? <Item id={id} /> : null
}
```
