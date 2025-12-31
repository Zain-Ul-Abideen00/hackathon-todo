---
id: "001"
title: "Initialize Project Constitution"
stage: constitution
date: 2025-12-31
surface: agent
model: gemini-2.0-flash-exp
feature: none
branch: main
user: user
command: /sp-constitution
labels: [constitution, setup, principles]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - ".specify/memory/constitution.md"
tests_yaml: []
---

## Prompt

@[/sp-constitution] Create a Python 3.12 interactive TUI application using 'uv' for dependency management.
Project Location: Directory `todo-console-app`. Entry point at `src/main.py`.
Key principles:
1. Use 'Textual' framework for a rich, interactive Terminal User Interface (TUI).
2. Navigation: Must support keyboard arrow keys for selecting tasks and menus.
3. Code must be modular, type-safe (Pydantic models), and fully documented.
4. Follow TDD: Write Pytest tests before implementation.
5. No database yet; use in-memory storage (simulated persistence) or simple JSON file.

## Response

Initialized the project constitution at `.specify/memory/constitution.md` with version 1.0.0.

### Ratified Principles
1. **Textual Framework First**: TUI based on Textual.
2. **Keyboard-Centric Navigation**: Arrow keys mandatory.
3. **Modular & Type-Safe**: Pydantic & Docstrings required.
4. **Test-Driven Development**: Pytest & Red-Green-Refactor cycle.
5. **Simple Persistence**: In-memory/JSON storage initially.
6. **Tooling**: Python 3.12 + `uv`.
