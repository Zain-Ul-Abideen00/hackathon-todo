"""Scheduler routes for Dapr Jobs API integration.

This module provides endpoints for Dapr's Jobs API to trigger
scheduled operations like reminder checks. The Jobs API calls
these endpoints on a schedule defined in the job configuration.

Usage:
    Dapr Jobs API triggers POST /api/jobs/trigger with payload:
    {
        "job_name": "reminder-check",
        "scheduled_time": "2024-01-01T12:00:00Z"
    }
"""

import logging
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession

from src.api.deps import get_session
from src.events import get_publisher
from src.services.reminder_service import process_due_reminders

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/jobs", tags=["scheduler"])


class JobTriggerPayload(BaseModel):
    """Payload from Dapr Jobs API callback."""

    job_name: str
    scheduled_time: str | None = None
    data: dict[str, Any] | None = None


class JobTriggerResponse(BaseModel):
    """Response to Dapr Jobs API callback."""

    success: bool
    job_name: str
    processed_count: int = 0
    message: str


@router.post("/trigger", response_model=JobTriggerResponse)
async def handle_job_trigger(
    payload: JobTriggerPayload,
    session: AsyncSession = Depends(get_session),
) -> JobTriggerResponse:
    """Handle Dapr Jobs API trigger callback.

    This endpoint is called by Dapr Jobs API on a schedule.
    Routes to appropriate handler based on job_name.

    Args:
        payload: Job trigger information from Dapr
        session: Database session

    Returns:
        JobTriggerResponse with processing results
    """
    logger.info(
        "Job trigger received: job_name=%s, scheduled_time=%s",
        payload.job_name,
        payload.scheduled_time,
    )

    if payload.job_name == "reminder-check":
        return await _handle_reminder_check(session)

    logger.warning("Unknown job name: %s", payload.job_name)
    return JobTriggerResponse(
        success=False,
        job_name=payload.job_name,
        message=f"Unknown job: {payload.job_name}",
    )


async def _handle_reminder_check(session: AsyncSession) -> JobTriggerResponse:
    """Process due reminders and publish events.

    Checks for due reminders, creates notifications, and publishes
    TaskDueReminderEvent to Kafka for notification-service.

    Args:
        session: Database session

    Returns:
        JobTriggerResponse with count of processed reminders
    """
    try:
        # Process reminders using existing service
        count = await process_due_reminders(session)

        logger.info("Processed %d due reminders", count)

        return JobTriggerResponse(
            success=True,
            job_name="reminder-check",
            processed_count=count,
            message=f"Processed {count} due reminders",
        )

    except Exception as e:
        logger.error("Error processing reminders: %s", str(e))
        return JobTriggerResponse(
            success=False,
            job_name="reminder-check",
            message=f"Error: {str(e)}",
        )


@router.get("/health")
async def scheduler_health() -> dict:
    """Health check for scheduler endpoints."""
    return {"status": "ok", "service": "scheduler"}
