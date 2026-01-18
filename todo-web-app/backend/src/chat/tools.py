"""
MCP Tools for Task Management.

These tools wrap existing task_service functions to provide
natural language task management via the AI agent.

Reference: .agent/skills/mcp-builder/SKILL.md
"""

from typing import Literal

from agents import function_tool, RunContextWrapper
from chatkit.agents import AgentContext
from sqlmodel.ext.asyncio.session import AsyncSession

from src.models import TaskCreate, TaskUpdate
from src.services import task_service


def _extract_context(ctx: RunContextWrapper) -> tuple[str | None, AsyncSession | None]:
    """Extract user_id and session from RunContextWrapper.

    Handles both AgentContext (via request_context) and raw dict contexts.
    """
    context = ctx.context

    # Debug logging
    print(f"[TOOL DEBUG] ctx.context type: {type(context)}")

    # If context is AgentContext, access request_context
    if hasattr(context, 'request_context'):
        print("[TOOL DEBUG] Found AgentContext, using request_context")
        request_context = context.request_context
        if isinstance(request_context, dict):
            user_id = request_context.get("user_id")
            session = request_context.get("session")
            print(f"[TOOL DEBUG] user_id: {user_id}, session: {session is not None}")
            return user_id, session

    # If context is a plain dict (direct usage)
    if isinstance(context, dict):
        print("[TOOL DEBUG] Found dict context directly")
        user_id = context.get("user_id")
        session = context.get("session")
        print(f"[TOOL DEBUG] user_id: {user_id}, session: {session is not None}")
        return user_id, session

    print(f"[TOOL DEBUG] Unknown context type: {type(context)}")
    return None, None


@function_tool
async def add_task(
    ctx: RunContextWrapper,
    title: str,
    description: str = "",
) -> dict:
    """Create a new task for the user.

    Args:
        title: Task title (required)
        description: Optional task description
    """
    print(f"[TOOL] add_task called with title='{title}'")

    user_id, session = _extract_context(ctx)

    if not user_id:
        print("[TOOL] ERROR: No user_id found")
        return {"error": "Authentication required. Please log in to create tasks."}

    if not session:
        print("[TOOL] ERROR: No session found")
        return {"error": "Database session unavailable. Please try again."}

    try:
        task_data = TaskCreate(title=title, description=description or None)
        task = await task_service.create_task(session, task_data, user_id)
        print(f"[TOOL] SUCCESS: Created task id={task.id}, title='{task.title}'")
        return {
            "task_id": task.id,
            "status": "created",
            "title": task.title,
            "message": f"Created task: {task.title}",
        }
    except Exception as e:
        print(f"[TOOL] EXCEPTION: {e}")
        return {"error": f"Failed to create task: {str(e)}"}


@function_tool
async def list_tasks(
    ctx: RunContextWrapper,
    status: Literal["all", "pending", "completed"] = "all",
) -> dict:
    """List user's tasks with optional filtering.

    Args:
        status: Filter by status - "all", "pending", or "completed"
    """
    print(f"[TOOL] list_tasks called with status='{status}'")

    user_id, session = _extract_context(ctx)

    if not user_id:
        return {"error": "Authentication required. Please log in to view tasks."}

    if not session:
        return {"error": "Database session unavailable. Please try again."}

    try:
        # Map status to completed filter
        completed = None
        if status == "pending":
            completed = False
        elif status == "completed":
            completed = True

        tasks = await task_service.list_tasks_by_user(session, user_id, completed)
        return {
            "tasks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "completed": t.completed,
                    "priority": t.priority,
                }
                for t in tasks
            ],
            "count": len(tasks),
            "filter": status,
        }
    except Exception as e:
        return {"error": f"Failed to list tasks: {str(e)}"}


@function_tool
async def complete_task(
    ctx: RunContextWrapper,
    task_id: int,
) -> dict:
    """Mark a task as completed or toggle its completion status.

    Args:
        task_id: ID of the task to complete
    """
    print(f"[TOOL] complete_task called with task_id={task_id}")

    user_id, session = _extract_context(ctx)

    if not user_id:
        return {"error": "Authentication required. Please log in to complete tasks."}

    if not session:
        return {"error": "Database session unavailable. Please try again."}

    try:
        task = await task_service.toggle_task_completion(session, task_id, user_id)
        if not task:
            return {"error": f"Task {task_id} not found or you don't have permission."}

        status = "completed" if task.completed else "uncompleted"
        return {
            "task_id": task.id,
            "status": status,
            "title": task.title,
            "message": f"Task '{task.title}' marked as {status}.",
        }
    except Exception as e:
        return {"error": f"Failed to complete task: {str(e)}"}


@function_tool
async def delete_task(
    ctx: RunContextWrapper,
    task_id: int,
) -> dict:
    """Delete a task permanently.

    Args:
        task_id: ID of the task to delete
    """
    print(f"[TOOL] delete_task called with task_id={task_id}")

    user_id, session = _extract_context(ctx)

    if not user_id:
        return {"error": "Authentication required. Please log in to delete tasks."}

    if not session:
        return {"error": "Database session unavailable. Please try again."}

    try:
        # Get task title before deletion
        task = await task_service.get_task(session, task_id, user_id)
        if not task:
            return {"error": f"Task {task_id} not found or you don't have permission."}

        title = task.title
        deleted = await task_service.delete_task(session, task_id, user_id)
        if not deleted:
            return {"error": f"Failed to delete task {task_id}."}

        return {
            "task_id": task_id,
            "status": "deleted",
            "title": title,
            "message": f"Task '{title}' has been deleted.",
        }
    except Exception as e:
        return {"error": f"Failed to delete task: {str(e)}"}


@function_tool
async def update_task(
    ctx: RunContextWrapper,
    task_id: int,
    title: str | None = None,
    description: str | None = None,
) -> dict:
    """Update a task's title or description.

    Args:
        task_id: ID of the task to update
        title: New title (optional)
        description: New description (optional)
    """
    print(f"[TOOL] update_task called with task_id={task_id}")

    user_id, session = _extract_context(ctx)

    if not user_id:
        return {"error": "Authentication required. Please log in to update tasks."}

    if not session:
        return {"error": "Database session unavailable. Please try again."}

    if not title and not description:
        return {"error": "Please provide at least a title or description to update."}

    try:
        update_data = TaskUpdate()
        if title:
            update_data.title = title
        if description:
            update_data.description = description

        task = await task_service.update_task(session, task_id, update_data, user_id)
        if not task:
            return {"error": f"Task {task_id} not found or you don't have permission."}

        return {
            "task_id": task.id,
            "status": "updated",
            "title": task.title,
            "message": f"Task updated: {task.title}",
        }
    except Exception as e:
        return {"error": f"Failed to update task: {str(e)}"}


# Export all tools for agent registration
ALL_TOOLS = [add_task, list_tasks, complete_task, delete_task, update_task]
