# Implementation Plan: Frontend ChatKit Integration

**Branch**: `008-frontend-chatkit` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-frontend-chatkit/spec.md`

## Summary

Integrate OpenAI ChatKit into the Next.js frontend to provide a persistent AI chat assistant. This involves creating a global floating chat widget that uses `useChatKit` for thread management, streaming AI responses, and secure authentication via JWT injection.

## Technical Context

**Language/Version**: TypeScript 5.x (Next.js 16+)
**Primary Dependencies**: `@openai/chatkit-react`
**Storage**: LocalStorage for thread ID persistence (`chatkit_thread_{userId}`)
**Testing**: Playwright for E2E, Vitest for unit tests
**Target Platform**: Web (Responsive: Desktop Popup, Mobile Full-screen)
**Project Type**: Web application (Frontend only)
**Performance Goals**: Widget open < 200ms
**Constraints**: Must match Lightswind UI, fully responsive

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Next.js 16+**: Uses App Router and Server Components (where possible, ChatBot is client-side).
- [x] **TypeScript**: Strict mode enabled.
- [x] **Styling**: Tailwind CSS + Lightswind UI (via global.css and utility classes).
- [x] **Authentication**: Uses Better Auth session for JWT injection.
- [x] **Security**: Secrets kept in `.env.local` (NEXT_PUBLIC_ prefixes for safe frontend vars).
- [x] **Accessibility**: Chat interface supports keyboard navigation.

## Critical Decisions & Review Items

> [!IMPORTANT]
> **Mobile Layout Decision**: The mobile interface will be **full-screen** to prevent keyboard overlap issues. This differs from the desktop popup behavior.

> [!NOTE]
> **Privacy**: Chat history will be cleared from localStorage immediately upon logout.

## Implementation Details

### Frontend Core

#### [NEW] [ChatBot.tsx](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/frontend/src/components/chat/ChatBot.tsx)
- Implements `ChatKitSession` to handle ChatKit lifecycle.
- Uses `useChatKit` hook for UI control and thread management.
- Implements `customFetch` to inject `Authorization: Bearer <token>` header.
- Manages local storage persistence (`chatkit_thread_{userId}`).
- Auto-restores latest thread on mount.
- **Styling**: Uses Tailwind CSS utility classes for positioning (`fixed`, `bottom-6`, `right-6`) and responsiveness (`w-full h-full md:w-96 md:h-[600px]`), inheriting theme from `globals.css`.

#### [MODIFY] [layout.tsx](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/frontend/src/app/layout.tsx)
- Import and render `<ChatBot />` globally to ensure persistence across navigation.

#### [MODIFY] [.env.local](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/frontend/.env.local)
- Add `NEXT_PUBLIC_CHATKIT_URL`
- Add `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY`

## Verification Plan

### Manual Verification
1. **Desktop UI**:
   - Start app: `pnpm dev`
   - Verify floating icon appears in bottom-right.
   - Click icon -> Widget opens.
   - Click backdrop -> Widget closes.
2. **Authentication**:
   - Log in.
   - Send message "Hello".
   - Inspect Network tab -> Request to `/api/chat` MUST have `Authorization` header.
3. **Mobile UI**:
   - Toggle Device Toolbar (Chrome DevTools).
   - Switch to "iPhone SE" view.
   - Open chat -> Verify it covers full screen.
4. **Persistence**:
   - Send a message.
   - Reload page -> History should remain.
   - Log out -> Verify localStorage key `chatkit_thread_{id}` is cleared (or check if history is gone on next login).

## Project Structure

### Documentation (this feature)

```text
specs/008-frontend-chatkit/
├── plan.md              # This file
├── research.md          # Output: Technical rationale
├── data-model.md        # Output: Data entities
└── tasks.md             # Output: Development tasks
```

### Source Code (frontend)

```text
frontend/
├── src/
│   ├── app/
│   │   └── layout.tsx       # Global ChatBot provider
│   ├── components/
│   │   └── chat/
│   │       └── ChatBot.tsx  # Main component (Tailwind styled)
│   └── lib/
│       └── auth-client.ts   # Existing auth client
```

**Structure Decision**: A dedicated `components/chat` directory encapsulates the widget logic. Styling utilizes Tailwind CSS utility classes. Global availability is achieved by mounting in `app/layout.tsx`.
