"""Recurring Service - Task event consumer for recurring task management.

This service subscribes to task-events and handles recurring task logic,
creating the next task occurrence when a recurring task is completed.
"""

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI

from src.api.handlers import router as handlers_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("🔄 Starting Recurring Service...")
    yield
    logger.info("👋 Shutting down Recurring Service...")


# Create FastAPI app
app = FastAPI(
    title="Recurring Service",
    description="Handles recurring task logic for Todo Web App",
    version="0.1.0",
    lifespan=lifespan,
)

# Register routes
app.include_router(handlers_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint with service info."""
    return {
        "service": "recurring-service",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "tasks": "/api/tasks/handle",
        },
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "recurring-service"}
