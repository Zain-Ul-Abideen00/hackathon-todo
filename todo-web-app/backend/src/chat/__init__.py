"""
Chat module for AI-powered todo management.

Provides ChatKit server integration with MCP tools wrapping task_service.
"""

from .agent import todo_agent
from .server import server
from .routes import router

__all__ = ["todo_agent", "server", "router"]
