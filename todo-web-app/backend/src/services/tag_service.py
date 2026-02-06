"""Tag CRUD service for Todo Web Application.

Provides async functions for tag persistence and user isolation.
"""

from datetime import UTC, datetime

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.models.tag import Tag, TagCreate, TagUpdate


def utc_now() -> datetime:
    """Return current UTC datetime as naive datetime for PostgreSQL compatibility."""
    return datetime.now(UTC).replace(tzinfo=None)


async def create_tag(
    session: AsyncSession,
    tag_data: TagCreate,
    user_id: str,
) -> Tag:
    """Create a new tag for a user."""
    tag = Tag(
        user_id=user_id,
        name=tag_data.name,
        color=tag_data.color,
    )
    session.add(tag)
    await session.commit()
    await session.refresh(tag)
    return tag


async def get_tag(
    session: AsyncSession,
    tag_id: int,
    user_id: str,
) -> Tag | None:
    """Get a tag by ID, enforcing user ownership."""
    statement = select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
    result = await session.exec(statement)
    return result.first()


async def update_tag(
    session: AsyncSession, tag_id: int, tag_update: TagUpdate, user_id: str
) -> Tag | None:
    """Update a tag belonging to a specific user."""
    tag = await get_tag(session, tag_id, user_id)
    if not tag:
        return None

    update_data = tag_update.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(tag, key, value)

    session.add(tag)
    await session.commit()
    await session.refresh(tag)

    return tag


async def delete_tag(
    session: AsyncSession,
    tag_id: int,
    user_id: str,
) -> bool:
    """Delete a tag, enforcing user ownership."""
    tag = await get_tag(session, tag_id, user_id)
    if not tag:
        return False

    await session.delete(tag)
    await session.commit()
    return True


async def list_tags(
    session: AsyncSession,
    user_id: str,
) -> list[Tag]:
    """List all tags for a user."""
    statement = select(Tag).where(Tag.user_id == user_id).order_by(Tag.name)
    result = await session.exec(statement)
    return list(result.all())
