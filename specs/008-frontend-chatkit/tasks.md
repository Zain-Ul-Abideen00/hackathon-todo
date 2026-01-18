# Tasks: Frontend ChatKit Integration

**Feature**: Frontend ChatKit Integration
**Status**: Pending
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Phase 1: Setup & Configuration
**Goal**: Prepare the environment and dependencies for ChatKit integration.

- [x] T001 Install `@openai/chatkit-react` dependency d:/GIAIC/Quarter 4/Hackathon/Project 2/hackathon-todo/package.json
- [x] T002 Configure environment variables in `.env.local` d:/GIAIC/Quarter 4/Hackathon/Project 2/hackathon-todo/frontend/.env.local

## Phase 2: User Story 1 - Interact with Chat Assistant (Priority: P1)
**Goal**: Display a floating chat widget that opens/closes and renders the ChatKit UI.
**Independent Test**: Verify widget visibility, open/close animations, and basic rendering.

- [x] T003 [US1] Create basic ChatBot component structure with `ChatKitSession` d:/GIAIC/Quarter 4/Hackathon/Project 2/hackathon-todo/frontend/src/components/chat/ChatBot.tsx
    > Use skill: [.agent/skills/integrating-chatkit/SKILL.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/integrating-chatkit/SKILL.md)
    > Use skill: [.agent/skills/building-nextjs-apps/SKILL.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/building-nextjs-apps/SKILL.md)
- [x] T004 [US1] Implement floating launcher button and widget container with Tailwind CSS d:/GIAIC/Quarter 4/Hackathon/Project 2/hackathon-todo/frontend/src/components/chat/ChatBot.tsx
- [x] T005 [P] [US1] Integrate ChatBot into global layout d:/GIAIC/Quarter 4/Hackathon/Project 2/hackathon-todo/frontend/src/app/layout.tsx
    > Use skill: [.agent/skills/building-nextjs-apps/SKILL.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/building-nextjs-apps/SKILL.md)

## Phase 3: User Story 2 - Authenticated Context (Priority: P1)
**Goal**: Ensure chat requests are authenticated with the user's session token.
**Independent Test**: Inspect network requests to confirm `Authorization` header injection.

- [x] T006 [US2] Implement `customFetch` in `ChatBot.tsx` to inject Better Auth token d:/GIAIC/Quarter 4/Hackathon/Project 2/hackathon-todo/frontend/src/components/chat/ChatBot.tsx
    > Use skill: [.agent/skills/integrating-chatkit/references/frontend-patterns.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/integrating-chatkit/references/frontend-patterns.md)

## Phase 4: User Story 3 - Persistence & Customization (Priority: P2)
**Goal**: Persist chat sessions across navigation and clean up on logout.
**Independent Test**: Reload page to verify history persistence; logout to verify clearance.

- [x] T007 [US3] Implement `localStorage` thread ID persistence and logout cleanup d:/GIAIC/Quarter 4/Hackathon/Project 2/hackathon-todo/frontend/src/components/chat/ChatBot.tsx
    > Use skill: [.agent/skills/integrating-chatkit/references/frontend-patterns.md](file:///d:/GIAIC/Quarter%204/Hackathon/Project%202/hackathon-todo/.agent/skills/integrating-chatkit/references/frontend-patterns.md)

## Phase 5: Polish & Cross-Cutting Concerns
**Goal**: Ensure mobile responsiveness and final UI polish.

- [x] T008 [P] Verify and refine mobile full-screen responsiveness d:/GIAIC/Quarter 4/Hackathon/Project 2/hackathon-todo/frontend/src/components/chat/ChatBot.tsx

## Implementation Strategy
- **MVP**: Complete Phase 1 & 2 to get the UI on screen.
- **Data**: Phase 3 ensures real users can use it.
- **Polish**: Phase 4 & 5 handle persistence and mobile UX.
