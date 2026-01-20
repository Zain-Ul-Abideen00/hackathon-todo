"""
Unit tests for PostgresStore.

Tests CRUD operations and user isolation for chat persistence.
"""

import pytest
from datetime import datetime, timezone
from src.chat.store import PostgresStore
from src.models.chatkit import ChatKitThread, ChatKitItem
from chatkit.types import ThreadMetadata, UserMessageItem
from chatkit.store import Page
from sqlmodel import select


@pytest.fixture
def store(session):
    """Create PostgresStore with test session."""
    return PostgresStore(session)


@pytest.fixture
def test_thread_id():
    """Unique thread ID for tests."""
    return f"thread_{datetime.now().timestamp()}"


@pytest.fixture
def user_context():
    """Context for user A."""
    return {"user_id": "user_abc"}


@pytest.fixture
def other_user_context():
    """Context for user B."""
    return {"user_id": "user_xyz"}


def make_thread(thread_id: str, metadata: dict = None) -> ThreadMetadata:
    """Helper to create ThreadMetadata with required fields."""
    return ThreadMetadata(
        id=thread_id,
        created_at=datetime.now(timezone.utc),
        metadata=metadata or {}
    )


def make_item(item_id: str, content_text: str = "Hello") -> UserMessageItem:
    """Helper to create a message item."""
    return UserMessageItem(
        id=item_id,
        created_at=datetime.now(timezone.utc),
        content=[{"type": "text", "text": content_text}]
    )


@pytest.mark.asyncio
class TestPostgresStore:
    """Test suite for PostgresStore."""

    async def test_load_thread_creates_new(self, store, test_thread_id, user_context):
        """Loading non-existent thread returns new empty thread."""
        thread = await store.load_thread(test_thread_id, user_context)
        assert thread.id == test_thread_id
        # New thread should have user_id in metadata
        assert thread.metadata.get("user_id") == "user_abc"

    async def test_save_thread(self, store, test_thread_id, user_context):
        """Saving thread persists metadata."""
        thread = make_thread(test_thread_id, {"title": "Test Thread"})
        await store.save_thread(thread, user_context)

        # Verify persistence
        loaded = await store.load_thread(test_thread_id, user_context)
        assert loaded.metadata.get("title") == "Test Thread"

    async def test_add_thread_item(self, store, test_thread_id, user_context):
        """Adding items to thread stores them correctly."""
        # Save thread first
        thread = make_thread(test_thread_id)
        await store.save_thread(thread, user_context)

        item = make_item("item_1", "Hello World")
        await store.add_thread_item(test_thread_id, item, user_context)

        # load_thread_items returns Page object with 'data' attribute
        page = await store.load_thread_items(
            test_thread_id,
            after=None,
            limit=10,
            order="asc",
            context=user_context
        )
        # Page uses 'data' not 'items'
        assert len(page.data) >= 1
        matching = [i for i in page.data if i.id == "item_1"]
        assert len(matching) == 1

    async def test_delete_thread(self, store, test_thread_id, user_context):
        """Deleting thread removes it from database."""
        # Create and save thread
        thread = make_thread(test_thread_id)
        await store.save_thread(thread, user_context)

        # Delete it
        result = await store.delete_thread(test_thread_id, user_context)
        assert result is True

        # Loading should return new empty thread
        loaded = await store.load_thread(test_thread_id, user_context)
        assert loaded.metadata.get("user_id") == "user_abc"

    async def test_user_isolation(self, store, user_context, other_user_context):
        """Users cannot access each other's threads."""
        thread_id = f"iso_thread_{datetime.now().timestamp()}"

        # User A creates a thread
        thread = make_thread(thread_id, {"owner": "A"})
        await store.save_thread(thread, user_context)

        # User B should NOT see User A's thread
        thread_b = await store.load_thread(thread_id, other_user_context)
        # Should be a new thread for User B, not User A's
        assert thread_b.metadata.get("owner") is None

    async def test_load_threads_filtering(self, store, user_context, other_user_context):
        """load_threads only returns current user's threads."""
        t1_id = f"t1_{datetime.now().timestamp()}"
        t2_id = f"t2_{datetime.now().timestamp()}"
        t3_id = f"t3_{datetime.now().timestamp()}"

        # Create threads for User A
        await store.save_thread(make_thread(t1_id), user_context)
        await store.save_thread(make_thread(t2_id), user_context)

        # Create thread for User B
        await store.save_thread(make_thread(t3_id), other_user_context)

        # User A should only see t1, t2
        page = await store.load_threads(
            limit=10,
            after=None,
            order="desc",
            context=user_context
        )
        # Page uses 'data' not 'items'
        ids = [t.id for t in page.data]
        assert t1_id in ids
        assert t2_id in ids
        assert t3_id not in ids

    async def test_load_item(self, store, test_thread_id, user_context):
        """load_item retrieves specific item by ID."""
        # Create thread and item
        thread = make_thread(test_thread_id)
        await store.save_thread(thread, user_context)

        item = make_item("specific_item", "test data")
        await store.save_item(test_thread_id, item, user_context)

        # Load by ID
        loaded = await store.load_item("specific_item", user_context)
        assert loaded is not None
        assert loaded.id == "specific_item"

    async def test_save_item_upsert(self, store, test_thread_id, user_context):
        """save_item updates existing items."""
        thread = make_thread(test_thread_id)
        await store.save_thread(thread, user_context)

        # Create item
        item = make_item("upsert_item", "version 1")
        await store.save_item(test_thread_id, item, user_context)

        # Update same item
        updated = make_item("upsert_item", "version 2")
        await store.save_item(test_thread_id, updated, user_context)

        # Verify update
        loaded = await store.load_item("upsert_item", user_context)
        assert loaded is not None
