<!--
SYNC IMPACT REPORT
- Version change: 0.0.0 -> 1.0.0 (Initial Ratification)
- Added Principles: Textual Framework, Keyboard Navigation, Modular/Type-Safe, TDD, Simple Persistence.
- Defined Tech Stack: Python 3.12, uv.
-->
# Todo Console App Constitution

## Core Principles

### I. Textual Framework First
The UI MUST be built using the `Textual` framework to ensure a rich, interactive TUI experience. Standard CLI arguments are permitted for configuration (e.g., --help, --version), but the primary user interface is the interactive TUI.

### II. Keyboard-Centric Navigation
The application MUST support intuitive keyboard navigation for all interactive elements.
- **Arrow Keys**: Navigate lists and menus.
- **Enter**: Select items or confirm actions.
- **Escape**: Go back or cancel.
- **Tab/Shift+Tab**: Focus traversal.
Mouse support is optional and should not be required for core functionality.

### III. Modular & Type-Safe
Code MUST be modular, adhering to clean architecture principles.
- **Pydantic**: MUST be used for all data models and validation.
- **Type Hints**: Python type hints are mandatory for all function signatures.
- **Documentation**: All public modules, classes, and functions MUST have docstrings.

### IV. Test-Driven Development (TDD) (NON-NEGOTIABLE)
TDD is mandatory.
1. **Red**: Write a failing test for the desired behavior (Pytest).
2. **Green**: Write the minimal code to pass the test.
3. **Refactor**: Improve code quality without changing behavior.
Code without corresponding tests is not considered "done".

### V. Simple Persistence
To ensure portability and simplicity:
- **No Database Server**: Do not use external database servers (e.g., Postgres, MySQL) at this stage.
- **Storage**: Use in-memory storage (simulated persistence) or a simple JSON file.
- **Repository Pattern**: Access data via a repository interface to allow easy swapping of storage backends later.

### VI. Tooling & Environment
- **Dependency Management**: MUST use `uv` for project management and virtual environments.
- **Python Version**: MUST target Python 3.12+.

### VII. Documentation
- **Spec & Plan**: MUST maintain a `plan.md` file for project planning and tracking.
- **Commit Messages**: MUST follow conventional commit messages.
- **Code Comments**: MUST include comments for non-obvious logic.

### VIII. Documentation Standards
Every public function, class, and module MUST have a docstring following Google style format. The README MUST contain setup instructions, usage examples, and command reference. API documentation MUST be auto-generated where practical.

**Rationale**: Documentation reduces onboarding time, serves as runtime help, and ensures knowledge transfer.

### IX. Simplicity
The simplest solution that meets requirements MUST be preferred. Avoid over-engineering, premature optimization, and unnecessary abstractions. YAGNI (You Aren't Gonna Need It) principles MUST guide design decisions.

**Rationale**: Simple code is easier to understand, maintain, and debug. Complexity should only be added when actually needed.

## Technology Stack

- **Language**: Python 3.12+
- **Framework**: Textual (for rich, interactive TUI)
- **Testing**: Pytest (for test-first development)
- **Data/Validation**: Pydantic (for type-safe models)
- **Dependency Management**: uv (for fast, reproducible dependencies)
- **Storage**: In-memory storage with simulated persistence (no database required)

## Development Workflow

1. **Spec & Plan**: Define requirements and technical approach first.
2. **Test First**: Create test cases based on requirements.
3. **Implement**: Code the solution.
4. **Verify**: Run suite to ensure no regressions.
5. **Document**: Update relevant documentation.

### Commit Requirements
Each commit SHOULD represent a logical unit of work. Commits MUST include tests for the functionality added. The Red-Green-Refactor cycle MUST be visible in commit history.

## Governance

This constitution supersedes all other development practices. All PRs and code reviews MUST verify compliance with these principles.

### Amendment Procedure
- Minor additions (new principles or expanded guidance) require version MINOR bump
- Clarifications, wording fixes require version PATCH bump
- Backward incompatible changes require version MAJOR bump and migration plan

### Compliance Review
- Every code review MUST check for constitution compliance
- Complexity deviations MUST be justified in writing
- Use the Constitution Check section in `plan.md` for gate validation

### Runtime Guidance
- See `task.md` for active development tasks.

**Version**: 1.0.0 | **Ratified**: 2025-12-31 | **Last Amended**: 2025-12-31
