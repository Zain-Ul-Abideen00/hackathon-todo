"""
Agent Diagnostic Script

Tests the AI agent directly to verify tool invocation is working.
Run from backend directory: uv run python scripts/test_agent.py
"""

import asyncio
import os
import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from dotenv import load_dotenv
load_dotenv()

from agents import Agent, Runner
from agents.extensions.models.litellm_model import LitellmModel


async def test_agent_with_tools():
    """Test the agent directly to verify tool calling works."""
    print("\n" + "=" * 60)
    print("AGENT DIAGNOSTIC TEST")
    print("=" * 60)

    # Check environment
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[ERROR] GEMINI_API_KEY not found in environment!")
        return
    print(f"[OK] GEMINI_API_KEY found: {api_key[:10]}...")

    # Create model
    print("\n[1] Creating LiteLLM model...")
    model = LitellmModel(
        model="gemini/gemini-2.5-flash",
        api_key=api_key,
    )
    print("[OK] Model created")

    # Create a simple test tool
    from agents import function_tool

    @function_tool
    def create_task(title: str, description: str = "") -> dict:
        """Create a new task for the user.

        Args:
            title: Task title (required)
            description: Optional task description
        """
        print(f"[TOOL CALLED] create_task(title='{title}', description='{description}')")
        return {
            "status": "created",
            "title": title,
            "message": f"Successfully created task: {title}"
        }

    @function_tool
    def list_tasks() -> dict:
        """List all tasks for the user."""
        print("[TOOL CALLED] list_tasks()")
        return {
            "tasks": [
                {"id": 1, "title": "Example task 1", "completed": False},
                {"id": 2, "title": "Example task 2", "completed": True},
            ],
            "count": 2
        }

    # Create agent with tools
    print("\n[2] Creating agent with tools...")
    agent = Agent(
        name="Test Todo Assistant",
        instructions="""You are a helpful Todo Assistant. You help users manage their tasks.

When a user asks to add a task, use the create_task tool.
When a user asks to list or show tasks, use the list_tasks tool.

Always use the appropriate tool when the user wants to manage tasks.""",
        model=model,
        tools=[create_task, list_tasks],
    )
    print(f"[OK] Agent created with {len(agent.tools)} tools")
    for tool in agent.tools:
        print(f"   - {tool.name}")

    # Test messages
    test_messages = [
        "Add a task called Buy milk",
        "Show me my tasks",
    ]

    print("\n[3] Testing tool invocation...")
    print("-" * 60)

    for msg in test_messages:
        print(f"\n>>> USER: {msg}")
        print("-" * 40)

        try:
            # Run agent (non-streaming for simplicity)
            result = await Runner.run(agent, input=msg)

            print(f"<<< AGENT: {result.final_output}")

            # Check if any tools were called
            if hasattr(result, 'new_items'):
                tool_calls = [item for item in result.new_items if hasattr(item, 'name')]
                if tool_calls:
                    print(f"[TOOLS] Called: {[tc.name for tc in tool_calls]}")
                else:
                    print("[WARNING] No tools were called!")

        except Exception as e:
            print(f"[ERROR] {e}")
            import traceback
            traceback.print_exc()

    print("\n" + "=" * 60)
    print("DIAGNOSTIC COMPLETE")
    print("=" * 60)


async def test_real_agent():
    """Test the actual Todo agent from the chat module."""
    print("\n" + "=" * 60)
    print("REAL AGENT TEST (from src.chat.agent)")
    print("=" * 60)

    try:
        from src.chat.agent import get_agent
        from src.chat.tools import ALL_TOOLS

        print(f"\n[1] Loading agent...")
        agent = get_agent()
        print(f"[OK] Agent loaded: {agent.name}")
        print(f"[OK] Tools registered: {len(agent.tools)}")
        for tool in agent.tools:
            print(f"   - {tool.name}")

        # Test with simple message
        print("\n[2] Testing real agent...")
        print("-" * 60)

        msg = "Add a task called Test from diagnostic"
        print(f"\n>>> USER: {msg}")

        # Run the real agent
        result = await Runner.run(agent, input=msg)

        print(f"<<< AGENT: {result.final_output}")

        # Show all new items (including tool calls)
        if hasattr(result, 'new_items'):
            print(f"\n[INFO] All new items:")
            for item in result.new_items:
                print(f"   - Type: {type(item).__name__}")
                if hasattr(item, 'raw_item'):
                    print(f"     Raw type: {type(item.raw_item).__name__}")

    except Exception as e:
        print(f"[ERROR] loading real agent: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    print("Starting agent diagnostics...")

    # Run tests
    asyncio.run(test_agent_with_tools())
    print("\n")
    asyncio.run(test_real_agent())
