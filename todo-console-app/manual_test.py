
import asyncio
from src.tui import TodoApp
from src.models import Task

async def run_verify():
    app = TodoApp(store_path="verify_tasks.json")
    async with app.run_test() as pilot:
        # Test Add Modal
        await pilot.press("a")
        await pilot.pause(0.5)

        print(f"Current Screen: {type(app.screen).__name__}")
        if type(app.screen).__name__ == "TaskModal":
            print("SUCCESS: TaskModal opened")
        else:
            print("FAILURE: TaskModal did not open")
            print(f"Stack: {app.screen_stack}")

        # Close it
        await pilot.press("escape")
        # (Assuming Modal can be closed or cancel button)
        # We didn't implement Escape to close, so click cancel
        await pilot.click("#cancel-btn")
        await pilot.pause(0.2)

        # Test Delete Modal (Requires item)
        # Seed item
        app.store.save([Task(title="Delete Me")])
        app.load_tasks()
        await pilot.pause(0.1)

        # Focus list and select first item
        lv = app.query_one("#task-list")
        lv.focus()
        lv.index = 0
        await pilot.press("d")
        await pilot.pause(0.5)

        print(f"Current Screen (Delete): {type(app.screen).__name__}")
        if type(app.screen).__name__ == "ConfirmModal":
             print("SUCCESS: ConfirmModal opened")
        else:
             print("FAILURE: ConfirmModal did not open")

if __name__ == "__main__":
    asyncio.run(run_verify())
