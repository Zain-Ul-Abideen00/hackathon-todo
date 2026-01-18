"""
ChatKit Server for Todo Application.

Custom ChatKitServer subclass that integrates with the AI agent
and provides streaming responses.

Reference: .agent/skills/integrating-chatkit/references/backend-patterns.md
"""

from typing import AsyncIterator

from agents import Runner
from chatkit.server import ChatKitServer
from chatkit.store import Store
from chatkit.types import ThreadMetadata

from .agent import get_agent
from .store import chat_store


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

    async def respond(
        self,
        thread: ThreadMetadata,
        input: str,
        context: dict,
    ) -> AsyncIterator[str]:
        """Generate streaming response from AI agent.

        Args:
            thread: Chat thread metadata
            input: User message text
            context: Request context including user_id and session

        Yields:
            Response text chunks for SSE streaming
        """
        user_id = context.get("user_id")
        session = context.get("session")

        # Build agent context with authentication info
        agent_context = {
            "user_id": user_id,
            "session": session,
        }

        try:
            # Run agent with streaming
            result = Runner.run_streamed(
                self.agent,
                input=input,
                context=agent_context,
            )

            # Stream response events
            async for event in result.stream_events():
                if event.type == "raw_response_event":
                    if hasattr(event, "data") and event.data:
                        yield str(event.data)

        except Exception as e:
            # Yield error message for graceful degradation
            yield f"I'm sorry, I encountered an error: {str(e)}. Please try again."


# Create singleton server instance
server = TodoChatKitServer(store=chat_store)

__all__ = ["server", "TodoChatKitServer"]
