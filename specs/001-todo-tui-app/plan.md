# Implementation Plan: Todo TUI App

**Branch**: `001-todo-tui-app` | **Date**: 2025-12-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-todo-tui-app/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The "Todo TUI App" is a console-based task manager built with the Textual framework. It allows users to add, edit, delete, and complete tasks using keyboard navigation. Data is persisted to a local JSON file (`tasks.json`). The app emphasizes speed, simplicity, and a mouse-free workflow.

## Technical Context

**Language/Version**: Python 3.12+
**Primary Dependencies**:
- `textual` (TUI Framework)
- `pydantic` (Data Validation)
- `pytest` (Testing)
- `pytest-asyncio` (Async Testing)
- `pytest-textual` (UI Testing)
**Storage**: Local JSON file (`tasks.json`) in CWD.
**Testing**: `pytest` for unit/logic tests, `pytest-textual` for UI interaction tests.
**Target Platform**: Cross-platform (Windows, Linux, macOS terminal).
**Project Type**: Single Console Application.
**Performance Goals**: <200ms view updates, instant keystroke response.
**Constraints**: No external database server. Keyboard-only navigation required.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Textual Framework First**: Plan uses Textual explicitly.
- [x] **II. Keyboard-Centric Navigation**: Plan prioritizes keyboard flows.
- [x] **III. Modular & Type-Safe**: Plan uses Pydantic and separates concerns (models, store, ui).
- [x] **IV. TDD**: Plan mandates tests before implementation.
- [x] **V. Simple Persistence**: Plan uses JSON file, no DB server.
- [x] **VI. Tooling**: Plan targets Python 3.12+ and assumes `uv` usage per constitution.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-tui-app/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (Not applicable for local app, but keeping folder)
└── tasks.md             # Phase 2 output
```

### Source Code (into todo-console-app)

```text
src/
├── main.py              # App Entry Point
├── models.py            # Task Data Models (Pydantic)
├── store.py             # JSON File Persistence (Repository Pattern)
└── tui.py               # Textual App, Screens, and Widgets

tests/
├── unit/
│   ├── test_models.py   # Test data validation
│   └── test_store.py    # Test persistence logic
└── ui/
    └── test_app.py      # Test TUI interactions (pytest-textual)
```

**Structure Decision**: Adopting the flat `todo-console-app/src/` modular structure requested by user for simplicity, while maintaining separation of concerns (Models vs UI vs Store).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None      | N/A       | N/A                                 |
