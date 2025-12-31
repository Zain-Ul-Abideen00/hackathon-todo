# Hackathon Todo Project

A comprehensive todo management system built for the GIAIC Q4 Hackathon (Project 2). This repository contains a terminal-based todo application with a rich, interactive user interface built using Python's Textual framework.

## Project Overview

This project implements a **Terminal User Interface (TUI) Todo Application** that provides a modern, keyboard-driven experience for task management. The application emphasizes simplicity, type safety, and excellent user experience in the terminal.

### Key Features

- Rich terminal user interface powered by Textual
- Complete keyboard navigation (no mouse required)
- Full CRUD operations (Create, Read, Update, Delete) for tasks
- Task filtering by status (All, Pending, Completed)
- Persistent local storage using JSON
- Type-safe data models with Pydantic
- Test-driven development approach

## Repository Structure

```
hackathon-todo/
├── .specify/                    # Project configuration and templates
│   ├── memory/                  # Project constitution and guidelines
│   └── templates/               # Document templates
├── specs/                       # Feature specifications
│   └── 001-todo-tui-app/       # Todo TUI App specification
│       ├── spec.md             # Feature requirements
│       ├── plan.md             # Implementation plan
│       ├── tasks.md            # Development tasks
│       └── data-model.md       # Data model documentation
├── todo-console-app/           # Main application directory
│   ├── src/                    # Source code
│   │   ├── main.py            # Application entry point
│   │   ├── models.py          # Data models (Pydantic)
│   │   ├── store.py           # Persistence layer
│   │   └── tui.py             # UI components (Textual)
│   ├── tests/                 # Test suite
│   ├── pyproject.toml         # Project configuration
│   └── README.md              # Application-specific documentation
├── CLAUDE.md                  # AI assistant guidelines
└── README.md                  # This file
```

## Getting Started

### Prerequisites

- Python 3.12 or higher
- `uv` (recommended for dependency management) or `pip`

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/Zain-Ul-Abideen00/hackathon-todo.git
   cd hackathon-todo
   ```

2. Navigate to the application directory:
   ```bash
   cd todo-console-app
   ```

3. Install dependencies:
   ```bash
   uv sync
   ```

### Running the Application

Launch the Todo TUI App:
```bash
cd todo-console-app
uv run python src/main.py
```

## Usage

Once the application is running, use these keyboard shortcuts:

| Key | Action |
|-----|--------|
| `a` | Add a new task |
| `e` | Edit the selected task |
| `d` | Delete the selected task (with confirmation) |
| `c` | Toggle task completion status |
| `↑` / `↓` | Navigate through tasks |
| `Tab` | Switch between filters (All/Pending/Completed) |
| `Enter` | Confirm actions |
| `Esc` | Cancel or go back |
| `q` | Quit the application |

## Development

### Project Philosophy

This project follows the **Spec-Driven Development (SDD)** methodology with these core principles:

1. **Textual Framework First**: Rich TUI experience using Textual
2. **Keyboard-Centric Navigation**: Complete keyboard control
3. **Modular & Type-Safe**: Clean architecture with Pydantic validation
4. **Test-Driven Development**: All features backed by tests
5. **Simple Persistence**: JSON-based local storage
6. **Simplicity**: YAGNI principles guide all design decisions

See [.specify/memory/constitution.md](.specify/memory/constitution.md) for the complete development guidelines.

### Running Tests

Execute the test suite:
```bash
cd todo-console-app
uv run pytest
```

### Architecture

The application follows a clean, modular architecture:

- **Models** (`models.py`): Pydantic data models for type-safe task representation
- **Store** (`store.py`): Repository pattern for data persistence
- **TUI** (`tui.py`): Textual-based user interface components
- **Main** (`main.py`): Application entry point and orchestration

### Technology Stack

- **Python 3.12+**: Modern Python features and type hints
- **Textual**: Rich terminal UI framework
- **Pydantic**: Data validation and settings management
- **pytest**: Testing framework
- **uv**: Fast, reliable dependency management

## Documentation

- [Application README](todo-console-app/README.md) - Detailed application documentation
- [Feature Specification](specs/001-todo-tui-app/spec.md) - Requirements and user stories
- [Implementation Plan](specs/001-todo-tui-app/plan.md) - Technical architecture
- [Development Tasks](specs/001-todo-tui-app/tasks.md) - Tracked development tasks
- [Project Constitution](.specify/memory/constitution.md) - Development principles

## Contributing

This is a hackathon project developed as part of GIAIC Quarter 4. Contributions follow the TDD approach:

1. Write failing tests (Red)
2. Implement minimal code to pass (Green)
3. Refactor for quality (Refactor)

All code must include:
- Type hints
- Docstrings (Google style)
- Corresponding tests
- Constitution compliance

## License

This project is developed as part of the GIAIC Q4 Hackathon.

## Author

**Zain UL Abideen** ([@Zain-Ul-Abideen00](https://github.com/Zain-Ul-Abideen00))

---

*Generated with [Claude Code](https://claude.ai/code)*
