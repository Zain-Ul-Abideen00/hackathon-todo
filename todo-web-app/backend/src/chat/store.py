"""
Chat Thread Store for persistence.

Module 1 uses in-memory store for simplicity.
Module 3 will implement PostgresStore for database persistence.

Reference: .agent/skills/integrating-chatkit/references/backend-patterns.md
"""

from datetime import datetime, timezone
from typing import Any
from chatkit.store import Store, Page
from chatkit.types import ThreadMetadata, ThreadItem
from pydantic import BaseModel, TypeAdapter


def serialize_content(content: Any) -> Any:
    """Serialize Pydantic objects to JSON-compatible format.

    ChatKit item.content may contain Pydantic models like UserMessageTextContent.
    These need to be converted to dicts before storing in JSONB columns.
    """
    if content is None:
        return None
    if isinstance(content, BaseModel):
        return content.model_dump(mode="json")
    if isinstance(content, list):
        return [serialize_content(item) for item in content]
    if isinstance(content, dict):
        return {k: serialize_content(v) for k, v in content.items()}
    return content


class InMemoryStore(Store[dict]):
    """
    Simple in-memory store for ChatKit threads.

    For Module 1 MVP - will be replaced with PostgresStore in Module 3.
    """

    def __init__(self):
        self._threads: dict[str, ThreadMetadata] = {}
        self._items: dict[str, list[ThreadItem]] = {}
        self._attachments: dict[str, bytes] = {}

    async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata:
        """Load or create a thread."""
        if thread_id in self._threads:
            return self._threads[thread_id]

        # Create new thread
        user_id = context.get("user_id") or "anonymous"
        created_at = datetime.now(timezone.utc)
        metadata = {"user_id": user_id}

        thread = ThreadMetadata(
            id=thread_id,
            created_at=created_at,
            metadata=metadata,
        )
        self._threads[thread_id] = thread
        self._items[thread_id] = []
        return thread

    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
        """Save thread metadata."""
        self._threads[thread.id] = thread

    async def delete_thread(self, thread_id: str, context: dict) -> bool:
        """Delete a thread and its items."""
        if thread_id in self._threads:
            del self._threads[thread_id]
            self._items.pop(thread_id, None)
            return True
        return False

    async def load_threads(
        self,
        after: str | None,
        limit: int,
        order: str,
        context: dict,
    ) -> Page[ThreadMetadata]:
        """List threads for the current user."""
        user_id = context.get("user_id") or "anonymous"
        user_threads = [
            t for t in self._threads.values()
            if t.metadata.get("user_id") == user_id
        ]

        # Sort by created_at
        sorted_threads = sorted(
            user_threads,
            key=lambda t: t.created_at,
            reverse=(order == "desc"),
        )

        # Simple pagination
        start = 0
        if after:
            for i, t in enumerate(sorted_threads):
                if t.id == after:
                    start = i + 1
                    break

        page_items = sorted_threads[start:start + limit]
        has_more = len(sorted_threads) > start + limit

        return Page(
            data=page_items,
            has_more=has_more,
        )

    async def load_thread_items(
        self,
        thread_id: str,
        after: str | None,
        limit: int,
        order: str,
        context: dict,
    ) -> Page[ThreadItem]:
        """Load items for a thread."""
        items = self._items.get(thread_id, [])

        # Sort by created_at if available
        sorted_items = items.copy()

        # Simple pagination
        start = 0
        if after:
            for i, item in enumerate(sorted_items):
                if item.id == after:
                    start = i + 1
                    break

        page_items = sorted_items[start:start + limit]
        has_more = len(sorted_items) > start + limit

        return Page(
            data=page_items,
            has_more=has_more,
        )

    async def load_item(self, item_id: str, context: dict) -> ThreadItem | None:
        """Load a specific item."""
        for items in self._items.values():
            for item in items:
                if item.id == item_id:
                    return item
        return None

    async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
        """Save an item to a thread."""
        if thread_id not in self._items:
            self._items[thread_id] = []
        self._items[thread_id].append(item)

    async def add_thread_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
        """Add an item to a thread."""
        await self.save_item(thread_id, item, context)

    async def delete_thread_item(self, item_id: str, context: dict) -> bool:
        """Delete a specific item."""
        for thread_id, items in self._items.items():
            for i, item in enumerate(items):
                if item.id == item_id:
                    del items[i]
                    return True
        return False

    async def save_attachment(
        self, attachment_id: str, data: bytes, context: dict
    ) -> None:
        """Save an attachment."""
        self._attachments[attachment_id] = data

    async def load_attachment(self, attachment_id: str, context: dict) -> bytes | None:
        """Load an attachment."""
        return self._attachments.get(attachment_id)

    async def delete_attachment(self, attachment_id: str, context: dict) -> bool:
        """Delete an attachment."""
        if attachment_id in self._attachments:
            del self._attachments[attachment_id]
            return True


