# Research Findings: Todo TUI App

## 1. Pydantic V2 JSON Serialization
**Decision**: Use `model.model_dump_json()` for serialization and `Model.model_validate_json(json_data)` for deserialization.
**Rationale**: These are the native (Rust-backed) methods in Pydantic V2, offering superior performance over `model.dict()` or `json.dumps()`.
**Alternatives**:
- `model.json()` (Deprecated in V2).
- `adapter.validate_json()` (Overkill for simple models).

## 2. Textual Testing Strategy
**Decision**: Use `async with app.run_test() as pilot:` pattern.
**Rationale**: `run_test()` creates a headless version of the app and returns a `Pilot` object that can simulate key presses (`pilot.press("a")`) and inspect the DOM (`app.query_one(...)`). This is the standard documented approach for integration testing Textual apps.
**Alternatives**:
- `bypassing UI`: Test logic only (Done via `store.py` tests).
- `snapshot testing`: `pytest-textual-snapshot` (Good for visual regression, but brittle for behavior).

## 3. Atomic File Writes (Windows Friendly)
**Decision**: Use `tempfile.NamedTemporaryFile(delete=False)` + `os.replace`.
**Rationale**:
- Windows does not support `os.replace` across different drives or if the file is open.
- `delete=False` is required on Windows to close the file handle before renaming.
- `os.replace` is atomic on POSIX and modern Windows (renames over existing files).
**Code Pattern**:
```python
import tempfile, os

def save_atomic(path, content):
    dir_name = os.path.dirname(path)
    # Create temp file in same dir to ensure same filesystem (key for atomic rename)
    with tempfile.NamedTemporaryFile("w", dir=dir_name, delete=False, encoding="utf-8") as tmp:
        tmp.write(content)
        temp_path = tmp.name
    try:
        os.replace(temp_path, path)
    except OSError:
        os.remove(temp_path)
        raise
```
