# Tasks: Dapr Integration & Event-Driven Architecture

**Input**: Design documents from `/specs/014-dapr-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are optional unless explicitly requested. Manual verification via Dapr dashboard and kubectl.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2...)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `todo-web-app/backend/src/`
- **Services**: `todo-web-app/{notification,recurring,audit,websocket}-service/`
- **Dapr**: `todo-web-app/dapr/`
- **Kubernetes**: `todo-web-app/k8s/`

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Project initialization and Kafka/Dapr infrastructure

- [x] T001 Create kafka namespace manifest at todo-web-app/k8s/cloud/kafka/namespace.yaml
- [x] T002 Install Strimzi operator via Helm (document in todo-web-app/k8s/cloud/kafka/README.md)
- [x] T003 [P] Create Kafka cluster manifest at todo-web-app/k8s/cloud/kafka/cluster.yaml (copy from contracts/kafka-cluster.yaml)
- [x] T004 [P] Create dapr component directory at todo-web-app/dapr/
- [x] T005 [P] Copy pubsub.yaml from contracts/ to todo-web-app/dapr/pubsub.yaml
- [x] T006 [P] Copy statestore.yaml from contracts/ to todo-web-app/dapr/statestore.yaml
- [x] T007 [P] Copy secretstore.yaml from contracts/ to todo-web-app/dapr/secretstore.yaml
- [x] T008 [P] Create subscriptions directory and copy subscription YAMLs to todo-web-app/dapr/subscriptions/

**Checkpoint**: ✅ Kafka cluster and Dapr components ready for deployment

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST complete before user story implementation

**⚠️ CRITICAL**: Verify Kafka cluster is running before proceeding

- [ ] T009 Deploy Kafka namespace (kubectl apply -f namespace.yaml)
- [ ] T010 Deploy Kafka cluster (kubectl apply -f cluster.yaml)
- [ ] T011 Verify Kafka topics created (kubectl get kafkatopics -n kafka)
- [ ] T012 Deploy Dapr components to todo-app namespace (kubectl apply -f dapr/)
- [ ] T013 Verify Dapr components status in Dapr dashboard
- [x] T014 [P] Create events module structure at todo-web-app/backend/src/events/__init__.py
- [x] T015 [P] Create event models in todo-web-app/backend/src/events/models.py (from data-model.md)

**Checkpoint**: Foundation ready - Kafka running, Dapr configured, event models defined

---

## Phase 3: User Story 1 - Publish Task Events to Kafka (Priority: P1) 🎯 MVP

**Goal**: Backend publishes TaskCreatedEvent and TaskCompletedEvent to Kafka via Dapr

**Independent Test**: Create/complete a task, observe events in Kafka using `kubectl exec` to consume from topic

### Implementation for User Story 1

- [x] T016 [US1] Create EventPublisher class with httpx in todo-web-app/backend/src/events/publisher.py
- [x] T017 [US1] Implement publish_task_created() method in publisher.py
- [x] T018 [US1] Implement publish_task_completed() method in publisher.py
- [x] T019 [US1] Implement publish_task_updated() method for real-time sync in publisher.py
- [x] T020 [US1] Add DAPR_ENABLED environment variable toggle in publisher.py
- [x] T021 [US1] Modify task_service.py to import and call publish_task_created after create
- [x] T022 [US1] Modify task_service.py to call publish_task_completed after toggle_completion
- [x] T023 [US1] Modify task_service.py to call publish_task_updated after update operations
- [x] T024 [US1] Add fire-and-forget error handling (log but don't fail) in publisher.py
- [x] T025 [US1] Update backend Helm chart deployment.yaml with Dapr annotations at k8s/local/backend/templates/deployment.yaml

**Checkpoint**: ✅ Backend code ready for event publishing. Verify with: `kubectl logs <backend-pod>` shows publish success

---

## Phase 4: User Story 2 - Scheduled Reminder Job Processing (Priority: P1) ✅

**Goal**: Dapr Jobs API triggers reminder check, publishes TaskDueReminderEvent

**Independent Test**: Use curl to trigger Jobs API endpoint, verify reminder events published

### Implementation for User Story 2

- [x] T026 [US2] Create scheduler route at todo-web-app/backend/src/api/routes/scheduler.py
- [x] T027 [US2] Implement POST /api/jobs/trigger endpoint for Jobs API callback
- [x] T028 [US2] Implement reminder check logic calling existing reminder_service.py
- [x] T029 [US2] Add publish_reminder_event() method in publisher.py
- [x] T030 [US2] Modify reminder_service.py to call publish_reminder_event for due tasks
- [x] T031 [US2] Register scheduler route in backend main.py or router
- [x] T032 [US2] Document Jobs API scheduling in todo-web-app/backend/README.md

**Checkpoint**: ✅ Trigger reminder job manually, verify events published to reminder-events topic

---

## Phase 5: User Story 3 - Consume Reminder Events (Priority: P2) ✅

**Goal**: notification-service consumes reminder events and logs notifications

**Independent Test**: Publish synthetic event to reminder-events, verify service receives and logs it

### Implementation for User Story 3

- [x] T033 [P] [US3] Create notification-service directory structure at todo-web-app/notification-service/
- [x] T034 [P] [US3] Create pyproject.toml with FastAPI, httpx, structlog dependencies
- [x] T035 [US3] Create main.py with FastAPI app and graceful shutdown at notification-service/src/main.py
- [x] T036 [US3] Create core/config.py for environment configuration
- [x] T037 [US3] Create api/reminders.py with POST /api/reminders/handle endpoint
- [x] T038 [US3] Implement CloudEvents wrapper model for incoming events
- [x] T039 [US3] Implement notification handler (console logging mock)
- [x] T040 [US3] Create Dockerfile at notification-service/Dockerfile (multi-stage build)
- [x] T041 [P] [US3] Create Helm chart at k8s/local/notification-service/ with Dapr annotations
- [x] T042 [US3] Build and push notification-service Docker image

**Checkpoint**: ✅ notification-service ready to receive and log reminder events

---

## Phase 6: User Story 4 - Secrets from Dapr (Priority: P2) ✅

**Goal**: Services retrieve secrets via Dapr secrets store API

**Independent Test**: Check backend logs show successful secret retrieval on startup

### Implementation for User Story 4

- [x] T043 [US4] Create secrets helper module at todo-web-app/backend/src/core/secrets.py
- [x] T044 [US4] Implement get_secret() function using httpx to Dapr secrets API
- [x] T045 [US4] Modify database connection to retrieve DATABASE_URL via Dapr on startup
- [x] T046 [US4] Add fail-fast behavior if secret not found (clear error log)
- [x] T047 [US4] Update notification-service to use Dapr secrets for any credentials
- [x] T048 [US4] Document secret store usage in backend README.md

**Checkpoint**: ✅ Secrets helper created with caching and fail-fast behavior

---

## Phase 7: User Story 5 & 6 - Service Invocation & Scaling (Priority: P3) ✅

**Goal**: Services communicate via Dapr, scale independently

**Independent Test**: Call backend from notification-service via Dapr, verify response

### Implementation for User Story 5 & 6

- [x] T049 [P] [US5] Create service invocation helper in notification-service/src/core/dapr_client.py
- [x] T050 [US5] Implement invoke_backend() function using Dapr service invocation API
- [x] T051 [US5] Add example call from notification-service to backend for task details
- [x] T052 [P] [US6] Create recurring-service directory structure at todo-web-app/recurring-service/
- [x] T053 [US6] Implement recurring-service main.py with task-events subscription
- [x] T054 [US6] Create Dockerfile for recurring-service
- [x] T055 [P] [US6] Create Helm chart at k8s/local/recurring-service/
- [x] T056 [P] [US6] Create audit-service directory structure at todo-web-app/audit-service/
- [x] T057 [US6] Implement audit-service main.py with task-events subscription
- [x] T058 [US6] Create Dockerfile for audit-service
- [x] T059 [P] [US6] Create Helm chart at k8s/local/audit-service/
- [x] T060 [P] [US6] Create websocket-service directory structure at todo-web-app/websocket-service/
- [x] T061 [US6] Implement websocket-service main.py with task-updates subscription
- [x] T062 [US6] Create Dockerfile for websocket-service
- [x] T063 [P] [US6] Create Helm chart at k8s/local/websocket-service/

**Checkpoint**: ✅ All 4 consumer services created and ready for local testing

---

## Phase 8: Polish & Cross-Cutting Concerns ✅

**Purpose**: Documentation, cleanup, and validation

- [x] T064 [P] Update root README.md with Module 2 architecture diagram
- [x] T065 [P] Create todo-web-app/.dapr/README.md documenting all Dapr components
- [x] T066 [P] Create todo-web-app/k8s/cloud/kafka/README.md
- [x] T067 Created run-all-services.ps1 for local testing with all services
- [x] T068 Run full end-to-end validation (LOCAL: test pub/sub with Redis)
- [x] T069 Created Dapr subscriptions for all services

---

## Phase 9: Real-Time WebSocket Flow & Email Placeholder

**Goal**: Backend publishes task-updates for WebSocket delivery, frontend removes polling

### Implementation for Real-Time Flow

- [x] T070 [US3] Add publish_task_update_for_websocket() in backend/src/events/publisher.py
- [x] T071 [US3] Modify task_service.py to publish to task-updates topic after create/update/complete
- [x] T072 [US3] Add email placeholder in notification-service/src/api/handlers.py (log "would send email")
- [x] T073 [US6] Verify websocket-service receives task-updates and broadcasts to user
- [x] T074 [P] Update frontend useWebSocket.ts to call addNotification on task_update message
- [x] T075 [P] Remove 60-second polling from NotificationCenter.tsx (rely on WebSocket only)
- [x] T076 End-to-end test: Create task, verify real-time notification via WebSocket
- [x] T077 [US3] Add WebSocket publish to notification_service.create_notification() for real-time reminders/overdue

**Checkpoint**: Real-time notifications working, no polling, email placeholder ready

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase
  - US1 & US2 can run in parallel (both P1)
  - US3 & US4 can run in parallel (both P2)
  - US5 & US6 are lowest priority (P3)
- **Polish (Phase 8)**: Depends on all desired stories complete

### User Story Dependencies

- **US1 (P1)**: No dependencies - core event publishing
- **US2 (P1)**: Depends on T015 (event models) only
- **US3 (P2)**: Depends on US1 (events must exist to consume)
- **US4 (P2)**: Independent - can run parallel with US3
- **US5 (P3)**: Depends on US3 (notification-service exists)
- **US6 (P3)**: Independent - consumer services

### Parallel Opportunities

```bash
# Phase 1 parallel tasks:
T003, T004, T005, T006, T007, T008

