
import pytest
from datetime import datetime, timezone
from src.chat.store import PostgresStore
from src.models.chatkit import ChatKitThread, ChatKitItem
from chatkit.types import ThreadMetadata, ThreadItem
from sqlmodel import select

@pytest.fixture
def store(session):
    return PostgresStore(session)

@pytest.fixture
def test_thread_id():
    return "thread_123"

@pytest.fixture
def unauthorized_thread_id():
    return "thread_456"

@pytest.fixture
def user_context():
    return {"user_id": "user_abc"}

@pytest.fixture
def other_user_context():
    return {"user_id": "user_xyz"}

@pytest.mark.asyncio
class TestPostgresStore:
    async def test_load_thread_creates_new(self, store, test_thread_id, user_context):
        thread = await store.load_thread(test_thread_id, user_context)
        assert thread.id == test_thread_id
        assert thread.metadata == {}

    async def test_save_thread(self, store, test_thread_id, user_context):
        thread = ThreadMetadata(id=test_thread_id, metadata={"title": "Test Thread"})
        await store.save_thread(thread, user_context)

        # Verify persistence
        loaded = await store.load_thread(test_thread_id, user_context)
        assert loaded.metadata["title"] == "Test Thread"

    async def test_add_thread_item(self, store, test_thread_id, user_context):
        await store.load_thread(test_thread_id, user_context)  # Ensure thread exists

        item = ThreadItem(
            id="item_1",
            type="message",
            content={"text": "Hello"},
            created_at=datetime.now(timezone.utc)
        )
        await store.add_thread_item(test_thread_id, item, user_context)

        items = await store.load_thread_items(test_thread_id, user_context)
        assert len(items) == 1
        assert items[0].id == "item_1"
        assert items[0].content["text"] == "Hello"

    async def test_delete_thread(self, store, test_thread_id, user_context):
        await store.load_thread(test_thread_id, user_context)
        await store.delete_thread(test_thread_id, user_context)

        # Should create new empty thread
        thread = await store.load_thread(test_thread_id, user_context)
        assert thread.metadata == {}

    async def test_user_isolation(self, store, test_thread_id, user_context, other_user_context):
        # User A creates a thread
        thread = ThreadMetadata(id=test_thread_id, metadata={"owner": "A"})
        await store.save_thread(thread, user_context)

        # User B should NOT see User A's thread, but get a clean one
        thread_b = await store.load_thread(test_thread_id, other_user_context)
        assert thread_b.metadata == {} # Should be empty/new because ID matches but owner mismatch -> ideally should throw or handle differently but standard ChatKit might use IDs differently.
        # Wait, if ID is UUID, collision is unlikely. But if ID is "latest", usage pattern matters.
        # Actually ChatKit IDs are usually UUIDs.
        # If User B requests a specific ID that belongs to User A, they should NOT get it.
        # Logic: If thread exists but owned by someone else -> return new empty thread (or error?)
        # ChatKit usually relies on ID. If I assume ID collision is impossible for new threads, but possible if malicious.
        # Store should ensure `user_id` matches.

    async def test_load_threads_filtering(self, store, user_context, other_user_context):
        # Create threads for User A
        await store.save_thread(ThreadMetadata(id="t1", metadata={}), user_context)
        await store.save_thread(ThreadMetadata(id="t2", metadata={}), user_context)

        # Create threads for User B
        await store.save_thread(ThreadMetadata(id="t3", metadata={}), other_user_context)

        # User A should only see t1, t2
        page = await store.load_threads(limit=10, after=None, order="desc", context=user_context)
        ids = [t.id for t in page.items]
        assert "t1" in ids
        assert "t2" in ids
        assert "t3" not in ids
