"""Dapr Secrets Store Integration.

This module provides helpers for retrieving secrets from Dapr's
secrets store API instead of environment variables. This enables
secure secret management in Kubernetes without hardcoding.

Usage:
    from src.core.secrets import get_secret

    # Retrieve a single secret
    db_url = await get_secret("database-url")

    # Use environment variable fallback in development
    db_url = await get_secret("database-url", default=os.getenv("DATABASE_URL"))
"""

import logging
import os
from typing import Any

import httpx

logger = logging.getLogger(__name__)

# Dapr sidecar HTTP port (default: 3500)
DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_SIDECAR_URL = f"http://localhost:{DAPR_HTTP_PORT}"

# Secret store name (matches secretstore.yaml component name)
SECRET_STORE_NAME = os.getenv("DAPR_SECRET_STORE", "kubernetes-secrets")

# Enable/disable Dapr secrets (use env vars in development)
DAPR_SECRETS_ENABLED = os.getenv("DAPR_SECRETS_ENABLED", "false").lower() == "true"

# Timeout for secret requests
SECRET_TIMEOUT = 5.0

# Cache for secrets (avoid repeated calls for same secret)
_secrets_cache: dict[str, str] = {}


async def get_secret(
    secret_name: str,
    key: str | None = None,
    default: str | None = None,
    use_cache: bool = True,
) -> str | None:
    """Retrieve a secret from Dapr secrets store.

    When DAPR_SECRETS_ENABLED is false, returns the default value
    (typically an environment variable) for local development.

    Args:
        secret_name: Name of the Kubernetes secret
        key: Optional key within the secret (for multi-value secrets)
        default: Fallback value if secret not found
        use_cache: Whether to use cached value if available

    Returns:
        Secret value as string, or default if not found

    Raises:
        RuntimeError: If secret not found and no default provided
    """
    if not DAPR_SECRETS_ENABLED:
        logger.debug(
            "Dapr secrets disabled, using default for: %s",
            secret_name,
        )
        return default

    # Check cache first
    cache_key = f"{secret_name}:{key or ''}"
    if use_cache and cache_key in _secrets_cache:
        logger.debug("Using cached secret: %s", secret_name)
        return _secrets_cache[cache_key]

    try:
        secret_value = await _fetch_secret_from_dapr(secret_name, key)

        if secret_value is not None:
            if use_cache:
                _secrets_cache[cache_key] = secret_value
            logger.info("Retrieved secret via Dapr: %s", secret_name)
            return secret_value

    except Exception as e:
        logger.error(
            "Failed to retrieve secret %s: %s",
            secret_name,
            str(e),
        )

    # Use default if secret retrieval failed
    if default is not None:
        logger.warning(
            "Using default value for secret: %s",
            secret_name,
        )
        return default

    # Fail fast if no default and secret not found
    raise RuntimeError(
        f"Required secret '{secret_name}' not found in Dapr secrets store "
        f"and no default provided"
    )


async def _fetch_secret_from_dapr(
    secret_name: str,
    key: str | None = None,
) -> str | None:
    """Fetch secret from Dapr HTTP API.

    Args:
        secret_name: Name of the secret
        key: Optional key within the secret

    Returns:
        Secret value or None if not found
    """
    url = f"{DAPR_SIDECAR_URL}/v1.0/secrets/{SECRET_STORE_NAME}/{secret_name}"

    async with httpx.AsyncClient(timeout=SECRET_TIMEOUT) as client:
        response = await client.get(url)

        if response.status_code == 404:
            logger.warning("Secret not found: %s", secret_name)
            return None

        if response.status_code != 200:
            logger.error(
                "Dapr secrets API returned %d: %s",
                response.status_code,
                response.text,
            )
            return None

        data = response.json()

        # If key specified, return specific value
        if key:
            return data.get(key)

        # If single-value secret, return first value
        if len(data) == 1:
            return list(data.values())[0]

        # For multi-value, return the one matching secret_name
        return data.get(secret_name)


async def get_secrets_bulk(
    secret_names: list[str],
) -> dict[str, str | None]:
    """Retrieve multiple secrets at once.

    Args:
        secret_names: List of secret names to retrieve

    Returns:
        Dictionary mapping secret names to values
    """
    results = {}
    for name in secret_names:
        try:
            results[name] = await get_secret(name)
        except RuntimeError:
            results[name] = None
    return results


def clear_cache() -> None:
    """Clear the secrets cache."""
    global _secrets_cache
    _secrets_cache = {}
    logger.info("Secrets cache cleared")