# Create singleton store instance
chat_store = InMemoryStore()


# PostgreSQL Store Implementation
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, col
from src.models.chatkit import ChatKitThread, ChatKitItem


class PostgresStore(Store[dict]):
    """
    PostgreSQL-backed store for ChatKit threads using SQLModel.

    Implements all required abstract methods from the Store protocol.
    """

    def __init__(self, session: AsyncSession):
        self._session = session

    async def _get_thread_model(self, thread_id: str, context: dict) -> ChatKitThread | None:
        """Helper to get thread model enforcing user isolation."""
        user_id = context.get("user_id")
        statement = select(ChatKitThread).where(ChatKitThread.id == thread_id)

        # Enforce user isolation
        if user_id:
            statement = statement.where(ChatKitThread.user_id == user_id)
        else:
            statement = statement.where(ChatKitThread.user_id == None)  # noqa: E711

        result = await self._session.exec(statement)
        return result.first()

    async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata:
        """Load or create a thread."""
        thread_model = await self._get_thread_model(thread_id, context)
        user_id = context.get("user_id")

        if thread_model:
            return ThreadMetadata(
                id=thread_model.id,
                created_at=thread_model.created_at,
                metadata=thread_model.metadata_,
                title=thread_model.metadata_.get("title")
            )

        # Return fresh metadata (not persisted until save_thread)
        # Use naive datetime for PostgreSQL compatibility
        return ThreadMetadata(
            id=thread_id,
            created_at=datetime.now(timezone.utc).replace(tzinfo=None),
            metadata={"user_id": user_id} if user_id else {}
        )

    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
        """Save thread metadata (upsert)."""
        user_id = context.get("user_id")
        current_thread = await self._get_thread_model(thread.id, context)

        if current_thread:
            current_thread.metadata_ = thread.metadata
            self._session.add(current_thread)
        else:
            new_thread = ChatKitThread(
                id=thread.id,
                created_at=thread.created_at.replace(tzinfo=None) if thread.created_at.tzinfo else thread.created_at,
                metadata_=thread.metadata,
                user_id=user_id
            )
            self._session.add(new_thread)

        await self._session.commit()

    async def delete_thread(self, thread_id: str, context: dict) -> bool:
        """Delete a thread and its items (cascade)."""
        thread_model = await self._get_thread_model(thread_id, context)
        if thread_model:
            await self._session.delete(thread_model)
            await self._session.commit()
            return True
        return False

    async def load_threads(
        self,
        after: str | None,
        limit: int,
        order: str,
        context: dict,
    ) -> Page[ThreadMetadata]:
        """List threads for the current user."""
        user_id = context.get("user_id")

        # STRICT ISOLATION: Anonymous users get NO history list
        if user_id is None:
            return Page(data=[], has_more=False)

        statement = select(ChatKitThread)
        statement = statement.where(ChatKitThread.user_id == user_id)

        if order == "desc":
            statement = statement.order_by(col(ChatKitThread.created_at).desc())
        else:
            statement = statement.order_by(col(ChatKitThread.created_at).asc())

        result = await self._session.exec(statement)
        all_threads = result.all()

        start_index = 0
        if after:
            for i, t in enumerate(all_threads):
                if t.id == after:
                    start_index = i + 1
                    break

        page_items_models = all_threads[start_index : start_index + limit]
        has_more = len(all_threads) > start_index + limit

        page_items = [
            ThreadMetadata(
                id=t.id,
                created_at=t.created_at,
                metadata=t.metadata_,
                title=t.metadata_.get("title")
            )
            for t in page_items_models
        ]

        return Page(data=page_items, has_more=has_more)

    async def load_thread_items(
        self,
        thread_id: str,
        after: str | None,
        limit: int,
        order: str,
        context: dict,
    ) -> Page[ThreadItem]:
        """Load items for a thread."""
        thread_model = await self._get_thread_model(thread_id, context)
        if not thread_model:
            return Page(data=[], has_more=False)

        statement = select(ChatKitItem).where(ChatKitItem.thread_id == thread_id)

        if order == "desc":
            statement = statement.order_by(col(ChatKitItem.created_at).desc())
        else:
            statement = statement.order_by(col(ChatKitItem.created_at).asc())

        result = await self._session.exec(statement)
        all_items = result.all()

        start_index = 0
        if after:
            for i, item in enumerate(all_items):
                if item.id == after:
                    start_index = i + 1
                    break

        page_models = all_items[start_index : start_index + limit]
        has_more = len(all_items) > start_index + limit

        adapter = TypeAdapter(ThreadItem)
        adapter = TypeAdapter(ThreadItem)
        page_items = []
        for i in page_models:
            # We stored the *rest* of the item data in i.content (JSONB)
            # Reconstruct the full dict for validation
            item_data = i.content.copy() if i.content else {}
            item_data["id"] = i.id
            item_data["thread_id"] = i.thread_id
            item_data["type"] = i.type
            item_data["created_at"] = i.created_at

            # Validate and convert to appropriate specific type (UserMessageItem etc)
            page_items.append(adapter.validate_python(item_data))

        return Page(data=page_items, has_more=has_more)

    async def load_item(self, item_id: str, context: dict) -> ThreadItem | None:
        """Load a specific item by ID."""
        statement = select(ChatKitItem).where(ChatKitItem.id == item_id)
        result = await self._session.exec(statement)
        item = result.first()

        if item:
            # Verify user has access to this item's thread
            thread = await self._get_thread_model(item.thread_id, context)
            if thread:
                item_data = item.content.copy() if item.content else {}
                item_data["id"] = item.id
                item_data["thread_id"] = item.thread_id
                item_data["type"] = item.type
                item_data["created_at"] = item.created_at

                return TypeAdapter(ThreadItem).validate_python(item_data)
        return None

    async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
        """Save an item to a thread."""
        # Ensure thread exists
        thread_model = await self._get_thread_model(thread_id, context)
        if not thread_model:
            user_id = context.get("user_id")
            new_thread = ChatKitThread(
                id=thread_id,
                user_id=user_id,
                metadata_={}
            )
            self._session.add(new_thread)
            await self._session.flush()

        # Check if item exists (update) or create new
        existing = await self._session.exec(
            select(ChatKitItem).where(ChatKitItem.id == item.id)
        )
        existing_item = existing.first()

        # Prepare content blob: dump everything, then remove fields stored in columns
        item_dump = item.model_dump(mode="json")
        item_dump.pop("id", None)
        item_dump.pop("type", None)
        item_dump.pop("created_at", None) # Stored in DB column

        if existing_item:
            existing_item.type = item.type
            existing_item.content = item_dump
            self._session.add(existing_item)
        else:
            # Strip timezone for PostgreSQL
            created_at = item.created_at or datetime.now(timezone.utc)
            if hasattr(created_at, 'tzinfo') and created_at.tzinfo:
                created_at = created_at.replace(tzinfo=None)

            new_item = ChatKitItem(
                id=item.id,
                thread_id=thread_id,
                type=item.type,
                content=item_dump,
                created_at=created_at
            )
            self._session.add(new_item)

        await self._session.commit()

    async def add_thread_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
        """Add an item to a thread."""
        await self.save_item(thread_id, item, context)

    async def delete_thread_item(self, item_id: str, context: dict) -> bool:
        """Delete a specific item."""
        statement = select(ChatKitItem).join(ChatKitThread).where(ChatKitItem.id == item_id)
        user_id = context.get("user_id")

        if user_id:
            statement = statement.where(ChatKitThread.user_id == user_id)
        else:
            statement = statement.where(ChatKitThread.user_id == None)  # noqa: E711

        result = await self._session.exec(statement)
        item = result.first()

        if item:
            await self._session.delete(item)
            await self._session.commit()
            return True
        return False

    async def save_attachment(self, attachment_id: str, data: bytes, context: dict) -> None:
        """Save attachment (not implemented for PostgresStore MVP)."""
        pass

    async def load_attachment(self, attachment_id: str, context: dict) -> bytes | None:
        """Load attachment (not implemented for PostgresStore MVP)."""
        return None

    async def delete_attachment(self, attachment_id: str, context: dict) -> bool:
        """Delete attachment (not implemented for PostgresStore MVP)."""
        return False

    def generate_thread_id(self, context: dict) -> str:
        """Generate a new thread ID."""
        import uuid
        return f"thread_{uuid.uuid4().hex[:12]}"

    def generate_item_id(self, item_type: str, thread: ThreadMetadata, context: dict) -> str:
        """Generate a new item ID."""
        import uuid
        return f"{item_type}_{uuid.uuid4().hex[:12]}"


__all__ = ["chat_store", "InMemoryStore", "PostgresStore"]
