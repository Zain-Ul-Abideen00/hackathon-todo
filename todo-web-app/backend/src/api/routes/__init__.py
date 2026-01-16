"""
API Routes Package.

This package contains all FastAPI route modules:
- health: Health check endpoints
- tasks: Task CRUD operations (Module 3)
- auth: Authentication endpoints (Module 4)
"""

from src.api.routes import health

__all__ = ["health"]
