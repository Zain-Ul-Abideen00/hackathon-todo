
# Todo TUI App

A terminal-based Todo application built with Python, [Textual](https://textual.textualize.io/), and Pydantic.

## Features
- **Dashboard**: View tasks with status icons.
- **Add Tasks**: Press `a` to add a new task.
- **Edit Tasks**: Press `e` to edit the selected task.
- **Delete Tasks**: Press `d` to delete (with confirmation).
- **Complete Tasks**: Press `c` to toggle completion status.
- **Filters**: Tab between All, Pending, and Completed views.
- **Persistence**: Data is saved to `tasks.json` automatically.

## Requirements
- Python 3.12+
- `uv` (recommended) or `pip`

## Installation
```bash
# Clone the repository
git clone <repo-url>
cd todo-console-app

# Install dependencies
uv sync
```

## Usage
Run the application:
```bash
uv run python src/main.py
```

## Testing
Run the test suite:
```bash
uv run pytest
```
