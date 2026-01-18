# Data Model: Frontend ChatKit Integration

## Local Storage Schema

The frontend uses `localStorage` to persist the active chat thread ID.

| Key | Value Format | Scope | Expiry |
|-----|--------------|-------|--------|
| `chatkit_thread_{userId}` | `uuid` string | Authenticated User | On Logout |
| `chatkit_thread_anonymous` | `uuid` string | Guest User | Never (or browser clear) |

## Component State (transient)

- `isChatOpen`: `boolean` (Visibility state of the widget)
- `threadId`: `string` (Current active thread ID, synced to localStorage)
