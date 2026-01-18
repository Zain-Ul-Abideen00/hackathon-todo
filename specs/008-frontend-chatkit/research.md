# Research: Frontend ChatKit Integration

## Decision: Styling with Tailwind CSS
**Rationale**: Using Tailwind CSS ensures consistency with the existing design system (Lightswind UI) and reduces the need for separate CSS files. `global.css` already contains the theme configuration needed.
**Implementation**: Use utility classes for fixed positioning, z-index, and responsive layout (e.g., `fixed bottom-6 right-6`, `md:w-96`, `w-screen h-screen md:h-auto`).
**Alternatives Considered**: CSS Modules. Rejected to maintain a unified styling approach and avoid mixing paradigms.

## Decision: LocalStorage for Thread Persistence
**Rationale**: Storing `chatkit_thread_{userId}` in localStorage allows the chat session to survive page reloads and browser restarts without needing a database hit on every page load to fetch the "active" thread.
**Security**: Thread ID is not sensitive data.
**Privacy**: Cleared on logout to prevent next user from seeing previous functionality.

## Decision: Full-screen Mobile Interface
**Rationale**: As clarified in spec session, full-screen offers better UX on small screens, preventing keyboard overlap and tapping issues.
**Implementation**: CSS Media Queries in `chat.module.css` targeting `max-width: 480px`.

## Decision: ChatKitSession Inner Component
**Rationale**: Separating the session handling into an inner component allows us to reset the `useChatKit` hook state completely when the `storageKey` changes (i.e., user logs in/out). This prevents thread bleeding between sessions.
