"""API Routes for Notification Service."""

from fastapi import APIRouter

from src.api.handlers import router as handlers_router

router = APIRouter()

# Include handlers
router.include_router(handlers_router, prefix="/api")
