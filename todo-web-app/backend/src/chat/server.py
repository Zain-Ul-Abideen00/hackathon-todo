"""
ChatKit Server for Todo Application.

Custom ChatKitServer subclass that integrates with the AI agent
and provides streaming responses using the correct event protocol.

Reference: .agent/skills/integrating-chatkit/references/backend-patterns.md
"""

from typing import AsyncIterator, Any

from agents import Runner
from chatkit.server import ChatKitServer
from chatkit.store import Store
from chatkit.types import ThreadMetadata
from chatkit.agents import stream_agent_response, AgentContext

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
        print(f"[SERVER] respond() called")
        print(f"[SERVER] context type: {type(context)}")
        print(f"[SERVER] context keys: {context.keys() if isinstance(context, dict) else 'N/A'}")
        print(f"[SERVER] user_id from context: {user_id}")
        print(f"[SERVER] session in context: {'session' in context if isinstance(context, dict) else 'N/A'}")

        # DEBUG: Trace input parameter
        print(f"[SERVER] input type: {type(input)}")
        print(f"[SERVER] input value: {input}")
        if hasattr(input, "__dict__"):
            print(f"[SERVER] input attrs: {input.__dict__}")

        # Extract text from input if needed (ChatKit input can be dict or str)
        user_message = ""
        if isinstance(input, str):
            user_message = input
            print(f"[SERVER] Extracted from string: {user_message[:50]}...")
        elif isinstance(input, dict) and "text" in input:
            user_message = input["text"]
            print(f"[SERVER] Extracted from dict['text']: {user_message[:50]}...")
        elif hasattr(input, "text"):
            user_message = input.text
            print(f"[SERVER] Extracted from input.text: {user_message[:50]}...")
        elif hasattr(input, "content"):
            # ChatKit UserMessageItem might use 'content' field
            content = input.content
            if isinstance(content, list) and len(content) > 0:
                first_content = content[0]
                if hasattr(first_content, "text"):
                    user_message = first_content.text
                elif isinstance(first_content, dict) and "text" in first_content:
                    user_message = first_content["text"]
            print(f"[SERVER] Extracted from input.content: {user_message[:50] if user_message else 'empty'}...")

        if not user_message:
            print(f"[SERVER] WARNING: No message extracted, using 'Hello' default")
            user_message = "Hello"

        print(f"[SERVER] Final user_message: {user_message[:50]}...")

        # Create AgentContext wrapper which is required by stream_agent_response
        # to correctly map events back to the thread/store
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )

        print(f"[SERVER] Created AgentContext with request_context: {type(agent_context.request_context)}")

        try:
            # Run agent with streaming
            # Pass AgentContext to the agent so tools can access context via ctx.context
            # Tools access user_id and session via ctx.context.request_context
            streamed = Runner.run_streamed(
                self.agent,
                input=user_message,
                context=agent_context,  # Pass AgentContext, not raw dict
            )

            # Convert Agent events -> ChatKit events
            async for event in stream_agent_response(agent_context, streamed):
                yield event

        except Exception as e:
            # We should yield a proper error event ideally, or let the server handle exception
            # For now, print error and re-raise or let generic handler catch it
            print(f"Error in TodoChatKitServer.respond: {e}")
            raise e


# Create singleton server instance
server = TodoChatKitServer(store=chat_store)

__all__ = ["server", "TodoChatKitServer"]
