"""Task management API routes.

Implements all task CRUD operations and toggle completion per spec.md:
- POST /{user_id}/tasks - Create task (US1)
- GET /{user_id}/tasks - List tasks with pagination (US2)
- GET /{user_id}/tasks/{task_id} - Get single task (US3)
- PUT /{user_id}/tasks/{task_id} - Update task (US4)
- DELETE /{user_id}/tasks/{task_id} - Delete task (US5)
- PATCH /{user_id}/tasks/{task_id}/complete - Toggle completion (US6)
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request, status

from src.api.deps import DBSession, get_current_user, limiter, validate_user_access
from src.schemas.task import (
    TaskCreate,
    TaskDeleteResponse,
    TaskListResponse,
    TaskResponse,
    TaskUpdate,
)
from src.services import task_service
from src.models.reminder import Reminder, ReminderCreate
from sqlmodel import select

router = APIRouter(tags=["Tasks"])


# --- US1: Create Task ---


@router.post(
    "/{user_id}/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    responses={
        400: {"description": "Validation error"},
        403: {"description": "Forbidden - user_id mismatch"},
    },
)
@limiter.limit("100/minute")
async def create_task(
    request: Request,  # Required for rate limiter
    user_id: Annotated[str, Path(description="User ID")],
    task_data: TaskCreate,
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> TaskResponse:
    """Create a new task for the authenticated user.

    - **title**: Required, 1-200 characters
    - **description**: Optional, max 1000 characters
    """
    validate_user_access(user_id, current_user)

    task = await task_service.create_task(session, task_data, user_id)
    return TaskResponse.model_validate(task)


# --- US2: List Tasks with Filtering ---


@router.get(
    "/{user_id}/tasks/stats",
    status_code=status.HTTP_200_OK,
    summary="Get task statistics",
)
@limiter.limit("50/minute")
async def get_task_stats(
    request: Request,
    user_id: Annotated[str, Path(description="User ID")],
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    """Get aggregated task statistics for the user."""
    validate_user_access(user_id, current_user)
    return await task_service.get_task_stats(session, user_id)


@router.get(
    "/{user_id}/tasks",
    response_model=TaskListResponse,
    summary="List all tasks with filtering and pagination",
    responses={
        403: {"description": "Forbidden - user_id mismatch"},
    },
)
@limiter.limit("100/minute")
async def list_tasks(
    request: Request,  # Required for rate limiter
    user_id: Annotated[str, Path(description="User ID")],
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
    status_filter: Annotated[
        str | None,
        Query(alias="status", description="Filter: all, todo, in_progress, completed, overdue"),
    ] = None,
    priority: Annotated[
        str | None,
        Query(description="Filter by priority: low, medium, high"),
    ] = None,
    search: Annotated[
        str | None,
        Query(description="Search title or description"),
    ] = None,
    tags: Annotated[
        list[int] | None,
        Query(description="Filter by tag IDs"),
    ] = None,
    sort: Annotated[
        str | None,
        Query(description="Sort by: created, title, due_date, priority"),
    ] = "created",
    order: Annotated[
        str | None,
        Query(description="Sort order: asc, desc"),
    ] = "desc",
    cursor: Annotated[str | None, Query(description="Pagination cursor")] = None,
    limit: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 20,
) -> TaskListResponse:
    """Retrieve paginated list of tasks with optional filtering and sorting.

    - **status**: Filter by status (todo, in_progress, completed, overdue)
    - **priority**: Filter by priority (low, medium, high)
    - **tags**: Filter by tag IDs
    - **sort**: Sort field
    - **order**: Sort direction (asc/desc)
    - **search**: Search text
    """
    validate_user_access(user_id, current_user)

    # Clean up status filter if 'all' is passed
    actual_status = None
    if status_filter and status_filter != "all":
        actual_status = status_filter

    result = await task_service.list_tasks_paginated(
        session,
        user_id,
        completed=None,  # Deprecated
        sort_by=sort or "created",
        sort_order=order or "desc",
        cursor=cursor,
        limit=limit,
        status_filter=actual_status,
        priority_filter=priority,
        search=search,
        tag_ids=tags,
    )

    return TaskListResponse(
        tasks=[TaskResponse.model_validate(t) for t in result["tasks"]],
        next_cursor=result["next_cursor"],
        has_more=result["has_more"],
    )


# --- US3: Get Single Task ---


@router.get(
    "/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    summary="Get a single task by ID",
    responses={
        404: {"description": "Task not found"},
        403: {"description": "Forbidden - user_id mismatch"},
    },
)
@limiter.limit("100/minute")
async def get_task(
    request: Request,  # Required for rate limiter
    user_id: Annotated[str, Path(description="User ID")],
    task_id: Annotated[int, Path(description="Task ID")],
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> TaskResponse:
    """Retrieve a specific task by ID.

    Returns 404 if task doesn't exist or belongs to another user (security).
    """
    validate_user_access(user_id, current_user)

    task = await task_service.get_task(session, task_id, user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Task not found"},
        )

    return TaskResponse.model_validate(task)


# --- US4: Update Task ---


@router.put(
    "/{user_id}/tasks/{task_id}",
    response_model=TaskResponse,
    summary="Update a task",
    responses={
        400: {"description": "Validation error"},
        404: {"description": "Task not found"},
        403: {"description": "Forbidden - user_id mismatch"},
    },
)
@limiter.limit("100/minute")
async def update_task(
    request: Request,  # Required for rate limiter
    user_id: Annotated[str, Path(description="User ID")],
    task_id: Annotated[int, Path(description="Task ID")],
    task_data: TaskUpdate,
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> TaskResponse:
    """Update an existing task.

    Supports partial updates - only provided fields are modified.
    """
    validate_user_access(user_id, current_user)

    task = await task_service.update_task(
        session=session, task_id=task_id, task_update=task_data, user_id=user_id
    )
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Task not found"},
        )

    return TaskResponse.model_validate(task)


# --- US5: Delete Task ---


@router.delete(
    "/{user_id}/tasks/{task_id}",
    response_model=TaskDeleteResponse,
    summary="Delete a task",
    responses={
        404: {"description": "Task not found"},
        403: {"description": "Forbidden - user_id mismatch"},
    },
)
@limiter.limit("100/minute")
async def delete_task(
    request: Request,  # Required for rate limiter
    user_id: Annotated[str, Path(description="User ID")],
    task_id: Annotated[int, Path(description="Task ID")],
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> TaskDeleteResponse:
    """Permanently delete a task (hard delete per FR-017)."""
    validate_user_access(user_id, current_user)

    deleted = await task_service.delete_task(session, task_id, user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Task not found"},
        )

    return TaskDeleteResponse(task_id=task_id)


# --- US6: Toggle Task Completion ---


@router.patch(
    "/{user_id}/tasks/{task_id}/complete",
    response_model=TaskResponse,
    summary="Toggle task completion status",
    responses={
        404: {"description": "Task not found"},
        403: {"description": "Forbidden - user_id mismatch"},
    },
)
@limiter.limit("100/minute")
async def toggle_complete(
    request: Request,  # Required for rate limiter
    user_id: Annotated[str, Path(description="User ID")],
    task_id: Annotated[int, Path(description="Task ID")],
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> TaskResponse:
    """Toggle a task's completion status.

    If pending → completed. If completed → pending.
    """
    validate_user_access(user_id, current_user)

    task = await task_service.toggle_task_completion(session, task_id, user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Task not found"},
        )

    return TaskResponse.model_validate(task)


# --- US4/Phase7: Reminders ---


@router.post(
    "/{user_id}/tasks/{task_id}/reminders",
    status_code=status.HTTP_201_CREATED,
    summary="Create a reminder for a task",
    responses={
        404: {"description": "Task not found"},
        403: {"description": "Forbidden"},
    },
)
@limiter.limit("50/minute")
async def create_reminder(
    request: Request,
    user_id: Annotated[str, Path(description="User ID")],
    task_id: Annotated[int, Path(description="Task ID")],
    reminder_data: ReminderCreate,
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> Reminder:
    """Create a new reminder offset for the task."""
    validate_user_access(user_id, current_user)

    # Verify task ownership
    task = await task_service.get_task(session, task_id, user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Task not found"},
        )

    reminder = Reminder(
        task_id=task_id,
        user_id=user_id,
        remind_at=reminder_data.remind_at.replace(tzinfo=None),
        triggered=False,
    )
    session.add(reminder)
    await session.commit()
    await session.refresh(reminder)
    return reminder


@router.get(
    "/{user_id}/tasks/{task_id}/reminders",
    response_model=list[Reminder],
    summary="List reminders for a task",
)
@limiter.limit("100/minute")
async def list_reminders(
    request: Request,
    user_id: Annotated[str, Path(description="User ID")],
    task_id: Annotated[int, Path(description="Task ID")],
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> list[Reminder]:
    """List all reminders associated with a task."""
    validate_user_access(user_id, current_user)

    # Verify task ownership
    task = await task_service.get_task(session, task_id, user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Task not found"},
        )

    stmt = select(Reminder).where(Reminder.task_id == task_id)
    result = await session.exec(stmt)
    return list(result.all())


@router.delete(
    "/{user_id}/tasks/{task_id}/reminders/{reminder_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a reminder",
)
@limiter.limit("50/minute")
async def delete_reminder(
    request: Request,
    user_id: Annotated[str, Path(description="User ID")],
    task_id: Annotated[int, Path(description="Task ID")],
    reminder_id: Annotated[int, Path(description="Reminder ID")],
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Delete a reminder."""
    validate_user_access(user_id, current_user)

    # Verify task ownership implicitly via Reminder query + user_id check matches strict ownership
    stmt = select(Reminder).where(
        Reminder.id == reminder_id, Reminder.task_id == task_id, Reminder.user_id == user_id
    )
    result = await session.exec(stmt)
    reminder = result.first()

    if not reminder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Reminder not found"},
        )

    await session.delete(reminder)
    await session.commit()
    return None
