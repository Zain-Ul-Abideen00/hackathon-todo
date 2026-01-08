"""
Todo Web App - FastAPI Backend.

This module configures and runs the FastAPI application with:
- CORS middleware for frontend communication
- Router configuration for modular endpoints
- Lifespan events for startup/shutdown
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import health


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.

    Handles startup and shutdown events:
    - Startup: Initialize database connections, load config
    - Shutdown: Close connections, cleanup resources
    """
    # Startup
    print("🚀 Starting Todo Web App Backend...")
    # TODO: Initialize database connection in Module 2
    # TODO: Load environment configuration

    yield

    # Shutdown
    print("👋 Shutting down Todo Web App Backend...")
    # TODO: Close database connections


# Create FastAPI application
app = FastAPI(
    title="Todo Web App API",
    description="FastAPI backend for Todo Web Application with Better Auth integration",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
# TODO: Move origins to environment configuration
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint redirecting to API documentation."""
    return {
        "message": "Todo Web App API",
        "docs": "/docs",
        "health": "/api/health",
    }
