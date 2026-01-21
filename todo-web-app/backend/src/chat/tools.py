"""
MCP Tools for Task Management.

These tools wrap existing task_service functions to provide
natural language task management via the AI agent.

IMPORTANT: Each tool creates its own ISOLATED database session
to avoid asyncpg concurrency conflicts with ChatKit store operations.

Reference: .agent/skills/mcp-builder/SKILL.md
"""

from typing import Literal

from agents import function_tool, RunContextWrapper
from chatkit.agents import AgentContext
from chatkit.types import ProgressUpdateEvent
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db.connection import engine
from src.models import TaskCreate, TaskUpdate
from src.services import task_service


def _extract_user_id(ctx: RunContextWrapper) -> str | None:
    """Extract user_id from RunContextWrapper.

    NOTE: We no longer extract session here - each tool creates its own
    isolated session to avoid asyncpg concurrency conflicts.
    """
    context = ctx.context

    # If context is AgentContext, access request_context
    if hasattr(context, 'request_context'):
        request_context = context.request_context
        if isinstance(request_context, dict):
            return request_context.get("user_id")

    # If context is a plain dict (direct usage)
    if isinstance(context, dict):
        return context.get("user_id")

    return None


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
    print(f"[TOOL] add_task starting - creating isolated session")

    # Stream progress update with write icon
    await ctx.context.stream(ProgressUpdateEvent(icon="write", text="Creating task..."))

    user_id = _extract_user_id(ctx)

    if not user_id:
        print("[TOOL] add_task ERROR: No user_id found")
        return {"error": "Authentication required. Please log in to create tasks."}

    try:
        # Create ISOLATED session for this tool operation
        # expire_on_commit=False prevents refresh queries that can cause pool warnings
        async with AsyncSession(engine, expire_on_commit=False) as session:
            print(f"[TOOL] add_task - session created, executing operation")
            task_data = TaskCreate(title=title, description=description or None)
            task = await task_service.create_task(session, task_data, user_id)
            # Note: task_service.create_task commits internally
            print(f"[TOOL] add_task SUCCESS - created task id={task.id}, session closed")
            return {
                "task_id": task.id,
                "status": "created",
                "title": task.title,
                "message": f"Created task: {task.title}",
            }
    except Exception as e:
        print(f"[TOOL] add_task ERROR - {e}, session closed")
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
    print(f"[TOOL] list_tasks starting - creating isolated session")

    # Stream progress update with book-open icon
    await ctx.context.stream(ProgressUpdateEvent(icon="book-open", text="Fetching your tasks..."))

    user_id = _extract_user_id(ctx)

    if not user_id:
        print("[TOOL] list_tasks ERROR: No user_id found")
        return {"error": "Authentication required. Please log in to view tasks."}

    try:
        # Create ISOLATED session for this tool operation
        # expire_on_commit=False prevents refresh queries that can cause pool warnings
        async with AsyncSession(engine, expire_on_commit=False) as session:
            print(f"[TOOL] list_tasks - session created, executing operation")
            # Map status to completed filter
            completed = None
            if status == "pending":
                completed = False
            elif status == "completed":
                completed = True

            tasks = await task_service.list_tasks_by_user(session, user_id, completed)
            print(f"[TOOL] list_tasks SUCCESS - found {len(tasks)} tasks, session closed")
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
        print(f"[TOOL] list_tasks ERROR - {e}, session closed")
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
    print(f"[TOOL] complete_task starting - creating isolated session")

    # Stream progress update with check icon
    await ctx.context.stream(ProgressUpdateEvent(icon="check", text="Marking task complete..."))

    user_id = _extract_user_id(ctx)

    if not user_id:
        print("[TOOL] complete_task ERROR: No user_id found")
        return {"error": "Authentication required. Please log in to complete tasks."}

    try:
        # Create ISOLATED session for this tool operation
        # expire_on_commit=False prevents refresh queries that can cause pool warnings
        async with AsyncSession(engine, expire_on_commit=False) as session:
            print(f"[TOOL] complete_task - session created, executing operation")
            task = await task_service.toggle_task_completion(session, task_id, user_id)
            if not task:
                print(f"[TOOL] complete_task ERROR - task {task_id} not found, session closed")
                return {"error": f"Task {task_id} not found or you don't have permission."}

            # Note: task_service.toggle_task_completion commits internally
            status = "completed" if task.completed else "uncompleted"
            print(f"[TOOL] complete_task SUCCESS - task {task_id} marked {status}, session closed")
            return {
                "task_id": task.id,
                "status": status,
                "title": task.title,
                "message": f"Task '{task.title}' marked as {status}.",
            }
    except Exception as e:
        print(f"[TOOL] complete_task ERROR - {e}, session closed")
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
    print(f"[TOOL] delete_task starting - creating isolated session")

    # Stream progress update with atom icon
    await ctx.context.stream(ProgressUpdateEvent(icon="atom", text="Deleting task..."))

    user_id = _extract_user_id(ctx)

    if not user_id:
        print("[TOOL] delete_task ERROR: No user_id found")
        return {"error": "Authentication required. Please log in to delete tasks."}

    try:
        # Create ISOLATED session for this tool operation
        # expire_on_commit=False prevents refresh queries that can cause pool warnings
        async with AsyncSession(engine, expire_on_commit=False) as session:
            print(f"[TOOL] delete_task - session created, executing operation")
            # Get task title before deletion
            task = await task_service.get_task(session, task_id, user_id)
            if not task:
                print(f"[TOOL] delete_task ERROR - task {task_id} not found, session closed")
                return {"error": f"Task {task_id} not found or you don't have permission."}

            title = task.title
            deleted = await task_service.delete_task(session, task_id, user_id)
            if not deleted:
                print(f"[TOOL] delete_task ERROR - failed to delete task {task_id}, session closed")
                return {"error": f"Failed to delete task {task_id}."}

            # Note: task_service.delete_task commits internally
            print(f"[TOOL] delete_task SUCCESS - deleted task '{title}', session closed")
            return {
                "task_id": task_id,
                "status": "deleted",
                "title": title,
                "message": f"Task '{title}' has been deleted.",
            }
    except Exception as e:
        print(f"[TOOL] delete_task ERROR - {e}, session closed")
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
    print(f"[TOOL] update_task starting - creating isolated session")

    # Stream progress update with notebook-pencil icon
    await ctx.context.stream(ProgressUpdateEvent(icon="notebook-pencil", text="Updating task..."))

    user_id = _extract_user_id(ctx)

    if not user_id:
        print("[TOOL] update_task ERROR: No user_id found")
        return {"error": "Authentication required. Please log in to update tasks."}

    if not title and not description:
        print("[TOOL] update_task ERROR: No fields to update")
        return {"error": "Please provide at least a title or description to update."}

    try:
        # Create ISOLATED session for this tool operation
        # expire_on_commit=False prevents refresh queries that can cause pool warnings
        async with AsyncSession(engine, expire_on_commit=False) as session:
            print(f"[TOOL] update_task - session created, executing operation")
            update_data = TaskUpdate()
            if title:
                update_data.title = title
            if description:
                update_data.description = description

            task = await task_service.update_task(session, task_id, update_data, user_id)
            if not task:
                print(f"[TOOL] update_task ERROR - task {task_id} not found, session closed")
                return {"error": f"Task {task_id} not found or you don't have permission."}

            # Note: task_service.update_task commits internally
            print(f"[TOOL] update_task SUCCESS - updated task '{task.title}', session closed")
            return {
                "task_id": task.id,
                "status": "updated",
                "title": task.title,
                "message": f"Task updated: {task.title}",
            }
    except Exception as e:
        print(f"[TOOL] update_task ERROR - {e}, session closed")
        return {"error": f"Failed to update task: {str(e)}"}


# Export all tools for agent registration
ALL_TOOLS = [add_task, list_tasks, complete_task, delete_task, update_task]
