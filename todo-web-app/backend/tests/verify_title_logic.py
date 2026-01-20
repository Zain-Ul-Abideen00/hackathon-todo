import sys
import os
import asyncio
from unittest.mock import MagicMock, patch

# Add src to path - assuming running from backend root
sys.path.append(os.path.join(os.getcwd(), "src"))
# Also add current directory to allow local imports if needed
sys.path.append(os.getcwd())

# Mock imports that might fail if dependencies aren't perfect in this script context
# We need to make sure 'agents' and 'chatkit' are available or mocked if needed
# But assuming uv environment has them.

from chatkit.types import ThreadMetadata
# We need to import TodoChatKitServer.
# Since it does relative imports, we need to be careful.
# best is to run from backend root.

async def test_title_generation():
    print("Starting verification...")

    try:
        from src.chat.server import TodoChatKitServer
        from src.chat.store import InMemoryStore
    except ImportError as e:
        print(f"ImportError: {e}")
        print("Ensure you are running this script from 'todo-web-app/backend' directory")
        return

    store = InMemoryStore()
    server = TodoChatKitServer(store)

    print("Server initialized.")

    # Patch Agent class in server.py
    with patch("src.chat.server.Agent") as MockAgentClass:
        # Patch Runner in server.py
        with patch("src.chat.server.Runner.run", new_callable=MagicMock) as mock_run:
            # Configure mock result
            mock_result = MagicMock()
            mock_result.final_output = "Auto Generated Title"
            mock_result.text = "Auto Generated Title"

            f = asyncio.Future()
            f.set_result(mock_result)
            mock_run.return_value = f

            # --- Test 1: InMemoryStore Path ---
            print("\n--- Test 1: InMemoryStore Path ---")
            store = InMemoryStore()
            server = TodoChatKitServer(store)

            thread_id = "test-thread-mem"
            await store.load_thread(thread_id, {"user_id": "test-user"})

            print("Calling generate_title (InMemory)...")
            await server.generate_title(thread_id, "Hello world")

            thread = await store.load_thread(thread_id, {})
            title = thread.metadata.get("title")
            title_attr = getattr(thread, "title", "N/A")
            print(f"InMemory Title found in metadata: '{title}'")
            print(f"InMemory Title found in attribute: '{title_attr}'")

            if title != "Auto Generated Title":
                print("FAILURE: InMemoryStore title generation failed (metadata)")
            if title_attr != "Auto Generated Title":
                print("FAILURE: InMemoryStore title mapping failed (attribute)")

            # --- Test 2: PostgresStore Path Simulation ---
            print("\n--- Test 2: PostgresStore Path Simulation ---")

            # We need to assume src.chat.server imports PostgresStore locally in the method
            # We can't easily mock the local import inside the method without patching sys.modules or using side_effect
            # But the logic uses `isinstance(self.store, PostgresStore)`.
            # So we need to create a FakePostgresStore that inherits from PostgresStore (or looks like it)

            try:
                from src.chat.store import PostgresStore

                # Mock the database engine and session
                with patch("src.chat.server.engine", create=True) as mock_engine:
                    with patch("src.chat.server.AsyncSession", create=True) as MockAsyncSession:
                         # Configure Mock Session
                        mock_session = MagicMock()
                        mock_session.__aenter__.return_value = mock_session
                        mock_session.__aexit__.return_value = None
                        MockAsyncSession.return_value = mock_session

                        # Mock PostgresStore inside the method
                        with patch("src.chat.server.PostgresStore", create=True) as MockPgStoreClass:
                             # The local_store instance
                            mock_local_store = MagicMock()
                            MockPgStoreClass.return_value = mock_local_store

                            # Setup mock load/save behavior
                            mock_thread = MagicMock()
                            mock_thread.metadata = {}

                            async def mock_load_thread(*args, **kwargs):
                                return mock_thread

                            mock_local_store.load_thread.side_effect = mock_load_thread
                            mock_local_store.save_thread = MagicMock()
                            f_save = asyncio.Future()
                            f_save.set_result(None)
                            mock_local_store.save_thread.return_value = f_save

                            # Create a fake PostgresStore instance for the server
                            # We can just use MagicMock spec=PostgresStore
                            fake_main_store = MagicMock(spec=PostgresStore)
                            server_pg = TodoChatKitServer(fake_main_store)

                            print("Calling generate_title (Postgres)...")
                            await server_pg.generate_title("test-thread-pg", "Hello world")

                            # Verify new session was created
                            print("Verifying new session created...")
                            if MockAsyncSession.called:
                                print("SUCCESS: New AsyncSession was created.")
                            else:
                                print("FAILURE: New AsyncSession was NOT created.")

                            # Verify title was set on the mock thread
                            if mock_thread.metadata.get("title") == "Auto Generated Title":
                                print("SUCCESS: Title set on thread metadata.")
                            else:
                                print(f"FAILURE: Title not set in metadata: {mock_thread.metadata}")

                            # Since we are mocking, we can't test load_thread logic directly without
                            # implementing a fake load_thread that does the mapping.
                            # But we verified the code change in store.py visually.
                            # For this script, we just ensure the generate_title called save_thread with correct data.

                            args, _ = mock_local_store.save_thread.call_args
                            saved_thread = args[0]
                            if saved_thread.metadata.get("title") == "Auto Generated Title":
                                 print("SUCCESS: save_thread called with correct title in metadata")
                            else:
                                 print("FAILURE: save_thread called with incorrect metadata")

            except ImportError:
                 print("Skipping PostgresStore test (dependencies missing)")

if __name__ == "__main__":
    asyncio.run(test_title_generation())
