"""Audit Service - Event handlers for task audit logging."""

import logging
from datetime import datetime
from pydantic import BaseModel

from fastapi import APIRouter

logger = logging.getLogger(__name__)
router = APIRouter()

# Reference to main app's audit_log (will be imported)
audit_log: list[dict] = []


class CloudEvent(BaseModel):
    """CloudEvents wrapper for Dapr pub/sub messages."""

    id: str
    source: str
    specversion: str = "1.0"
    type: str
    datacontenttype: str = "application/json"
    data: dict


class AuditEntry(BaseModel):
    """Audit log entry structure."""

    timestamp: str
    event_id: str
    event_type: str
    user_id: str
    task_id: int | None = None
    action: str
    details: dict


@router.post("/audit/handle")
async def handle_audit_event(event: CloudEvent) -> dict:
    """Handle task events for audit logging.

    Records all task-related events for compliance and analytics.

    Args:
        event: CloudEvent wrapper with task event data

    Returns:
        Acknowledgment for Dapr
    """
    logger.info(
        "📋 Received audit event: id=%s, type=%s",
        event.id,
        event.type,
    )

    try:
        # Create audit entry
        entry = AuditEntry(
            timestamp=datetime.utcnow().isoformat(),
            event_id=event.id,
            event_type=event.data.get("event_type", "unknown"),
            user_id=event.data.get("user_id", "unknown"),
            task_id=event.data.get("task_id"),
            action=event.data.get("event_type", "unknown"),
            details=event.data,
        )

        # Add to audit log
        audit_log.append(entry.model_dump())

        logger.info(
            "✅ Audit entry created: %s - task_id=%s, user=%s",
            entry.action,
            entry.task_id,
            entry.user_id[:8] + "..." if entry.user_id else "N/A",
        )

        return {"status": "SUCCESS"}

    except Exception as e:
        logger.error("Error creating audit entry: %s", str(e))
        return {"status": "RETRY"}


@router.get("/audit/health")
async def audit_health() -> dict:
    """Health check for audit handler."""
    return {"status": "ok", "handler": "audit", "entries": len(audit_log)}
