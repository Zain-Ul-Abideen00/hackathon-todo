"""Audit Service - Activity logging for all task events.

This service subscribes to task-events and maintains an audit log
of all task-related activities for compliance and analytics.
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

# In-memory audit log (would be database in production)
audit_log: list[dict] = []


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("📋 Starting Audit Service...")
    yield
    logger.info("👋 Shutting down Audit Service...")
    logger.info("📊 Total audit entries: %d", len(audit_log))


# Create FastAPI app
app = FastAPI(
    title="Audit Service",
    description="Activity logging service for Todo Web App",
    version="0.1.0",
    lifespan=lifespan,
)

# Register routes
app.include_router(handlers_router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint with service info."""
    return {
        "service": "audit-service",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "audit": "/api/audit/handle",
            "log": "/api/audit/log",
        },
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "audit-service", "entries": len(audit_log)}


@app.get("/api/audit/log")
async def get_audit_log(limit: int = 50):
    """Get recent audit log entries."""
    return {"entries": audit_log[-limit:], "total": len(audit_log)}
