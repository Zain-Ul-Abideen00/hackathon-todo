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
            items=page_items,
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
            items=page_items,
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
        return False


# Create singleton store instance
chat_store = InMemoryStore()

__all__ = ["chat_store", "InMemoryStore"]
