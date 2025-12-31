---
id: "006"
title: "Tasks for Todo TUI App"
stage: tasks
date: 2025-12-31
surface: agent
model: gemini-2.0-flash-exp
feature: todo-tui-app
branch: 001-todo-tui-app
user: user
command: /sp-tasks
labels: [tasks, planning, tdd]
links:
  spec: specs/001-todo-tui-app/spec.md
  plan: specs/001-todo-tui-app/plan.md
  tasks: specs/001-todo-tui-app/tasks.md
  ticket: null
  adr: null
  pr: null
files_yaml:
  - specs/001-todo-tui-app/tasks.md
tests_yaml: []
---

## Prompt

@[/sp-tasks]

## Response

Generated task checklist for "Todo TUI App".

**Task Overview**:
- **Total Tasks**: 25
- **Phases**: 6 (Setup, Persistence P1, Dashboard P1, Add P1, Actions P2, Filters P3).
- **Approach**: TDD (Red-Green-Refactor) mandated by Constitution.
- **Structure**: `todo-console-app/src/` per Plan.

**Execution Order**:
1. Setup project & libs.
2. Implement Core Data Models & Store (US5).
3. Build Dashboard UI (US1).
4. Build Add Task Flow (US2).
5. Build Actions (US3).
6. Build Filters (US4).
