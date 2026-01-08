"""Test fixtures for Todo Web Application backend.

Provides async database session and test utilities for pytest-asyncio.
"""

import ssl
from collections.abc import AsyncGenerator
from os import environ
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

import pytest_asyncio
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool
from sqlmodel.ext.asyncio.session import AsyncSession

# Load environment variables
load_dotenv()


def get_test_database_url() -> str:
    """Get async database URL for testing."""
    url = environ.get("DATABASE_URL", "")

    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)

    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)
    query_params.pop("sslmode", None)
    query_params.pop("channel_binding", None)

    new_query = urlencode({k: v[0] for k, v in query_params.items()})
    return urlunparse(
        (
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            new_query,
            parsed.fragment,
        )
    )


# Create SSL context for Neon PostgreSQL
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE


@pytest_asyncio.fixture
async def session() -> AsyncGenerator[AsyncSession, None]:
    """Provide async database session for each test.

    Creates a fresh engine and session for each test to avoid
    connection pool issues between async tests.

    Yields:
        AsyncSession for database operations.
    """
    # Create a fresh engine for each test to avoid event loop issues
    engine = create_async_engine(
        get_test_database_url(),
        echo=False,
        connect_args={"ssl": ssl_context},
        poolclass=NullPool,  # Disable pooling for tests
    )

    async with AsyncSession(engine) as session:
        yield session

    await engine.dispose()
