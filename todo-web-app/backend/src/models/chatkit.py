"""
ChatKit persistence models for storing conversation threads and items.

These SQLModel entities enable persistent storage of ChatKit conversations
in PostgreSQL with proper user isolation and cascade delete behavior.
"""

from datetime import datetime, timezone

from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel, AutoString


class ChatKitThread(SQLModel, table=True):
    """
    Chat conversation thread.

    Stores thread metadata including user ownership and title.
    Threads are isolated per user - each user can only access their own threads.
    """

    __tablename__ = "chatkit_threads"

    id: str = Field(primary_key=True)
    user_id: str | None = Field(default=None, index=True)  # Nullable for anonymous
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    metadata_: dict = Field(
        default={},
        sa_column=Column("metadata", JSONB, default={}),
    )


class ChatKitItem(SQLModel, table=True):
    """
    Message or event in a chat thread.

    Stores individual messages, tool calls, and responses within a thread.
    Items are deleted when their parent thread is deleted (cascade).
    """

    __tablename__ = "chatkit_items"

    id: str = Field(primary_key=True)
    thread_id: str = Field(sa_column=Column(AutoString(), ForeignKey("chatkit_threads.id", ondelete="CASCADE"), index=True, nullable=False))
    type: str  # "message", "tool_call", "tool_result"
    content: dict = Field(default={}, sa_column=Column(JSONB, default={}))
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )


__all__ = ["ChatKitThread", "ChatKitItem"]
