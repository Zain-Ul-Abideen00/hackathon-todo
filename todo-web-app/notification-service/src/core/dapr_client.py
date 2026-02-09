"""Dapr Client Helper for Service Invocation.

This module provides functions to invoke other services
through the Dapr service invocation API.
"""

import httpx
import logging

logger = logging.getLogger(__name__)

# Dapr sidecar defaults
DAPR_HTTP_PORT = 3501  # notification-service's Dapr sidecar port
DAPR_BASE_URL = f"http://localhost:{DAPR_HTTP_PORT}"


async def invoke_service(
    app_id: str,
    method: str,
    http_method: str = "GET",
    data: dict | None = None,
    timeout: float = 10.0,
) -> dict | None:
    """Invoke another service through Dapr service invocation API.

    Uses Dapr's service invocation building block to call other services
    with automatic service discovery and load balancing.

    Args:
        app_id: The Dapr app-id of the target service (e.g., 'backend')
        method: The HTTP method path to invoke (e.g., '/api/health')
        http_method: HTTP method (GET, POST, etc.)
        data: Optional JSON body for POST/PUT requests
        timeout: Request timeout in seconds

    Returns:
        Response JSON as dict, or None if error

    Example:
        # Get task details from backend
        task = await invoke_service('backend', '/api/tasks/123')
    """
    url = f"{DAPR_BASE_URL}/v1.0/invoke/{app_id}/method{method}"

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            if http_method.upper() == "GET":
                response = await client.get(url)
            elif http_method.upper() == "POST":
                response = await client.post(url, json=data or {})
            elif http_method.upper() == "PUT":
                response = await client.put(url, json=data or {})
            elif http_method.upper() == "DELETE":
                response = await client.delete(url)
            else:
                logger.error("Unsupported HTTP method: %s", http_method)
                return None

            if response.status_code >= 400:
                logger.error(
                    "Service invocation failed: %s %s -> %s",
                    http_method,
                    url,
                    response.status_code,
                )
                return None

            return response.json() if response.content else {}

    except httpx.TimeoutException:
        logger.error("Service invocation timeout: %s %s", http_method, url)
        return None
    except Exception as e:
        logger.error("Service invocation error: %s", str(e))
        return None


async def invoke_backend(method: str, http_method: str = "GET", data: dict | None = None) -> dict | None:
    """Convenience function to invoke the backend service.

    Args:
        method: The API endpoint path (e.g., '/api/health')
        http_method: HTTP method (GET, POST, etc.)
        data: Optional JSON body

    Returns:
        Response JSON or None

    Example:
        health = await invoke_backend('/api/health')
        task = await invoke_backend(f'/api/{user_id}/tasks/{task_id}')
    """
    return await invoke_service("backend", method, http_method, data)


async def get_task_details(user_id: str, task_id: int) -> dict | None:
    """Get task details from the backend service.

    Args:
        user_id: The user's ID
        task_id: The task ID to retrieve

    Returns:
        Task details dict or None if not found
    """
    return await invoke_backend(f"/api/{user_id}/tasks/{task_id}")
