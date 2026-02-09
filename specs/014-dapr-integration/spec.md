# Feature Specification: Dapr Integration & Event-Driven Architecture

**Feature Branch**: `014-dapr-integration`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Dapr Integration & Event-Driven Architecture (Module 2)"

---

## IMPORTANT CONTEXT

Module 1 features are **ALREADY IMPLEMENTED** in this project:

| Component           | Status   | Location                                                |
| ------------------- | -------- | ------------------------------------------------------- |
| Tag Model           | ✅ Exists | `src/models/tag.py`, `src/services/tag_service.py`      |
| RecurringPattern    | ✅ Exists | `src/models/recurring.py`, `src/services/recurring_service.py` |
| Reminder Model      | ✅ Exists | `src/models/reminder.py`, `src/services/reminder_service.py` |
| Notification Model  | ✅ Exists | `src/models/notification.py`, `src/services/notification_service.py` |
| Task Relationships  | ✅ Exists | Task model has relationships to Tags, Recurring, Reminders, Notifications |

**The goal of Module 2 is to ADD Dapr/Kafka event publishing on top of existing services, NOT to rewrite them.**

---

## User Scenarios & Testing

### User Story 1 - Publish Task Events to Kafka (Priority: P1)

As a system, I can publish task lifecycle events to Kafka via Dapr pub/sub so that downstream services can react to task changes in real-time.

**Why this priority**: Core foundation for event-driven architecture. All other features depend on reliable event publishing.

**Independent Test**: Can be tested by creating/completing/deleting a task and observing events arrive in Kafka topics.

**Acceptance Scenarios**:

1. **Given** a user creates a new task, **When** the task is saved to the database, **Then** a `TaskCreatedEvent` is published to the `task-events` Kafka topic within 2 seconds
2. **Given** a user marks a task complete, **When** the status changes, **Then** a `TaskCompletedEvent` is published to the `task-events` topic
3. **Given** Kafka is temporarily unavailable, **When** an event fails to publish, **Then** the task operation still succeeds (fire-and-forget) and the failure is logged

---

### User Story 2 - Scheduled Reminder Job Processing (Priority: P1)

As a system, I can process scheduled reminders and publish notification events so that users receive timely due-date alerts.

**Why this priority**: Enables proactive user notifications, critical for task management utility.

**Independent Test**: Can be tested by creating a task with a due date approaching, and observing the reminder job publish events.

**Acceptance Scenarios**:

1. **Given** a Dapr scheduled job runs every 15 minutes, **When** tasks have due dates within the reminder threshold, **Then** `TaskDueReminderEvent` events are published to the `reminder-events` topic
2. **Given** the existing `reminder_service.py` identifies due tasks, **When** the Dapr job triggers, **Then** it wraps the service call and publishes events
3. **Given** no tasks are due, **When** the scheduled job runs, **Then** no events are published and the job completes silently

---

### User Story 3 - Consume Reminder Events for Notifications (Priority: P2)

As a system, I can consume reminder events and process external notifications so that users are informed via email or webhook.

**Why this priority**: Completes the notification flow. Depends on P1 event publishing being in place.

**Independent Test**: Can be tested by publishing a synthetic reminder event and verifying the notification-service receives and processes it.

**Acceptance Scenarios**:

1. **Given** a `TaskDueReminderEvent` is published, **When** the notification-service subscribes to `reminder-events`, **Then** it receives the event within 5 seconds
2. **Given** the notification-service receives an event, **When** processing completes, **Then** an external notification is sent (mock for demo: logged to console)
3. **Given** event processing fails, **When** an error occurs, **Then** the event is logged for retry and the service continues processing other events

---

### User Story 4 - Secrets from Dapr Secrets Store (Priority: P2)

As DevOps, application secrets come from Dapr secrets store so that sensitive configuration is centrally managed and secure.

**Why this priority**: Security best practice. Enables consistent secret management across all services.

**Independent Test**: Can be tested by deploying the application and verifying it retrieves database credentials from Dapr secrets store.

**Acceptance Scenarios**:

1. **Given** database credentials are stored in Kubernetes secrets, **When** the backend starts, **Then** it retrieves `DATABASE_URL` via Dapr secrets store API
2. **Given** secrets are updated in Kubernetes, **When** the application restarts, **Then** it picks up the new secret values
3. **Given** a secret is missing, **When** the application starts, **Then** it fails fast with a clear error message

---

### User Story 5 - Service-to-Service Communication via Dapr (Priority: P3)

As a developer, services communicate via Dapr service invocation so that service discovery and retries are handled transparently.

**Why this priority**: Enhances reliability but not critical for initial deployment. Can be added incrementally.

**Independent Test**: Can be tested by having notification-service call backend API through Dapr service invocation.

**Acceptance Scenarios**:

1. **Given** notification-service needs task details, **When** it calls backend via Dapr, **Then** the request is routed through Dapr sidecars
2. **Given** the backend is temporarily unavailable, **When** Dapr retries the request, **Then** eventual success is achieved without caller changes
3. **Given** services are deployed in Kubernetes, **When** using Dapr app-id, **Then** no hardcoded URLs are needed

---

### User Story 6 - Independent Service Scaling (Priority: P3)

As DevOps, I can scale services independently so that resource utilization is optimized for each workload.

**Why this priority**: Operational excellence. Kafka/Dapr naturally supports this pattern.

**Independent Test**: Can be tested by scaling notification-service to 3 replicas and verifying events are load-balanced.

