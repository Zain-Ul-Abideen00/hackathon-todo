from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Path, Query, Request, status
from src.api.deps import DBSession, get_current_user, validate_user_access
from src.schemas.notification import NotificationResponse, NotificationListResponse
from src.models.notification import NotificationCreate
from src.services import notification_service

router = APIRouter(tags=["Notifications"])

@router.get(
    "/{user_id}/notifications",
    response_model=NotificationListResponse,
    summary="List notifications",
)
async def list_notifications(
    user_id: Annotated[str, Path(description="User ID")],
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
    unread_only: bool = False,
    limit: int = 50,
) -> NotificationListResponse:
    """List notifications for the user."""
    validate_user_access(user_id, current_user)
    return await notification_service.list_notifications(session, user_id, limit, unread_only)

@router.post(
    "/{user_id}/notifications",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create notification (Debug/Admin)",
)
async def create_notification(
    user_id: Annotated[str, Path(description="User ID")],
    data: NotificationCreate,
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> NotificationResponse:
    """Create a notification manually."""
    validate_user_access(user_id, current_user)
    return await notification_service.create_notification(
        session, user_id, data.title, data.message, data.task_id
    )

@router.patch(
    "/{user_id}/notifications/{notification_id}/read",
    response_model=NotificationResponse,
    summary="Mark notification as read",
)
async def mark_read(
    user_id: Annotated[str, Path(description="User ID")],
    notification_id: int,
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> NotificationResponse:
    """Mark a specific notification as read."""
    validate_user_access(user_id, current_user)
    notification = await notification_service.mark_as_read(session, notification_id, user_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    return notification

@router.patch(
    "/{user_id}/notifications/read-all",
    summary="Mark all notifications as read",
)
async def mark_all_read(
    user_id: Annotated[str, Path(description="User ID")],
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    """Mark all notifications as read."""
    validate_user_access(user_id, current_user)
    count = await notification_service.mark_all_as_read(session, user_id)
    return {"updated_count": count}

@router.delete(
    "/{user_id}/notifications/{notification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete notification",
)
async def delete_notification(
    user_id: Annotated[str, Path(description="User ID")],
    notification_id: int,
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
):
    """Delete a notification."""
    validate_user_access(user_id, current_user)
    success = await notification_service.delete_notification(session, notification_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return None
