"""Tag management API routes.

- POST /{user_id}/tags - Create tag
- GET /{user_id}/tags - List tags
- PATCH /{user_id}/tags/{tag_id} - Update tag
- DELETE /{user_id}/tags/{tag_id} - Delete tag
"""

from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Path, Request, status

from src.api.deps import DBSession, get_current_user, limiter, validate_user_access
from src.models.tag import Tag, TagCreate, TagUpdate
from src.services import tag_service

router = APIRouter(tags=["Tags"])


@router.post(
    "/{user_id}/tags",
    response_model=Tag,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new tag",
)
@limiter.limit("50/minute")
async def create_tag(
    request: Request,
    user_id: Annotated[str, Path(description="User ID")],
    tag_data: TagCreate,
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> Tag:
    """Create a new tag for the user."""
    validate_user_access(user_id, current_user)
    return await tag_service.create_tag(session, tag_data, user_id)


@router.get(
    "/{user_id}/tags",
    response_model=List[Tag],
    summary="List all tags",
)
@limiter.limit("100/minute")
async def list_tags(
    request: Request,
    user_id: Annotated[str, Path(description="User ID")],
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> List[Tag]:
    """Retrieve all tags for the user."""
    validate_user_access(user_id, current_user)
    return await tag_service.list_tags(session, user_id)


@router.patch(
    "/{user_id}/tags/{tag_id}",
    response_model=Tag,
    summary="Update a tag",
)
@limiter.limit("50/minute")
async def update_tag(
    request: Request,
    user_id: Annotated[str, Path(description="User ID")],
    tag_id: Annotated[int, Path(description="Tag ID")],
    tag_data: TagUpdate,
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> Tag:
    """Update a tag's name or color."""
    validate_user_access(user_id, current_user)
    tag = await tag_service.update_tag(session, tag_id, tag_data, user_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.delete(
    "/{user_id}/tags/{tag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a tag",
)
@limiter.limit("50/minute")
async def delete_tag(
    request: Request,
    user_id: Annotated[str, Path(description="User ID")],
    tag_id: Annotated[int, Path(description="Tag ID")],
    session: DBSession,
    current_user: Annotated[dict, Depends(get_current_user)],
) -> None:
    """Delete a tag."""
    validate_user_access(user_id, current_user)
    deleted = await tag_service.delete_tag(session, tag_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Tag not found")
