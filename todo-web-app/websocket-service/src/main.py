"""WebSocket Service - Real-time task updates broadcast.

This service subscribes to task-updates and broadcasts them
to connected WebSocket clients for real-time UI updates.
"""

from contextlib import asynccontextmanager
import logging
from typing import Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect

from src.api.handlers import router as handlers_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Active WebSocket connections (user_id -> set of connections)
connections: dict[str, Set[WebSocket]] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("🔌 Starting WebSocket Service...")
    yield
    # Close all connections on shutdown
    for user_id, ws_set in connections.items():
        for ws in ws_set:
            try:
                await ws.close()
            except Exception:
                pass
    logger.info("👋 Shutting down WebSocket Service...")
    logger.info("📊 Total active connections: %d", sum(len(s) for s in connections.values()))


# Create FastAPI app
app = FastAPI(
    title="WebSocket Service",
    description="Real-time task updates for Todo Web App",
    version="0.1.0",
    lifespan=lifespan,
)

# Register routes
app.include_router(handlers_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint with service info."""
    return {
        "service": "websocket-service",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "ws": "/ws/{user_id}",
            "updates": "/api/updates/handle",
        },
        "active_connections": sum(len(s) for s in connections.values()),
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "websocket-service",
        "connections": sum(len(s) for s in connections.values()),
    }


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time task updates.

    Clients connect here to receive live updates when tasks are
    created, updated, or completed.

    Args:
        websocket: WebSocket connection
        user_id: User ID for filtering updates
    """
    await websocket.accept()
    logger.info("🔌 WebSocket connected: user=%s", user_id[:8] + "...")

    # Add to connections
    if user_id not in connections:
        connections[user_id] = set()
    connections[user_id].add(websocket)

    try:
        # Keep connection alive and listen for messages
        while True:
            data = await websocket.receive_text()
            # Echo back for now (could handle client commands)
            await websocket.send_json({"type": "echo", "data": data})
    except WebSocketDisconnect:
        logger.info("🔌 WebSocket disconnected: user=%s", user_id[:8] + "...")
    finally:
        # Remove from connections
        if user_id in connections:
            connections[user_id].discard(websocket)
            if not connections[user_id]:
                del connections[user_id]


async def broadcast_to_user(user_id: str, message: dict):
    """Broadcast a message to all connections for a user.

    Args:
        user_id: Target user ID
        message: JSON message to send
    """
    if user_id in connections:
        for ws in connections[user_id].copy():
            try:
                await ws.send_json(message)
            except Exception as e:
                logger.warning("Failed to send to WebSocket: %s", str(e))
                connections[user_id].discard(ws)
