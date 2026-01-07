---
name: lightswind-ui
description: |
  Master Lightswind UI integration. Use when adding, configuring, and troubleshooting Lightswind components.
  Includes "perfect usage" guidelines for imports, theming (lightswind.css), and animations.
  The library is pre-installed in `frontend/src/components/lightswind`.
---

# Lightswind UI

## What this skill is for

Lightswind UI is a premium React component kit (130+ components) built on Tailwind CSS, Framer Motion, and Three.js. This skill ensures you use the **installed** library correctly.

Use this skill to:
- Find and import existing components from `@/components/lightswind/*`
- Add new components properly (via CLI or manual copy if needed)
- Ensure styling and animations work by verifying `lightswind.css` imports
- Configure dependencies (Framer Motion, GSAP, etc.) for advanced effects

## Perfect Usage Guidelines

### 1. Component Location & Imports
All components are located in `frontend/src/components/lightswind/`.
**Pattern:**
```tsx
import { Button } from "@/components/lightswind/button"
import { ToggleTheme } from "@/components/lightswind/toggle-theme"
```
*See `references/component_list.md` for the full inventory.*

### 2. Critical Asset: `lightswind.css`
The library relies on a standalone CSS file for variables, neon effects, and animations.
**Rule:** Ensure `frontend/src/lightswind.css` is imported in your root layout or global CSS.

```tsx
// frontend/src/app/layout.tsx (or similar)
import "../lightswind.css"; // Check relative path!
import "./globals.css";
```

### 3. Theming (Light/Dark Mode)
Lightswind components use CSS variables defined in `lightswind.css`.
- **Light variables**: `:root { --primarylw: ... }`
- **Dark variables**: `.dark { --primarylw: ... }`
- **Toggle**: Use the `<ToggleTheme />` component which uses the View Transitions API and handles `.dark` class toggling on `<html>`.

### 4. Dependencies
Many components require specific libraries. The project already has:
- `framer-motion` (Animations)
- `gsap` (Advanced animations)
- `@react-three/fiber` & `drei` (3D elements)
- `cobe` (Globe)
- `lightswind` (Core package)

If a component crashes, first check if its specific dependency is installed.

## Quick Actions (Trigger Phrases)

- "Add a 3D carousel from Lightswind" -> Check `3d-carousel.tsx` existing usage or add new.
- "Fix Lightswind dark mode" -> Check `lightswind.css` import and `ToggleTheme` usage.
- "List available Lightswind components" -> Read `references/component_list.md`.
- "Use the neon button" -> Import from `components/lightswind/button.tsx` or `shine-button.tsx`.

## Core Concepts

### Local-First Architecture
Components are "owned" code in your project. You can modify `frontend/src/components/lightswind/*.tsx` directly to customize behavior (e.g., changing animation duration in `toggle-theme.tsx`).

### Animation Performance
Many components use heavy animations.
- **GSAP/Framer**: Ensure `useClient` directive is present.
- **3D**: Lazy load heavy 3D components if possible (`next/dynamic`).

## Critical Rules

1. **Do not reinstall** if the component exists in `src/components/lightswind`. Reuse it.
2. **Always import `lightswind.css`**. Without it, variables like `--primarylw` will fail, and components will look broken.
3. **Check `cn()` utility**. Components rely on `lib/utils.ts` for class merging.
4. **View Transitions**: `ToggleTheme` uses `document.startViewTransition`. Ensure browser compatibility or fallback if needed (though widely supported in modern Chrome/Arc).
