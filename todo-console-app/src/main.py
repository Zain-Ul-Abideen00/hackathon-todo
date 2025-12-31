
# todo-console-app/src/main.py
from .tui import TodoApp

def main():
    app = TodoApp()
    app.run()

if __name__ == "__main__":
    main()
