---
id: "1"
title: "Specifying Frontend ChatKit Integration"
stage: "spec"
date: "2026-01-18"
surface: "agent"
model: "gemini-2.0-flash-exp"
feature: "frontend-chatkit"
branch: "008-frontend-chatkit"
user: "Zain-Ul-Abideen00"
command: "/sp-specify"
labels: ["spec", "feature", "frontend"]
links:
  spec: "specs/008-frontend-chatkit/spec.md"
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - specs/008-frontend-chatkit/spec.md
  - specs/008-frontend-chatkit/checklists/requirements.md
tests_yaml: |
  - null
prompt_text: |
  @[/sp-specify]  Feature: Frontend ChatKit Integration

  Use @[.agent/agents/nextjs-developer.md]  ,  @[.agent/agents/ui-designer.md]
  Reference skills directories:  @[.agent/skills/integrating-chatkit] , @[.agent/skills/building-nextjs-apps]  ,  @[.agent/skills/lightswind-ui]

  User Stories:
  1. As a user, I see a floating chat icon on every page.
  2. As a user, clicking the icon opens a chat popup widget.
  3. As a user, my messages include my auth token automatically.
  4. As a user, I see streaming AI responses in real-time.
  5. As a user, my chat history persists per user (or anonymous).
  6. As a user, I can close the chat by clicking the backdrop.

  Technical Requirements:

  1. Install: pnpm add @openai/chatkit-react

  2. Create components/chat/ChatBot.tsx:
    - Floating button with TbMessageChatbot icon
    - Popup widget container with ChatKit
    - Custom fetch to add Authorization header
    - User-specific localStorage key (chatkit_thread_{userId})
    - Anonymous fallback key (chatkit_thread_anonymous)

  3. Create components/chat/chat.module.css:
    - Floating button styles (fixed bottom-right)
    - Widget container styles (responsive popup)
    - Backdrop overlay styles

  4. Add ChatBot to app/layout.tsx (global availability)

  5. Environment variables:
    - NEXT_PUBLIC_CHATKIT_URL=http://localhost:8000/api/chat
    - NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=localhost

  6. Theme customization:
    - Match app color scheme
    - Custom greeting for Todo Assistant
    - Starter prompts for task management

  Acceptance Criteria:
  - Floating icon visible on all pages
  - Click opens popup widget
  - Click backdrop closes widget
  - Messages sent with JWT when authenticated
  - Streaming responses display
  - Thread persists per user
  - Responsive on mobile/desktop

  For more details see  @[learning/02-The Evolution of Todo/phase3_spec_guide.md]
response_text: |
  Created feature specification for Frontend ChatKit Integration in `specs/008-frontend-chatkit/spec.md`.
  Verified content against quality checklist and ensured implementation details are reserved for the planning phase.
  Ready for planning.
---

Created feature specification for Frontend ChatKit Integration in `specs/008-frontend-chatkit/spec.md`.
Verified content against quality checklist and ensured implementation details are reserved for the planning phase.
Ready for planning.
