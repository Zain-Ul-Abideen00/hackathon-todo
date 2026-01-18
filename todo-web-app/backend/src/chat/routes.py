"""
Chat API Routes.

Provides POST /api/chat endpoint for ChatKit protocol.
Supports optional authentication - chat works without auth but
task operations require valid JWT token.

Reference: .agent/skills/integrating-chatkit/references/backend-patterns.md
"""

import json
from typing import Annotated

from fastapi import APIRouter, Depends, Header, Request
from fastapi.responses import JSONResponse, StreamingResponse
from sqlmodel.ext.asyncio.session import AsyncSession

from src.api.deps import get_session
from src.auth.jwt import verify_token

from .server import server

router = APIRouter(tags=["Chat"])

MAX_MESSAGE_LENGTH = 4000  # ~1000 tokens


async def get_current_user_optional(
    authorization: Annotated[str | None, Header()] = None,
) -> dict | None:
    """Return user if valid token present, None otherwise.

    Unlike get_current_user, this doesn't raise an exception
    for unauthenticated requests. Chat endpoint is accessible
    without auth, but task operations require authentication.
    """
    if not authorization:
        return None

    # Extract token from "Bearer <token>" format
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization

    try:
        payload = verify_token(token)
        return payload
    except Exception:
        return None


@router.post("/chat", response_model=None)
async def chat_endpoint(
    request: Request,
    session: AsyncSession = Depends(get_session),
    current_user: dict | None = Depends(get_current_user_optional),
):
    """ChatKit protocol endpoint for AI-powered chat.

    Supports:
    - threads.list: List conversation threads
    - threads.get: Get specific thread
    - messages.create: Send message (returns streaming response)
    - messages.list: List thread messages

    Authentication is optional for chat, but required for task operations.
    """
    # Read request body
    body = await request.body()

    # Input validation: 4000 character limit (FR-011)
    if len(body) > MAX_MESSAGE_LENGTH:
        return JSONResponse(
            status_code=400,
            content={
                "error": "Message too long",
                "message": f"Message exceeds maximum length of {MAX_MESSAGE_LENGTH} characters.",
                "max_length": MAX_MESSAGE_LENGTH,
            },
        )

    # Build context for tools
    context = {
        "user_id": current_user.get("sub") if current_user else None,
        "session": session,
    }

    try:
        # Parse request to determine type
        try:
            request_data = json.loads(body)
        except json.JSONDecodeError:
            return JSONResponse(
                status_code=400,
                content={"error": "Invalid JSON in request body"},
            )

        request_type = request_data.get("type", "")
        params = request_data.get("params", {})

        # Handle different ChatKit request types
        if request_type == "threads.list":
            threads = await server.store.list_threads(context.get("user_id") or "anonymous")
            return JSONResponse(content={"threads": threads})

        elif request_type == "threads.get":
            thread_id = params.get("thread_id")
            thread = await server.store.get_thread(thread_id)
            if not thread:
                return JSONResponse(
                    status_code=404,
                    content={"error": f"Thread {thread_id} not found"},
                )
            return JSONResponse(content={"thread": thread})

        elif request_type == "messages.list":
            thread_id = params.get("thread_id")
            messages = await server.store.list_messages(thread_id)
            return JSONResponse(content={"messages": messages})

        elif request_type == "messages.create":
            thread_id = params.get("thread_id")
            content = params.get("content", "")

            if not content:
                return JSONResponse(
                    status_code=400,
                    content={"error": "Message content is required"},
                )

            # Get or create thread
            thread = await server.store.get_thread(thread_id)
            if not thread:
                thread = await server.store.create_thread(
                    thread_id,
                    user_id=context.get("user_id") or "anonymous",
                )

            # Store user message
            await server.store.add_message(thread_id, {"role": "user", "content": content})

            # Generate streaming response
            async def stream_response():
                full_response = ""
                async for chunk in server.respond(thread, content, context):
                    full_response += chunk
                    # SSE format
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"

                # Store assistant response
                await server.store.add_message(
                    thread_id, {"role": "assistant", "content": full_response}
                )
                yield f"data: {json.dumps({'done': True})}\n\n"

            return StreamingResponse(
                stream_response(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            )

        else:
            return JSONResponse(
                status_code=400,
                content={"error": f"Unknown request type: {request_type}"},
            )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "message": str(e),
            },
        )


__all__ = ["router"]
