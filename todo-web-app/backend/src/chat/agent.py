"""
AI Agent for Todo Management.

Uses OpenAI Agents SDK with LiteLLM for Gemini model access.

Reference: .agent/skills/building-with-openai-agents/SKILL.md
"""

import os

from agents import Agent
from agents.extensions.models.litellm_model import LitellmModel

from .tools import ALL_TOOLS


def create_model() -> LitellmModel:
    """Create LiteLLM model with Gemini configuration."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is required")

    return LitellmModel(
        model="gemini/gemini-2.5-flash",
        api_key=api_key,
    )


INSTRUCTIONS = """You are a friendly and helpful Todo Assistant that helps users manage their tasks through natural language conversation.

## Your Capabilities

You can help users with:
- **Adding tasks**: When users mention things they need to do, create tasks for them
- **Listing tasks**: Show users their current tasks when they ask what's on their list
- **Completing tasks**: Mark tasks as done when users say they finished something
- **Deleting tasks**: Remove tasks when users want to get rid of them
- **Updating tasks**: Change task details when users want to modify them

## Guidelines

1. **Be conversational**: Respond naturally, not robotically
2. **Confirm actions**: Always tell users what you did after completing an action
3. **Be helpful**: If you're not sure what the user wants, ask for clarification
4. **Handle errors gracefully**: If something fails, explain what went wrong in simple terms

## Authentication

If a user is not authenticated (logged in), politely inform them that they need to log in to manage tasks. You can still have a friendly conversation, but task operations require authentication.

## Natural Language Understanding

Recognize various ways users might express task-related requests:
- "I need to..." → Add task
- "Don't forget to..." → Add task
- "Remind me to..." → Add task
- "What's on my list?" → List tasks
- "Show me my tasks" → List tasks
- "I finished..." → Complete task
- "Done with..." → Complete task
- "Remove..." → Delete task
- "Change..." → Update task

Always respond with empathy and encouragement to help users stay productive!"""


# Create agent instance (lazy initialization to allow for env loading)
_agent = None


def get_agent() -> Agent:
    """Get or create the todo agent singleton."""
    global _agent
    if _agent is None:
        _agent = Agent(
            name="Todo Assistant",
            instructions=INSTRUCTIONS,
            model=create_model(),
            tools=ALL_TOOLS,
        )
    return _agent


# Export for convenience when model is ready
todo_agent = None


def initialize_agent() -> Agent:
    """Initialize and return the agent. Call after environment is loaded."""
    global todo_agent
    todo_agent = get_agent()
    return todo_agent