# Phase 2 parallel tasks:
T014, T015

# US1 models can parallelize:
T017, T018, T019 (different methods, same file)

# US3 setup can parallelize:
T033, T034, T041

# US5/6 services can parallelize:
T052, T056, T060 (different services)
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (event publishing)
4. **STOP and VALIDATE**: Create task, verify events in Kafka
5. Demo event publishing capability

### Incremental Delivery

1. Setup + Foundation → Infrastructure ready
2. Add US1 → Backend publishes events (MVP!)
3. Add US2 → Scheduled reminders work
4. Add US3 → Notification-service receives events
5. Add US4 → Secrets via Dapr
6. Add US5/6 → All 4 consumer services operational

---

## Verification Commands

```bash
# Check Kafka cluster
kubectl get kafka -n kafka
kubectl get kafkatopics -n kafka

# Check Dapr components
dapr dashboard -k
kubectl get components -n todo-app

# Consume from topic (for testing)
kubectl exec -it kafka-cluster-kafka-0 -n kafka -- bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 --topic task-events --from-beginning

# Check service logs
kubectl logs -l app=backend -n todo-app --tail=50
kubectl logs -l app=notification-service -n todo-app --tail=50
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] maps task to user story for traceability
- httpx used for all Dapr HTTP API calls (no dapr-client SDK)
- Fire-and-forget publishing - log errors, don't fail main operation
- All services use graceful shutdown pattern
- Commit after each task or logical group

---

## Phase 10: Kubernetes Deployment (Minikube)

**Goal**: Deploy all services to Minikube with Dapr sidecars and Kafka pub/sub

**Prerequisites**: Phases 1-9 complete, local testing with Redis verified

### Infrastructure Setup

- [x] T078 [P] Create k8s/local/namespace.yaml for todo-app namespace
- [x] T079 [P] Create k8s/local/secrets-template.yaml for secrets configuration
- [x] T080 Create k8s/local/deploy-k8s.ps1 comprehensive deployment script

### Helm Charts (Consumer Services)

- [x] T055 [P] Create Helm chart at k8s/local/recurring-service/
- [x] T059 [P] Create Helm chart at k8s/local/audit-service/
- [x] T063 [P] Create Helm chart at k8s/local/websocket-service/

### Deployment Execution

- [ ] T081 Start Minikube cluster with sufficient resources (8GB RAM, 4 CPUs)
- [ ] T082 Install Dapr on Kubernetes (dapr init -k)
- [ ] T009 Deploy Kafka namespace (kubectl apply -f namespace.yaml)
- [ ] T010 Deploy Kafka cluster (kubectl apply -f cluster.yaml)
- [ ] T011 Verify Kafka topics created (kubectl get kafkatopics -n kafka)
- [ ] T012 Deploy Dapr components to todo-app namespace
- [ ] T013 Verify Dapr components status in dashboard

### Build and Deploy

- [ ] T083 Build all Docker images in Minikube's Docker daemon
- [ ] T084 Create secrets.yaml from template with actual values
- [ ] T085 Deploy all services via Helm (deploy-k8s.ps1 -Step 6)
- [ ] T086 Verify all pods are running (kubectl get pods -n todo-app)

### End-to-End Testing

- [ ] T087 Port-forward services and test real-time flow (WebSocket pub/sub)

**Checkpoint**: Full microservices deployment running on Minikube with Dapr + Kafka
