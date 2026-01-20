"""
ChatKit Server for Todo Application.

Custom ChatKitServer subclass that integrates with the AI agent
and provides streaming responses using the correct event protocol.

Reference: .agent/skills/integrating-chatkit/references/backend-patterns.md
"""

from typing import AsyncIterator, Any
import asyncio

from agents import Runner
from chatkit.server import ChatKitServer
from chatkit.store import Store
from chatkit.types import ThreadMetadata, ThreadUpdatedEvent, Thread
from chatkit.agents import stream_agent_response, AgentContext

from .agent import get_agent, create_agent_with_model
from .title_agent import generate_thread_title
from .store import chat_store, PostgresStore


class TodoChatKitServer(ChatKitServer[dict]):
    """ChatKit server for todo task management via AI agent."""

    def __init__(self, store: Store):
        """Initialize server with store."""
        super().__init__(store=store)
        self._agent = None

    @property
    def agent(self):
        """Lazy load agent to ensure environment is configured."""
        if self._agent is None:
            self._agent = get_agent()
        return self._agent

    async def generate_title(self, thread_id: str, user_message: str, context: dict):
        """Generates a short 3-5 word title for the chat thread.

        Uses the dedicated TitleGenerator agent (cheaper model).
        """
        # Imports for isolated session handling
        from src.db.connection import engine
        from sqlmodel.ext.asyncio.session import AsyncSession
        from .store import PostgresStore as PgStore

        try:
            # print(f"Generating title for thread {thread_id}...")

            # Use dedicated title agent (defined in title_agent.py)
            new_title = await generate_thread_title(user_message)

            # Update thread metadata
            # CRITICAL: Use a FRESH session/store for this background task to avoid
            # sharing the main request's AsyncSession (which causes "another operation in progress")

            # Helper to perform update
            async def _update_with_store(store: Store):
                # Pass context to ensure we find the correct user-owned thread
                thread = await store.load_thread(thread_id, context)
                thread.metadata["title"] = new_title
                if hasattr(thread, "title"):
                    thread.title = new_title
                await store.save_thread(thread, context)
                return thread

            updated_thread = None

            # Check if we are using PostgresStore (need new session)
            # Use strict type check or simple heuristic
            if isinstance(self.store, PostgresStore):
                async with AsyncSession(engine) as session:
                    local_store = PgStore(session)
                    updated_thread = await _update_with_store(local_store)
            else:
                # InMemoryStore or generic - use as is (thread safe enough for dicts)
                updated_thread = await _update_with_store(self.store)

            # print(f"Set title for thread {thread_id} to: {new_title}")
            return updated_thread

        except Exception as e:
            print(f"Error generating title for thread {thread_id}: {e}")
            return None

    async def respond(
        self,
        thread: ThreadMetadata,
        input: Any,
        context: dict,
    ) -> AsyncIterator[Any]:
        """Generate streaming response from AI agent.

        Must yield ChatKit events (Pydantic models), NOT strings.
        We use stream_agent_response helper to convert Agent events to ChatKit events.

        Args:
            thread: Chat thread metadata
            input: User message text or input object
            context: Request context including user_id and session

        Yields:
            ChatKit Protocol Events
        """
        user_id = context.get("user_id")

        # DEBUG: Trace context flow
        # print(f"[SERVER] respond() called")
        # print(f"[SERVER] context type: {type(context)}")
        # print(f"[SERVER] context keys: {context.keys() if isinstance(context, dict) else 'N/A'}")

        # Extract tool_choice from input if user selected a tool from composer
        tool_choice_id = None
        model_id = None
        if hasattr(input, "inference_options") and input.inference_options:
            # Extract tool choice
            tc = input.inference_options.tool_choice
            if tc and hasattr(tc, "id") and isinstance(tc.id, str):
                tool_choice_id = tc.id
                print(f"[SERVER] Tool choice selected: {tool_choice_id}")

            # Extract model choice
            if input.inference_options.model:
                model_id = input.inference_options.model
                print(f"[SERVER] Model choice selected: {model_id}")

        # Extract text from input if needed (ChatKit input can be dict or str)
        user_message = ""
        if isinstance(input, str):
            user_message = input
        elif isinstance(input, dict) and "text" in input:
            user_message = input["text"]
        elif hasattr(input, "text"):
            user_message = input.text
        elif hasattr(input, "content"):
            # ChatKit UserMessageItem might use 'content' field
            content = input.content
            if isinstance(content, list) and len(content) > 0:
                first_content = content[0]
                if hasattr(first_content, "text"):
                    user_message = first_content.text
                elif isinstance(first_content, dict) and "text" in first_content:
                    user_message = first_content["text"]

        if not user_message:
            user_message = "Hello"

        # If user selected a tool, prepend instruction to force tool usage
        if tool_choice_id:
            tool_hints = {
                "add_task": "Use the add_task tool to create this task:",
                "list_tasks": "Use the list_tasks tool to show tasks:",
                "complete_task": "Use the complete_task tool to mark this task as done:",
                "delete_task": "Use the delete_task tool to delete this task:",
                "update_task": "Use the update_task tool to update this task:",
            }
            hint = tool_hints.get(tool_choice_id, f"Use the {tool_choice_id} tool:")
            user_message = f"{hint} {user_message}"
            print(f"[SERVER] Injected tool hint: {hint}")

        print(f"[SERVER] Final user_message: {user_message[:80]}...")

        # --- Title Generation Logic ---
        # Check if we should generate a title (if none exists or it is the default)
        current_title = thread.metadata.get("title")
        title_task = None
        # Check against "New Thread" or empty/None
        if not current_title or current_title == "New Thread":
             # CRITICAL: Ensure thread exists in DB *before* spawning background task
             # This prevents Race Condition where generate_title tries to create thread same time as respond loop
             try:
                 await self.store.save_thread(thread, context)
             except Exception as e:
                 print(f"Warning: Failed to pre-save thread: {e}")

             # Start title generation as a concurrent task
             # Pass context to ensure correct user_id lookups in background task
             title_task = asyncio.create_task(self.generate_title(thread.id, user_message, context))

        # Create AgentContext wrapper which is required by stream_agent_response
        # to correctly map events back to the thread/store
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )

        try:
            # Import ProgressUpdateEvent for initial thinking indicator
            from chatkit.types import ProgressUpdateEvent

            # Yield initial "thinking" event immediately so user sees activity
            # Use sparkle icon to match ChatKit playground style
            yield ProgressUpdateEvent(icon="sparkle", text="Thinking...")

            # Select agent based on model choice
            # If user selected a model, create a fresh agent with that model
            # Otherwise use the default singleton agent
            if model_id:
                agent = create_agent_with_model(model_id)
            else:
                agent = self.agent

            # Run agent with streaming
            # Pass AgentContext to the agent so tools can access context via ctx.context
            # Tools access user_id and session via ctx.context.request_context
            streamed = Runner.run_streamed(
                agent,
                input=user_message,
                context=agent_context,  # Pass AgentContext, not raw dict
            )

            # ID Mapping: Map implementation-specific IDs (from LiteLLM) to persistent Store IDs
            # This prevents collisions when the LLM returns fixed/reused IDs (common in LiteLLM/Gemini)
            id_map = {}

            # Convert Agent events -> ChatKit events with ID remapping
            async for event in stream_agent_response(agent_context, streamed):
                # Check if this event has an item and if we need to remap its ID
                if hasattr(event, "item") and event.item:
                    original_id = event.item.id
                    if original_id not in id_map:
                         # Generate a new unique ID for this item using the Store
                         # We use "message" as generic type, or assume event.item.type if available
                         item_type = getattr(event.item, "type", "message")
                         id_map[original_id] = self.store.generate_item_id(item_type, thread, context)

                    # Replace the ID in the event's item
                    event.item.id = id_map[original_id]

                # Also remap IDs in 'item_id' fields (for update/done events)
                if hasattr(event, "item_id") and event.item_id in id_map:
                    event.item_id = id_map[event.item_id]

                yield event

            # Post-stream: Check if title generation finished and emit update
            if title_task:
                try:
                    # Wait for title generation to complete
                    updated_thread_md = await title_task
                    if updated_thread_md:
                         # We must construct a full Thread object (metadata + items)
                         # Fetch the latest items to be safe
                         items_page = await self.store.load_thread_items(
                             updated_thread_md.id,
                             limit=50,
                             order="desc",
                             after=None,
                             context=context
                         )

                         # Construct the Thread object
                         full_thread = Thread(
                             **updated_thread_md.model_dump(),
                             items=items_page
                         )

                         yield ThreadUpdatedEvent(thread=full_thread)
                except Exception as e:
                    print(f"Error awaiting title task: {e}")

        except Exception as e:
            # We should yield a proper error event ideally, or let the server handle exception
            # For now, print error and re-raise or let generic handler catch it
            print(f"Error in TodoChatKitServer.respond: {e}")
            raise e


# Create singleton server instance using InMemoryStore as default
# For authenticated requests, routes may override store with PostgresStore
server = TodoChatKitServer(store=chat_store)


def get_server_with_session(session):
    """Factory to create server with PostgresStore for database persistence.

    Called by routes when a database session is available.
    """
    from .store import PostgresStore
    postgres_store = PostgresStore(session)
    return TodoChatKitServer(store=postgres_store)


__all__ = ["server", "TodoChatKitServer"]
