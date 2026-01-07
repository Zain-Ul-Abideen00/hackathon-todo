# Next.js 16 Server Actions Patterns

> **Source**: Next.js 16 Official Documentation (Forms & Mutations)

## Core Concepts

Server Actions are asynchronous functions that execution on the server. They can be used in Server and Client Components to handle form submissions and data mutations.

## 1. Basic Form Submission

```tsx
// app/invoices/page.tsx
export default function Page() {
  async function createInvoice(formData: FormData) {
    'use server'

    const rawFormData = {
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    }

    // mutate data
    // await db.insert(...)

    // revalidate cache
    // revalidatePath('/invoices')
  }

  return <form action={createInvoice}>...</form>
}
```

## 2. Server Actions in Client Components

Pass the action as a prop or import it.

```tsx
// app/actions.ts
'use server'

export async function createInvoice(formData: FormData) {
  // ...
}

// app/ui/button.tsx
'use client'

import { createInvoice } from '@/app/actions'

export function Button() {
  return (
    <form action={createInvoice}>
      <button>Create Invoice</button>
    </form>
  )
}
```

## 3. Pending States (React 19 `useActionState`)

Use `useActionState` (formerly `useFormState`) to handle loading states and return values.

```tsx
'use client'

import { useActionState } from 'react'
import { createInvoice } from '@/app/actions'

const initialState = {
  message: '',
}

export function Signup() {
  const [state, formAction, isPending] = useActionState(createInvoice, initialState)

  return (
    <form action={formAction}>
      <label htmlFor="email">Email</label>
      <input type="text" id="email" name="email" required />

      {/* Pending state is now directly available! */}
      <button disabled={isPending}>Sign up</button>

      <p aria-live="polite">{state?.message}</p>
    </form>
  )
}
```

## 4. Input Validation (Zod)

```tsx
// app/actions.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const schema = z.object({
  email: z.string().email(),
})

export async function createInvoice(prevState: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Mutate data
  // await db.createInvoice(validatedFields.data)

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}
```

## 5. Programmatic Submission

```tsx
'use client'

export function Entry() {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key === 'Enter' || e.key === 'NumpadEnter')
    ) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <div>
      <textarea name="entry" rows={20} required onKeyDown={handleKeyDown} />
    </div>
  )
}
```

## 6. Passing Additional Arguments

Use `bind` to pass extra arguments to the action.

```tsx
// app/actions.ts
'use server'

export async function updateUser(userId: string, formData: FormData) {
  // ...
}

// app/user-form.tsx
import { updateUser } from './actions'

export function UserForm({ userId }: { userId: string }) {
  const updateUserWithId = updateUser.bind(null, userId)

  return (
    <form action={updateUserWithId}>
      <input type="text" name="name" />
      <button type="submit">Update</button>
    </form>
  )
}
```
