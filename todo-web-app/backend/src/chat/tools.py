"""
MCP Tools for Task Management.

These tools wrap existing task_service functions to provide
natural language task management via the AI agent.

Reference: .agent/skills/mcp-builder/SKILL.md
"""

from typing import Literal

from agents import function_tool, RunContextWrapper
from sqlmodel.ext.asyncio.session import AsyncSession

from src.models import TaskCreate, TaskUpdate
from src.services import task_service


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
    user_id = ctx.context.get("user_id")
    session: AsyncSession = ctx.context.get("session")

    if not user_id:
        return {"error": "Authentication required. Please log in to create tasks."}

    if not session:
        return {"error": "Database session unavailable. Please try again."}

    try:
        task_data = TaskCreate(title=title, description=description or None)
        task = await task_service.create_task(session, task_data, user_id)
        return {
            "task_id": task.id,
            "status": "created",
            "title": task.title,
            "message": f"Created task: {task.title}",
        }
    except Exception as e:
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
    user_id = ctx.context.get("user_id")
    session: AsyncSession = ctx.context.get("session")

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
    user_id = ctx.context.get("user_id")
    session: AsyncSession = ctx.context.get("session")

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
    user_id = ctx.context.get("user_id")
    session: AsyncSession = ctx.context.get("session")

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
    user_id = ctx.context.get("user_id")
    session: AsyncSession = ctx.context.get("session")

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
