"""
Todo Web App - FastAPI Backend.

This module configures and runs the FastAPI application with:
- CORS middleware for frontend communication
- Rate limiting middleware (100 req/min per user - FR-016)
- Router configuration for modular endpoints
- Custom exception handlers for validation errors
- Lifespan events for startup/shutdown
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables explicitly
load_dotenv()
from fastapi.responses import JSONResponse
from pydantic import ValidationError
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from src.api.deps import limiter
from src.api.routes import health
from src.api.routes.tasks import router as tasks_router
from src.api.routes.tags import router as tags_router
from src.api.routes.notifications import router as notifications_router
from src.api.routes.scheduler import router as scheduler_router
from src.chat.routes import router as chat_router


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

    # Warmup: Ping database to establish connection and avoid cold start timeouts
    # This is critical for Neon PostgreSQL which has serverless cold starts
    try:
        import asyncio
        from sqlalchemy import text
        from src.db.connection import engine
        from sqlmodel.ext.asyncio.session import AsyncSession

        print("📡 Warming up database connection (10s timeout)...")
        async with asyncio.timeout(10):  # 10 second timeout to avoid blocking reload
            async with AsyncSession(engine) as session:
                await session.execute(text("SELECT 1"))
                await session.commit()
        print("✅ Database connection ready!")
    except asyncio.TimeoutError:
        print("⚠️ Database warmup timed out - will connect on first request")
    except Exception as e:
        print(f"⚠️ Database warmup failed (will retry on first request): {e}")

    # Start Reminder Loop
    import asyncio
    from src.db.connection import engine
    from sqlmodel.ext.asyncio.session import AsyncSession
    from src.services.reminder_service import process_due_reminders

    async def reminder_loop():
        print("⏰ Reminder loop started")
        while True:
            try:
                # Use a fresh session for each check
                async with AsyncSession(engine) as session:
                    count = await process_due_reminders(session)
                    if count > 0:
                        print(f"🔔 Triggered {count} reminders")
            except Exception as e:
                print(f"⚠️ Error in reminder loop: {e}")

            # Check for overdue tasks
            try:
                from src.services.overdue_service import process_overdue_tasks
                async with AsyncSession(engine) as session:
                    overdue_count = await process_overdue_tasks(session)
                    if overdue_count > 0:
                        print(f"⏰ Marked {overdue_count} tasks as overdue")
            except Exception as e:
                print(f"⚠️ Error in overdue loop: {e}")

            await asyncio.sleep(15)  # Check every 15 seconds for near real-time reminders

    # Store task reference to prevent garbage collection
    reminder_task = asyncio.create_task(reminder_loop())

    yield

    # Shutdown
    reminder_task.cancel()
    try:
        await reminder_task
    except asyncio.CancelledError:
        print("⏰ Reminder loop stopped")

    print("👋 Shutting down Todo Web App Backend...")


# Create FastAPI application
app = FastAPI(
    title="Todo Web App API",
    description="FastAPI backend for Todo Web Application with Better Auth integration",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global Exception Logic for Debugging (Re-added)
@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as e:
        import traceback
        print(f"🔥 GLOBAL UNHANDLED EXCEPTION 🔥: {e}")
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"message": "Internal Server Error", "detail": str(e)},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
            },
        )

# Configure CORS from environment (comma-separated origins)
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
CORS_ORIGINS = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom exception handlers


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """Handle Pydantic validation errors with consistent error format."""
    errors = []
    for error in exc.errors():
        errors.append(
            {
                "field": ".".join(str(loc) for loc in error["loc"]),
                "message": error["msg"],
            }
        )

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "code": "VALIDATION_ERROR",
            "message": "Request validation failed",
            "details": errors,
        },
    )


# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(tasks_router, prefix="/api", tags=["Tasks"])
app.include_router(tags_router, prefix="/api", tags=["Tags"])
app.include_router(notifications_router, prefix="/api", tags=["Notifications"])
app.include_router(chat_router, prefix="/api", tags=["Chat"])
app.include_router(scheduler_router, tags=["Scheduler"])


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint redirecting to API documentation."""
    return {
        "message": "Todo Web App API",
        "docs": "/docs",
        "health": "/api/health",
        "tasks": "/api/{user_id}/tasks",
    }
