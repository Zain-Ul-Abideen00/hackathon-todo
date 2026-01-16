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
        Query(alias="status", description="Filter: all, pending, completed"),
    ] = "all",
    sort: Annotated[
        str | None,
        Query(description="Sort by: created (default), title"),
    ] = "created",
    cursor: Annotated[str | None, Query(description="Pagination cursor")] = None,
    limit: Annotated[int, Query(ge=1, le=100, description="Items per page")] = 20,
) -> TaskListResponse:
    """Retrieve paginated list of tasks with optional filtering and sorting.

    - **status**: Filter by completion status (all, pending, completed)
    - **sort**: Sort by created (newest first) or title (alphabetical)
    - **cursor**: Pagination cursor from previous response
    - **limit**: Items per page (1-100, default 20)
    """
    validate_user_access(user_id, current_user)

    # Convert status filter to completed boolean
    completed = None
    if status_filter == "pending":
        completed = False
    elif status_filter == "completed":
        completed = True
    # else "all" -> completed = None

    result = await task_service.list_tasks_paginated(
        session,
        user_id,
        completed=completed,
        sort_by=sort or "created",
        cursor=cursor,
        limit=limit,
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
