# Research: Dapr Integration & Event-Driven Architecture

**Branch**: `014-dapr-integration`
**Created**: 2026-02-07

---

## Research Summary

This document captures technical research and decisions for Module 2 Dapr integration.

---

## R1: Dapr Communication Pattern

### Decision
Use **httpx HTTP API** to Dapr sidecar instead of `dapr-client` SDK.

### Rationale
- Simpler: No external Dapr/Kafka libraries needed (httpx is already a dependency)
- Portable: Same pattern works across Python, TypeScript, Go
- Less coupling: App only depends on HTTP, not Dapr SDK internals
- Easier testing: Mock HTTP calls vs mock SDK classes

### Pattern
```python
import httpx

DARP_HTTP_PORT = int(os.getenv("DAPR_HTTP_PORT", "3500"))
PUBSUB_NAME = "taskpubsub"

async def publish_event(topic: str, data: dict) -> bool:
    """Publish event via Dapr sidecar HTTP API."""
    url = f"http://localhost:{DAPR_HTTP_PORT}/v1.0/publish/{PUBSUB_NAME}/{topic}"
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=data)
        return response.status_code == 204
```

### Alternatives Considered
| Option | Verdict | Reason |
|--------|---------|--------|
| dapr-client SDK | Rejected | Adds dependency, SDK internals change between versions |
| dapr-ext-fastapi | Keep for subscriptions | Useful for declarative subscription routes |
| Direct Kafka client | Rejected | Defeats purpose of Dapr abstraction |

---

## R2: Event Publishing Pattern

### Decision
Use **fire-and-forget** event publishing with async callbacks.

### Rationale
- Task operations should not fail if Kafka is temporarily unavailable
- Events are supplementary (notifications) not critical (data persistence)
- Database transaction completes first, then event is published
- Failures are logged but don't roll back the main operation

### Pattern
```python
# After successful DB commit
try:
    async with DaprClient() as client:
        await client.publish_event(...)
except Exception as e:
    logger.warning(f"Event publish failed: {e}")
    # Do NOT re-raise - fire and forget
```

### Alternatives Considered
| Option | Verdict | Reason |
|--------|---------|--------|
| Transactional outbox | Deferred | Overkill for demo; consider for production |
| Synchronous publish | Rejected | Blocks main request on Kafka |

---

## R3: Kafka Deployment Strategy

### Decision
Use Strimzi KRaft mode (no ZooKeeper) with single-node for development.

### Rationale
- KRaft mode is production-ready since Kafka 3.4
- Eliminates ZooKeeper complexity
- Single replica acceptable for local/dev environment
- Strimzi operator manages lifecycle via CRDs

### Configuration
- **Brokers**: 1 (dev) / 3 (prod)
- **Partitions**: 3 per topic for basic parallelism
- **Retention**: 7 days (default)

### Alternatives Considered
| Option | Verdict | Reason |
|--------|---------|--------|
| Redis pub/sub | Rejected | Spec requires Kafka |
| ZooKeeper mode | Rejected | Deprecated, more complex |

---

## R4: Dapr Sidecar Injection

### Decision
Use pod annotations in Helm templates for sidecar injection.

### Rationale
- Non-invasive: only YAML changes needed
- Works automatically with Dapr operator
- Per-deployment customization possible

### Required Annotations
```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "backend"
  dapr.io/app-port: "8000"
```

---

## R5: Secrets Management

### Decision
Use Dapr Kubernetes secrets store for database credentials.

### Rationale
- Consistent with existing K8s secrets (already in place from Phase 4)
- No code changes needed beyond Dapr SDK calls
- Centralizes secret access through Dapr API

### Implementation
```python
with DaprClient() as client:
    secret = client.get_secret("kubernetes-secrets", "backend-secrets")
    db_url = secret.secret["DATABASE_URL"]
```

---

## R6: Reminder Scheduler Implementation

### Decision
Use Dapr Jobs API for scheduled reminder checks.

### Rationale
- Jobs API (introduced in Dapr 1.11) provides cron-like scheduling
- Triggers HTTP endpoints on schedule
- Survives pod restarts (persistent scheduling)

