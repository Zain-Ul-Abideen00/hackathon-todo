---
id: 004
title: create Lightswind UI skill
stage: general
date: 2026-01-06
surface: Claude Code
model: claude-opus-4-5-20251101
feature: none
branch: main
user: unknown
command: creating-skills
labels: [lightswind-ui,react,tailwind,framer-motion,skills]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .claude/skills/lightswind-ui/SKILL.md
 - .claude/skills/lightswind-ui/scripts/verify.py
 - .claude/skills/lightswind-ui/scripts/example.py
 - .claude/skills/lightswind-ui/references/api_reference.md
 - .claude/skills/lightswind-ui/assets/example_asset.txt
tests:
 - python3 .claude/skills/lightswind-ui/scripts/verify.py (PASS)
 - python3 .claude/skills/creating-skills/scripts/verify.py .claude/skills/lightswind-ui (PASS)
---

## Prompt

Use the `creating-skills` to create a new skill for **Lightswind UI**.

1.  **Research**:
    *   Visit `https://lightswind.com/components` and `https://lightswind.com/docs` to understand the library.
    *   Use the `context7` MCP server to fetch any available documentation or context about "Lightswind UI".
    *   Identify key features: 100+ 3d, animated, React components, Tailwind CSS integration, Framer Motion support, and light/dark mode.

2.  **Create Skill**:
    *   Create a new directory: `.claude/skills/lightswind-ui`
    *   Generate a `SKILL.md` file in that directory.
    *   Follow the standard skill anatomy (Description, Core Concepts, Critical Rules).

3.  **Skill Content**:
    *   **Description**: Focus on "Beautifully crafted, animated React components built with Tailwind CSS and Framer Motion and other components."
    *   **Patterns**: Include examples of how to import and use components (e.g., `<Button />`, `<Card />`).
    *   **Installation**: Document how to install it (CLI or npm packages) based on your research.

Please ensure the skill follows the progressive disclosure principal defined in `creating-skills`.

## Response snapshot

Researched Lightswind UI via website and Context7 (GitHub README). Initialized a new skill at `.claude/skills/lightswind-ui`, wrote a concise SKILL.md with trigger-based description, installation/CLI usage, typical import patterns (Button/Card), theming/dark-mode guidance, and dependency notes (Framer Motion + optional Three.js/R3F). Added a local `scripts/verify.py` and verified the skill passes validation.

## Outcome

- ✅ Impact: Added a new `lightswind-ui` skill with installation + usage workflow and critical rules for reliable integration.
- 🧪 Tests: Skill validation scripts executed successfully.
- 📁 Files: Created the new skill folder and its required SKILL.md plus verification script.
- 🔁 Next prompts: Package the skill via `package_skill.py`, or refine with more component/category-specific examples if needed.
- 🧠 Reflection: Keep the skill body focused on the local-first CLI workflow and move deep component catalogs into references if they grow.

## Evaluation notes (flywheel)

- Failure modes observed: Lightswind site pages returned mostly metadata via automated fetch; relied on Context7/GitHub README for authoritative installation/CLI details.
- Graders run and results (PASS/FAIL): not run
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Add a small reference file listing common `npx lightswind add --category ...` categories (animated/effects/3d) once the official docs pages can be reliably fetched.
