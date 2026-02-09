# Notification Service

Dapr pub/sub consumer for handling reminder events from Kafka.

## Overview

This microservice subscribes to the `reminder-events` Kafka topic via Dapr
and delivers notifications through various channels.

## Architecture

```text
┌─────────────┐    ┌───────┐    ┌───────────────────┐
│   Backend   │───▶│ Kafka │───▶│ notification-svc  │
│ (Publisher) │    │       │    │ (Consumer)        │
└─────────────┘    └───────┘    └───────────────────┘
                        │              │
                   Dapr Pub/Sub        ▼
                                 Deliver Notification
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/reminders/handle` | Dapr subscription callback |
| GET | `/health` | Health check |
| GET | `/api/reminders/health` | Handler health |

## Dapr Configuration

The subscription is defined in `dapr/subscriptions/reminders.yaml`:

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: reminder-subscription
spec:
  pubsubname: kafka-pubsub
  topic: reminder-events
  route: /api/reminders/handle
scopes:
  - notification-service
```

## Local Development

```bash
# Install dependencies
uv sync

# Run without Dapr
uv run uvicorn src.main:app --reload --port 8001

# Run with Dapr sidecar
dapr run --app-id notification-service --app-port 8001 \
  -- uv run uvicorn src.main:app --port 8001
```

## Event Schema

Events follow CloudEvents specification:

```json
{
  "id": "uuid",
  "source": "backend",
  "type": "TaskDueReminder",
  "data": {
    "task_id": 123,
    "user_id": "uuid",
    "title": "Task Title",
    "urgency": "soon",
    "time_until_due": 3600
  }
}
```
