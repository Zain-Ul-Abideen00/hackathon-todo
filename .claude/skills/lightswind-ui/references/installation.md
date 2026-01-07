- Install and initialize Lightswind UI in an existing React/Next.js project
- Add components via the Lightswind CLI and then use them from your local `components/lightswind/*` folder
- Ensure Tailwind + theme (light/dark) setup matches the library expectations

## Quick start (recommended path)

### 1) Install

```bash
pnpm add lightswind
# or: yarn add lightswind
# or: npm install lightswind@latest
```

### 2) Initialize the project integration

```bash
npx lightswind@latest init
```

This typically scaffolds the local components folder (similar to “copy into your project” libraries).

### 3) Add components

```bash
npx lightswind@latest add button
# add an entire category
npx lightswind@latest add --category <category-name>
# list available components/categories
npx lightswind@latest list
```

### 4) Perfect Usage Guidelines

#### 1. Component Location & Imports
All components are located in `frontend/src/components/lightswind/`.
**Pattern:**
```tsx
import { Button } from "@/components/lightswind/button"
import { ToggleTheme } from "@/components/lightswind/toggle-theme"
```
*See `references/component_list.md` for the full inventory.*

#### 2. Critical Asset: `lightswind.css`
The library relies on a standalone CSS file for variables, neon effects, and animations.
**Rule:** Ensure `frontend/src/lightswind.css` is imported in your root layout or global CSS.

```tsx
import { Button } from "@/components/lightswind/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/lightswind/card";

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
        <CardDescription>Description</CardDescription>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
      <CardFooter />
    </Card>
  );
}
```

## Core concepts

### Components are local-first

After `init` / `add`, you generally *import from your project* (e.g., `@/components/lightswind/...`). Treat these as owned code: you can customize the generated components and Tailwind classes as needed.

### Tailwind is required

Lightswind UI components are built on Tailwind CSS. Ensure your Tailwind setup is working before debugging component styling.

### Animated + 3D categories may add dependencies

Some component categories require additional libraries:
- Animated effects often require **Framer Motion**
- 3D components may require **Three.js** and **@react-three/fiber**

Prefer adding components via the CLI so required dependencies are installed/configured consistently.

### Theming and dark mode

Lightswind UI uses CSS variables for theming, with `.dark` overrides for dark mode.

Minimal expected pattern:
- Tailwind configured for class-based dark mode (`darkMode: "class"`)
- Theme variables defined in CSS

```css
:root {
  --primarylw: 240 5% 10%;
  --primarylw-foreground: 0 0% 98%;
}

.dark {
  --primarylw: 0 0% 98%;
  --primarylw-foreground: 240 5% 10%;
}
```

If you want an actual theme toggle implementation, treat that as app-level behavior (outside this skill). Keep the skill focused on integrating the component kit and making sure `.dark` is wired correctly.


## Critical rules (keep this reliable)

1. **Do not “npm import” components that don’t exist in the package.** Use `npx lightswind@latest add ...` to generate them into your repo, then import from `@/components/lightswind/...`.
2. **Treat generated components as source code.** If you change animations or classnames, update the local files and re-run `add` only when you explicitly want to overwrite/refresh.
3. **Keep Tailwind + theme consistent.** If dark mode looks broken, check:
   - Tailwind `darkMode: "class"`
   - Your app’s root element toggles `.dark`
   - CSS variables exist for both `:root` and `.dark`
4. **When using 3D/effects components, confirm deps.** If a component uses motion/3D, ensure `framer-motion`, `three`, and `@react-three/fiber` (as applicable) are installed.

## Good trigger phrases (examples)

- “Add Lightswind UI to my Next.js app”
- “Install Lightswind UI and add a Button/Card”
- “Use Lightswind’s animated components with Framer Motion”
- “Set up Lightswind UI dark mode / theme variables”
- “Add Lightswind 3D components (Three.js / R3F)”
