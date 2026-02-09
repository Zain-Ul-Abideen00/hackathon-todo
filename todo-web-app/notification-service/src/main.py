"""Notification Service - Dapr Pub/Sub Consumer.

This service handles reminder events from Kafka via Dapr's pub/sub
and delivers notifications through various channels (email, push, etc.).
"""

from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator
import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI

load_dotenv()

from src.api.routes import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager."""
    logger.info("🔔 Starting Notification Service...")
    yield
    logger.info("👋 Shutting down Notification Service...")


app = FastAPI(
    title="Notification Service",
    description="Handles reminder events and delivers notifications",
    version="0.1.0",
    lifespan=lifespan,
)

# Include routes
app.include_router(api_router)


@app.get("/")
async def root() -> dict:
    """Root endpoint."""
    return {
        "service": "notification-service",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "reminders": "/api/reminders/handle",
        },
    }


@app.get("/health")
async def health() -> dict:
    """Health check endpoint."""
    return {"status": "healthy", "service": "notification-service"}
