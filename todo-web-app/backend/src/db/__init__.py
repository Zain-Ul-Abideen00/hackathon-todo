# Database connection package (Module 2)
"""Database connectivity and session management.

Exports:
    - engine: Async SQLAlchemy engine for Neon PostgreSQL
    - get_session: FastAPI dependency for database sessions
    - get_async_database_url: URL converter for asyncpg driver
    - create_db_and_tables: Development utility for table creation
"""

from .connection import (
    create_db_and_tables,
    engine,
    get_async_database_url,
    get_session,
)
from .dependencies import get_session as get_db_session

__all__ = [
    "engine",
    "get_session",
    "get_db_session",
    "get_async_database_url",
    "create_db_and_tables",
]
