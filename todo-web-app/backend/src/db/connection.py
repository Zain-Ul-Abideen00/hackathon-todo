"""Database connection module with async engine and session factory.

This module provides async database connectivity for the Todo Web Application
using SQLModel with asyncpg driver for Neon PostgreSQL.
"""

import ssl
from collections.abc import AsyncGenerator
from os import environ
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

# Load environment variables
load_dotenv()


def get_async_database_url(url: str | None = None) -> str:
    """Convert PostgreSQL URL to async-compatible format for asyncpg.

    Converts postgresql:// or postgres:// URLs to postgresql+asyncpg://
    and removes query parameters that asyncpg doesn't accept (sslmode, channel_binding).

    Args:
        url: Database URL to convert. Defaults to DATABASE_URL env var.

    Returns:
        Async-compatible database URL with cleaned query parameters.

    Raises:
        ValueError: If DATABASE_URL is not set and no url provided.
    """
    if url is None:
        url = environ.get("DATABASE_URL")
    if not url:
        raise ValueError("DATABASE_URL environment variable is not set")

    # Convert driver prefix
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)

    # Parse URL and remove asyncpg-incompatible params
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)

    # Remove params that asyncpg handles via connect_args instead
    query_params.pop("sslmode", None)
    query_params.pop("channel_binding", None)

    # Reconstruct URL with cleaned query params
    new_query = urlencode({k: v[0] for k, v in query_params.items()})
    cleaned_url = urlunparse(
        (
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment,
        )
    )

    return cleaned_url


# Create SSL context for Neon PostgreSQL
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Create async engine with connection pooling optimized for Neon
DATABASE_URL = get_async_database_url()

engine = create_async_engine(
    DATABASE_URL,
    echo=environ.get("ENVIRONMENT") == "development",
    pool_pre_ping=True,  # Essential for serverless databases like Neon
    pool_size=5,
    max_overflow=10,
    pool_recycle=300,  # Recycle connections every 5 minutes
    connect_args={"ssl": ssl_context},
)


async def create_db_and_tables() -> None:
    """Create all database tables.

    Used for development/testing. Production uses Alembic migrations.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that yields async database sessions.

    Yields:
        AsyncSession instance for database operations.
    """
    async with AsyncSession(engine) as session:
        yield session