**Acceptance Scenarios**:

1. **Given** multiple notification-service replicas are running, **When** events are published, **Then** Kafka distributes them across consumers
2. **Given** backend is under high load, **When** scaling to 5 replicas, **Then** Dapr sidecars handle event publishing from all replicas
3. **Given** services have different resource needs, **When** scaling independently, **Then** Kubernetes HPA can be configured per service

---

### Edge Cases

- What happens when Kafka is unavailable during event publishing? → Fire-and-forget; log error, don't fail the main operation
- What happens when a consumer crashes mid-processing? → Kafka consumer group rebalances; message reprocessed
- What happens when duplicate events are received? → Consumers must be idempotent (use task_id as deduplication key)
- What happens when Dapr sidecar is not ready? → Healthcheck fails; pod doesn't receive traffic until sidecar is ready
- What happens when secrets store is unavailable? → Application fails to start; clear error in logs

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST publish `TaskCreatedEvent` when a new task is created
- **FR-002**: System MUST publish `TaskCompletedEvent` when a task is marked complete
- **FR-003**: System MUST publish `TaskDueReminderEvent` for tasks approaching their due date
- **FR-004**: System MUST run a scheduled job every 15 minutes to check for due reminders
- **FR-005**: System MUST subscribe `notification-service` to the `reminder-events` topic
- **FR-006**: System MUST retrieve application secrets via Dapr secrets store API
- **FR-007**: System MUST inject Dapr sidecar into all application pods
- **FR-008**: System MUST configure Kafka pub/sub component with Strimzi-managed broker
- **FR-009**: System MUST configure Kubernetes secrets store component
- **FR-010**: System MUST support service-to-service calls via Dapr service invocation

### Key Entities

- **TaskCreatedEvent**: `{event_type, task_id, user_id, title, due_date, created_at}`
- **TaskCompletedEvent**: `{event_type, task_id, user_id, completed_at}`
- **TaskDueReminderEvent**: `{event_type, task_id, user_id, due_date, time_until_due, reminder_id}`
- **TaskUpdateEvent**: `{event_type, task_id, user_id, action, task_data, timestamp}` (real-time sync)
- **RecurringTaskTriggerEvent**: `{event_type, pattern_id, task_id}` (future enhancement)

### Infrastructure Components

| Component           | Purpose                          | Location                         |
| ------------------- | -------------------------------- | -------------------------------- |
| Dapr Pub/Sub        | Kafka event publishing/consuming | `todo-web-app/dapr/pubsub.yaml`  |
| Dapr Secrets Store  | Kubernetes secrets access        | `todo-web-app/dapr/secretstore.yaml` |
| Dapr State Store    | PostgreSQL state management      | `todo-web-app/dapr/statestore.yaml`  |
| Dapr Jobs API       | Exact-time reminder scheduling   | Built-in (HTTP API)              |
| Kafka Cluster       | Event streaming (3 topics)       | `todo-web-app/k8s/kafka/`        |
| Notification Service| Reminder event consumer          | `todo-web-app/notification-service/` |
| Recurring Service   | Task event consumer              | `todo-web-app/recurring-service/`    |
| Audit Service       | Activity logger                  | `todo-web-app/audit-service/`        |
| WebSocket Service   | Real-time client sync            | `todo-web-app/websocket-service/`    |
| Event Publisher     | Backend httpx publisher          | `backend/src/events/`            |

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Events are published to Kafka within 2 seconds of task operations completing
- **SC-002**: Reminder job successfully executes every 15 minutes (observable in Dapr dashboard)
- **SC-003**: Notification-service receives and processes 100% of published reminder events (no dropped messages)
- **SC-004**: Application startup logs show successful Dapr sidecar connection (no timeout errors)
- **SC-005**: All secrets are retrieved via Dapr (no hardcoded credentials in environment variables)
- **SC-006**: Services can scale independently to 3+ replicas with events load-balanced across consumers
- **SC-007**: System continues operating (with degraded event publishing) when Kafka is temporarily unavailable

---

## Assumptions

1. **Module 1 Complete**: All existing services (tag, recurring, reminder, notification) remain unchanged and functional
2. **Kubernetes Ready**: Minikube or k3d cluster with Dapr installed is available for local development
3. **Strimzi Available**: Strimzi operator can be installed for Kafka cluster management
4. **Development First**: Single-node Kafka cluster is acceptable for development; production scaling is out of scope
5. **Mock Notifications**: External notification delivery (email/SMS) will be mocked with console logging for demo
6. **Event Schema**: Event payloads use JSON format with ISO 8601 timestamps

---

## Technical Notes (for Planning Phase)

The following technical details are for reference during implementation planning:

**Required Skills**:
- `building-with-dapr`: Dapr component configuration, pub/sub patterns, sidecar architecture
- `building-with-kafka-strimzi`: Strimzi operator, Kafka cluster setup, topic management

**Subagent Guidance**:
- `kubernetes-architect`: Design Kafka cluster manifests, Dapr component YAMLs, Helm chart modifications
- `python-pro`: Implement EventPublisher with httpx HTTP API, write 4 consumer services

**Integration Approach**:
- Use httpx HTTP API to Dapr sidecar (no dapr-client SDK dependency)
- Wrap existing service calls with event publishing hooks (after successful DB operations)
- Add Dapr sidecar annotations to existing Helm charts
- Create 4 new consumer microservices with shared patterns (graceful shutdown, CloudEvents)
