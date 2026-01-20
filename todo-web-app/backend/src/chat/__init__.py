"""
Chat module for AI-powered todo management.

Provides ChatKit server integration with MCP tools wrapping task_service.

Agents:
  - Todo Assistant: Main task management agent (gemini-2.5-flash)
  - TitleGenerator: Thread title generation (gemini-2.5-flash-lite)
"""

from .agent import get_agent, todo_agent
from .title_agent import get_title_agent, generate_thread_title
from .server import server
from .routes import router

__all__ = [
    "get_agent",
    "todo_agent",
    "get_title_agent",
    "generate_thread_title",
    "server",
    "router",
]
