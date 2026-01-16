---
id: 3
title: frontend-core-task-generation
stage: tasks
date: 2026-01-11
surface: agent
model: gemini-2.5-pro
feature: frontend-core
branch: 006-frontend-core
user: system
command: /sp.tasks
labels:
  - frontend
  - tasks
  - module-5
  - lightswind
links:
  spec: specs/006-frontend-core/spec.md
  plan: specs/006-frontend-core/plan.md
  tasks: specs/006-frontend-core/tasks.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-frontend-core/tasks.md
tests: []
---

# PHR: Frontend Core Task Generation

## Prompt

```text
/sp.tasks add these agent and skill references in tasks as well:
Use @nextjs-developer for ALL Next.js 16 work (handles async params correctly)
Use @ui-designer for Lightswind components and premium design
Use @frontend-developer for component composition

Reference skill directories:
- .claude/skills/building-nextjs-apps (CRITICAL: async params pattern)
- .claude/skills/lightswind-ui for all component usage
```

## Response Summary

Generated comprehensive task breakdown with 85 tasks across 10 phases:

**Phase Breakdown**:
- Phase 1: Setup (9 tasks)
- Phase 2: Foundational (8 tasks)
- Phase 3: US1 - Landing Page (8 tasks)
- Phase 4: US2 - Theme Toggle (5 tasks)
- Phase 5: US3 - Auth Pages (9 tasks)
- Phase 6: US4 - Desktop Layout (7 tasks)
- Phase 7: US5 - Mobile Layout (7 tasks)
- Phase 8: US6 - Task CRUD (10 tasks)
- Phase 9: US7 - Filtering (7 tasks)
- Phase 10: Polish (15 tasks)

**Agent & Skill References Included**:
- `@nextjs-developer` - Next.js 16 patterns, async params
- `@ui-designer` - Lightswind components, premium design
- `@frontend-developer` - Component composition
- `.claude/skills/building-nextjs-apps/` - Async params examples
- `.claude/skills/lightswind-ui/` - Component usage

**Parallel Opportunities**: 40+ tasks marked [P] for parallel execution

## Outcome

✅ Tasks generated, ready for `/sp.implement` phase
