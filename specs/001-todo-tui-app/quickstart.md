# Quickstart: Todo TUI App

## Prerequisites

- Python 3.12+
- `uv` installed (`uv --version`)

## Installation

1. **Clone & Enter**:
   ```bash
   git clone <repo-url>
   cd hackathon-todo
   ```

2. **Install Dependencies**:
   ```bash
   uv sync
   ```

## Running the App

```bash
uv run python src/main.py
```

## Running Tests

```bash
uv run pytest
```

## Keyboard Controls

- **Up/Down**: Navigate list
- **a**: Add Task
- **Enter**: Toggle Status (or View Details)
- **c**: Toggle Status (Explicit)
- **d**: Delete Task (w/ Confirmation)
- **e**: Edit Task
- **q**: Quit
