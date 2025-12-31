
# todo-console-app/src/tui.py
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer, ListView, ListItem, Label, Input, Button
from textual.containers import Container, Grid, Horizontal
from textual.screen import ModalScreen
from .store import JSONTaskStore
from .models import TaskStatus, Task

class TaskModal(ModalScreen):
    CSS = """
    TaskModal {
        align: center middle;
    }
    #dialog {
        grid-size: 2;
        grid-gutter: 1 2;
        grid-rows: auto;
        padding: 1 2;
        width: 60;
        height: auto;
        border: thick $background;
        background: $surface;
    }
    """

    def __init__(self, initial_data: dict = None, **kwargs):
        super().__init__(**kwargs)
        self.initial_data = initial_data or {}

    def compose(self) -> ComposeResult:
        title = self.initial_data.get("title", "")
        desc = self.initial_data.get("description", "")
        yield Grid(
            Label("Title:", classes="label"),
            Input(value=title, placeholder="Task title", id="title-input"),
            Label("Description:", classes="label"),
            Input(value=desc, placeholder="Optional description", id="desc-input"),
            Button("Save", variant="primary", id="save-btn"),
            Button("Cancel", variant="error", id="cancel-btn"),
            id="dialog"
        )

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "save-btn":
            title = self.query_one("#title-input", Input).value
            desc = self.query_one("#desc-input", Input).value
            if title.strip():
                self.dismiss({"title": title, "description": desc})
        elif event.button.id == "cancel-btn":
            self.dismiss(None)

class ConfirmModal(ModalScreen[bool]):
    CSS = """
    ConfirmModal {
        align: center middle;
    }
    #confirm-dialog {
        grid-size: 2;
        grid-gutter: 1 2;
        padding: 1 2;
        width: 40;
        height: auto;
        border: thick $background;
        background: $surface;
    }
    """
    def compose(self) -> ComposeResult:
        yield Grid(
            Label("Are you sure?", classes="label", id="question"),
            Button("Yes", variant="error", id="confirm-btn"),
            Button("No", variant="primary", id="cancel-btn"),
            id="confirm-dialog"
        )
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "confirm-btn":
            self.dismiss(True)
        else:
            self.dismiss(False)

class TaskItem(ListItem):
    def __init__(self, task):
        super().__init__()
        self.todo_task = task

    def compose(self) -> ComposeResult:
        status_icon = "✅" if self.todo_task.status == TaskStatus.COMPLETED else "⭕"
        yield Label(f"{status_icon} {self.todo_task.title}")

class TodoApp(App):
    TITLE = "Todo App"
    BINDINGS = [
        ("q", "quit", "Quit"),
        ("a", "add_task", "Add Task"),
        ("d", "delete_task", "Delete"),
        ("c", "toggle_status", "Complete"),
        ("e", "edit_task", "Edit"),
    ]

    def __init__(self, store_path="tasks.json", **kwargs):
        super().__init__(**kwargs)
        self.store_path = store_path
        self.current_filter = "all"

    def action_add_task(self) -> None:
        def check_add(result: dict | None) -> None:
            if result:
                new_task = Task(title=result["title"], description=result["description"])
                tasks = self.store.load()
                tasks.append(new_task)
                self.store.save(tasks)
                self.load_tasks()

        self.push_screen(TaskModal(), check_add)

    def action_delete_task(self) -> None:
        list_view = self.query_one("#task-list", ListView)
        if list_view.index is not None and list_view.children:
            item = list_view.children[list_view.index]
            task = item.todo_task
            def confirm(should_delete: bool) -> None:
                if should_delete:
                    tasks = self.store.load()
                    tasks = [t for t in tasks if t.id != task.id]
                    self.store.save(tasks)
                    self.load_tasks()
            self.push_screen(ConfirmModal(), confirm)

    def action_toggle_status(self) -> None:
        list_view = self.query_one("#task-list", ListView)
        if list_view.index is not None and list_view.children:
             item = list_view.children[list_view.index]
             task = item.todo_task
             tasks = self.store.load()
             for t in tasks:
                 if t.id == task.id:
                     t.status = TaskStatus.COMPLETED if t.status == TaskStatus.PENDING else TaskStatus.PENDING
                     break
             self.store.save(tasks)
             self.load_tasks()

    def action_edit_task(self) -> None:
        list_view = self.query_one("#task-list", ListView)
        if list_view.index is not None and list_view.children:
            item = list_view.children[list_view.index]
            task = item.todo_task

            def check_edit(result: dict | None) -> None:
                if result:
                    tasks = self.store.load()
                    for t in tasks:
                         if t.id == task.id:
                             t.title = result["title"]
                             t.description = result["description"]
                             break
                    self.store.save(tasks)
                    self.load_tasks()

            initial_data = {"title": task.title, "description": task.description}
            self.push_screen(TaskModal(initial_data=initial_data), check_edit)

    def compose(self) -> ComposeResult:
        yield Header()
        yield Container(
            Horizontal(
                Button("All", id="tab-all", variant="primary"),
                Button("Pending", id="tab-pending", variant="default"),
                Button("Completed", id="tab-completed", variant="default"),
                classes="tabs",
                id="filter-tabs"
            ),
            ListView(id="task-list"),
            Label("No tasks found", id="empty-state"),
            id="main-container"
        )
        yield Footer()

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id and event.button.id.startswith("tab-"):
            self.current_filter = event.button.id.split("-")[1]
            for btn_id in ["tab-all", "tab-pending", "tab-completed"]:
                btn = self.query_one(f"#{btn_id}", Button)
                btn.variant = "primary" if self.current_filter in btn_id else "default"
            self.load_tasks()

    def on_mount(self) -> None:
        self.store = JSONTaskStore(self.store_path)
        self.load_tasks()
        self.query_one("#task-list").focus()

    def load_tasks(self) -> None:
        try:
            all_tasks = self.store.load()
        except Exception as e:
            print(f"Error loading tasks: {e}")
            all_tasks = []
        # Sort logic: Pending first, then date
        all_tasks.sort(key=lambda t: t.created_at)
        all_tasks.sort(key=lambda t: t.status == TaskStatus.COMPLETED)

        if self.current_filter == "pending":
            tasks = [t for t in all_tasks if t.status == TaskStatus.PENDING]
        elif self.current_filter == "completed":
            tasks = [t for t in all_tasks if t.status == TaskStatus.COMPLETED]
        else:
            tasks = all_tasks

        list_view = self.query_one("#task-list")
        empty_state = self.query_one("#empty-state")

        list_view.clear()

        if not tasks:
            empty_state.display = True
            list_view.display = False
        else:
            empty_state.display = False
            list_view.display = True
            for task in tasks:
                list_view.append(TaskItem(task))