### Alternative Considered
| Option | Verdict | Reason |
|--------|---------|--------|
| APScheduler (Python) | Rejected | Doesn't survive restarts |
| Kubernetes CronJob | Possible | Adds K8s complexity, less Dapr-native |
| Dapr Actors with reminders | Possible | More complex for simple periodic tasks |

---

## R7: Notification Service Architecture

### Decision
Create separate `notification-service/` Python microservice.

### Rationale
- Decouples notification delivery from backend
- Independent scaling based on event volume
- Clean separation: backend publishes, notification-service consumes
- Existing `notification_service.py` writes to DB; new service handles external delivery

### Structure
```text
notification-service/
├── src/
│   ├── main.py          # FastAPI + DaprApp
│   ├── handlers/        # Event handler functions
│   ├── notifiers/       # Email, webhook, console (mock)
│   └── models.py        # Event Pydantic models
├── Dockerfile
├── pyproject.toml
└── tests/
```

---

## R8: Event Schema Design

### Decision
Use CloudEvents-compatible JSON with explicit type field.

### Schema
```json
{
  "event_type": "TaskCreated",
  "task_id": "uuid",
  "user_id": "uuid",
  "title": "string",
  "due_date": "ISO8601 | null",
  "timestamp": "ISO8601"
}
```

### Rationale
- CloudEvents is industry standard for event interoperability
- Dapr pub/sub adds CloudEvents envelope automatically
- Explicit `event_type` enables routing in subscribers

---

## R9: Existing Code Integration

### Decision
Wrap existing service functions; do NOT replace.

### Key Functions to Wrap
| Service | Function | Event |
|---------|----------|-------|
| `task_service.py` | `create_task()` | `TaskCreatedEvent` |
| `task_service.py` | `toggle_task_completion()` | `TaskCompletedEvent` |
| `reminder_service.py` | `process_due_reminders()` | `TaskDueReminderEvent` |

### Pattern
```python
# In src/events/publisher.py
async def publish_task_created(task: Task):
    """Called AFTER task_service.create_task() succeeds."""
    ...
```

---

## Dependencies Summary

### Backend (new packages)
```toml
# pyproject.toml additions
[project.dependencies]
httpx = "^0.27.0"  # Already present, used for Dapr HTTP API
# dapr-client NOT needed - using httpx HTTP API instead
```

### Consumer Services (each service)
```toml
[project.dependencies]
fastapi = "^0.115.0"
uvicorn = "^0.32.0"
httpx = "^0.27.0"
structlog = "^24.0.0"
pydantic = "^2.0.0"
```

### Infrastructure
- Dapr 1.14+ (Helm chart)
- Strimzi Kafka Operator (Helm chart)
- Kafka 3.7+ (Strimzi-managed)

---

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Which Dapr version? | 1.14.0 (latest stable with Jobs API) |
| Kafka auth type? | none (internal cluster, no TLS for dev) |
| Event delivery guarantee? | At-least-once (standard pub/sub) |
| Schema registry needed? | No (JSON format sufficient for demo) |
| httpx vs dapr-client? | httpx HTTP API (simpler, no SDK dependency) |
| How many consumer services? | 4 (notification, recurring, audit, websocket) |

---

## R10: Four Consumer Services Architecture

### Decision
Create 4 separate consumer microservices per SDD requirements.

### Services
| Service | Topic | Purpose |
|---------|-------|--------|
| `notification-service` | `reminder-events` | Send external notifications |
| `recurring-service` | `task-events` | Create next occurrence on completion |
| `audit-service` | `task-events` | Log all activity for history |
| `websocket-service` | `task-updates` | Push real-time updates to clients |

### Rationale
- SDD Use Cases 1-4 each require dedicated consumer
- Independent scaling per workload
- Clear separation of concerns

### Shared Patterns
- Graceful shutdown with active request tracking
- CloudEvents wrapper model for incoming events
- Structured logging with `structlog`
- Health endpoint at `/health`
