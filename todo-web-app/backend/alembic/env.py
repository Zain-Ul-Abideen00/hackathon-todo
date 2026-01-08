"""Alembic async migration environment for Todo Web Application.

Configured for SQLModel with asyncpg driver and Neon PostgreSQL.
"""

import asyncio
import ssl
from logging.config import fileConfig
from os import environ
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from dotenv import load_dotenv
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

# Load environment variables
load_dotenv()


def get_async_database_url() -> str:
    """Convert PostgreSQL URL to async-compatible format for asyncpg.

    Handles the conversion of sslmode parameter which asyncpg doesn't accept
    as a query parameter.
    """
    url = environ.get("DATABASE_URL", "")

    # Convert driver prefix
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)

    # Parse URL and remove sslmode from query params (handled separately)
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)

    # Remove asyncpg-incompatible params
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


# this is the Alembic Config object
config = context.config

# Set the database URL
config.set_main_option("sqlalchemy.url", get_async_database_url())

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import all models for autogenerate detection
from sqlmodel import SQLModel
from src.models import Task  # noqa: F401 - Import for metadata registration

# Set target metadata for autogenerate
target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run async migrations with asyncpg engine using SSL for Neon."""
    # Create SSL context for Neon PostgreSQL
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    connectable = create_async_engine(
        get_async_database_url(),
        poolclass=pool.NullPool,
        connect_args={"ssl": ssl_context},
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
