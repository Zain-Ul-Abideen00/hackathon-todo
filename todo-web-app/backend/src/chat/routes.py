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
from fastapi.responses import JSONResponse, StreamingResponse, Response
from sqlmodel.ext.asyncio.session import AsyncSession

from src.auth.dependencies import get_current_user
from src.auth.jwt import decode_token_string
from src.db.connection import engine
from chatkit.server import StreamingResult

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
    print(f"[AUTH] get_current_user_optional called")
    print(f"[AUTH] authorization header: {authorization[:50] if authorization else 'None'}...")

    if not authorization:
        print("[AUTH] No authorization header, returning None")
        return None

    # Extract token from "Bearer <token>" format
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization

    print(f"[AUTH] Token extracted (first 20 chars): {token[:20] if token else 'None'}...")

    # Handle implicit/frontend usage where "null" might be sent as string
    if token == "null" or token == "undefined":
        print("[AUTH] Token is 'null' or 'undefined', returning None")
        return None

    try:
        payload = decode_token_string(token)
        print(f"[AUTH] Token verified successfully: {payload}")
        return payload
    except Exception as e:
        print(f"[AUTH] Token verification failed: {e}")
        return None


@router.post("/chat", response_model=None)
async def chat_endpoint(
    request: Request,
    current_user: dict | None = Depends(get_current_user_optional),
):
    """ChatKit protocol endpoint for AI-powered chat.

    Supports:
    - threads.list: List conversation threads
    - threads.get: Get specific thread
    - messages.create: Send message (returns streaming response)
    - messages.list: List thread messages

    Authentication is optional for chat, but required for task operations.
    Includes manual session management to support streaming responses.
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

    user_id = current_user.get("sub") if current_user else None

    try:
        # Pre-parse to determine handling strategy
        try:
            request_data = json.loads(body)
        except json.JSONDecodeError:
            return JSONResponse(
                status_code=400,
                content={"error": "Invalid JSON in request body"},
            )

        request_type = request_data.get("type", "")

        # 1. STREAMING REQUESTS (messages.create)
        # ---------------------------------------------------------------------
        if request_type == "messages.create":

            async def stream_generator():
                # Manually manage session lifecycle to ensure it stays open during stream
                async with AsyncSession(engine) as session:
                    context = {
                        "user_id": user_id,
                        "session": session,
                    }

                    # Process using standard server.process which calls respond->agent
                    # ChatKit expects raw bytes, not decoded string
                    result = await server.process(body, context)

                    if isinstance(result, StreamingResult):
                        async for chunk in result:
                            yield chunk
                    else:
                        # Fallback if somehow messages.create returns non-stream results
                        # result.json is already bytes, yield directly
                        yield result.json

            return StreamingResponse(
                stream_generator(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no", # Nginx no-buffer
                },
            )

        # 2. STANDARD REQUESTS (threads.list, history, etc)
        # ---------------------------------------------------------------------
        else:
            async with AsyncSession(engine) as session:
                context = {
                    "user_id": user_id,
                    "session": session,
                }

                # ChatKit expects raw bytes, not decoded string
                result = await server.process(body, context)

                if isinstance(result, StreamingResult):
                     # Should not happen for non-streaming types, but safe fallback
                     return StreamingResponse(result, media_type="text/event-stream")

                # NonStreamingResult.json is already serialized bytes, use Response not JSONResponse
                return Response(content=result.json, media_type="application/json")

    except Exception as e:
        print(f"[Chat Endpoint Error]: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "message": str(e),
            },
        )
