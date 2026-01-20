"""
TitleGenerator Agent.

Lightweight agent for generating short thread titles.
Uses a cheaper/faster model since this is a simple generation task.

Reference: .agent/skills/building-with-openai-agents/SKILL.md
"""

from agents import Agent, Runner

from .models import create_title_model


TITLE_INSTRUCTIONS = """You are a title generator. Your only job is to create very short,
summarized titles (maximum 5 words) for chat conversations.

Rules:
- Maximum 5 words
- No quotes or punctuation
- Capture the main topic/intent
- Be concise and descriptive

Just output the title, nothing else."""


# Lazy initialization
_title_agent: Agent | None = None


def get_title_agent() -> Agent:
    """Get or create the title generator agent singleton."""
    global _title_agent
    if _title_agent is None:
        _title_agent = Agent(
            name="TitleGenerator",
            instructions=TITLE_INSTRUCTIONS,
            model=create_title_model(),
        )
    return _title_agent


async def generate_thread_title(user_message: str) -> str:
    """Generate a short title for a chat thread.

    Args:
        user_message: The first user message in the thread

    Returns:
        A short title (max 5 words)
    """
    agent = get_title_agent()

    prompt = f"Generate a title for a conversation starting with: {user_message}"

    result = await Runner.run(agent, input=prompt)

    # Extract text from result
    title = ""
    if hasattr(result, "final_output"):
        title = result.final_output
    elif hasattr(result, "text"):
        title = result.text
    elif hasattr(result, "content"):
        title = result.content
    else:
        title = str(result)

    return title.strip()


__all__ = ["get_title_agent", "generate_thread_title"]
