# Dapr Components

This directory contains Dapr component configurations for local development with Redis.

## Components

| File | Component | Description |
|------|-----------|-------------|
| `pubsub.yaml` | Redis Pub/Sub | Event messaging via Redis (from `dapr init`) |
| `statestore.yaml` | In-memory State | State management for local testing |
| `subscription-reminders.yaml` | Reminder Sub | Routes reminder-events to notification-service |
| `subscription-tasks.yaml` | Task Sub | Routes task-events to notification-service |
| `subscription-recurring.yaml` | Recurring Sub | Routes task-events to recurring-service |
| `subscription-audit.yaml` | Audit Sub | Routes task-events to audit-service |
| `subscription-websocket.yaml` | WebSocket Sub | Routes task-events to websocket-service |

## Architecture

```
┌─────────────────┐    publish     ┌───────────────┐
│     Backend     │ ─────────────▶ │   taskpubsub  │
│   (app: 8000)   │                │    (Redis)    │
│   (dapr: 3500)  │                └───────┬───────┘
└─────────────────┘                        │
                                           │ subscribe
        ┌──────────────────────────────────┼──────────────────────────────────┐
        │                    │             │             │                    │
        ▼                    ▼             ▼             ▼                    ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ Notification  │  │  Recurring    │  │    Audit      │  │  WebSocket    │  │   Frontend    │
│   (8001)      │  │   (8002)      │  │   (8003)      │  │   (8004)      │  │   (3000)      │
└───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘
```

## Topics

| Topic | Publishers | Subscribers |
|-------|-----------|-------------|
| `task-events` | backend | notification, recurring, audit, websocket |
| `reminder-events` | backend | notification |

## Event Types

- **TaskCreatedEvent**: Published when a new task is created
- **TaskCompletedEvent**: Published when a task is marked complete
- **TaskDueReminderEvent**: Published when a reminder is due

## Local Development

### Prerequisites

1. Docker running (for Redis from `dapr init`)
2. Dapr CLI installed: `dapr init`

### Start All Services

```powershell
# From todo-web-app directory
.\run-all-services.ps1
```

### Test Pub/Sub

```powershell
# Publish a test event
Invoke-RestMethod -Method POST `
  -Uri "http://localhost:3500/v1.0/publish/taskpubsub/task-events" `
  -ContentType "application/json" `
  -Body '{"event_type":"TaskCreated","task_id":999,"user_id":"test","title":"Test","timestamp":"2026-02-08T00:00:00Z"}'
```

### View Dapr Dashboard

```bash
dapr dashboard
```

## Kubernetes Deployment

For Kubernetes deployment with Kafka, see:
- `k8s/cloud/kafka/` - Strimzi Kafka cluster
- `specs/014-dapr-integration/` - Full deployment plan
