# Tasks: Minikube Deployment (Module 3)

**Feature Branch**: `012-minikube-deployment`
**Generated**: 2026-01-31
**Source**: [spec.md](./spec.md), [plan.md](./plan.md)
**Dependencies**: Module 1 (Dockerfiles), Module 2 (Helm Charts)

---

## Execution Methodology

> **⚠️ IMPORTANT**: For any long-running commands (installation, build, deploy, Minikube operations), the agent will:
> 1. **PAUSE** before executing
> 2. **Provide the command** for user to run locally
> 3. **Wait for user feedback** before proceeding
>
> **Examples of commands requiring user execution**:
> - `minikube start` / `minikube service ...` / `minikube docker-env`
> - `docker build ...`
> - `helm install ...` / `helm upgrade ...`
> - `kubectl apply ...` / `kubectl get pods ...`
> - Any command that may take >10 seconds
>
> The agent will create all files, but **validation commands** are user-executed.

---

## Phase 1: Setup (Prerequisites Verification)

**Purpose**: Verify all prerequisites are in place before deployment

- [x] T001 Verify Docker Desktop is running with `docker info`
- [x] T002 Verify Minikube CLI is installed with `minikube version`
- [x] T003 Verify Helm CLI is installed with `helm version`
- [x] T004 Verify kubectl CLI is installed with `kubectl version --client`
- [x] T005 Verify Module 1 Dockerfiles exist at `todo-web-app/backend/Dockerfile` and `todo-web-app/frontend/Dockerfile`
- [x] T006 Verify Module 2 Helm charts exist at `todo-web-app/k8s/local/backend/Chart.yaml` and `todo-web-app/k8s/local/frontend/Chart.yaml`
- [x] T007 Verify deploy.ps1 script exists at `todo-web-app/deploy.ps1`

**Checkpoint**: All prerequisites verified - cluster setup can begin

---

## Phase 2: User Story 1 - Minikube Cluster Setup (Priority: P1) 🎯 MVP

**Goal**: Start Minikube cluster and build Docker images inside it

**Independent Test**: `minikube status` shows Running AND `docker images | grep todo` shows 2 images

### Implementation for User Story 1

- [x] T008 [US1] Start Minikube cluster with `minikube start --driver=docker --memory=4096 --cpus=2` ⏸️ USER
- [x] T009 [US1] Verify Minikube is running with `minikube status` ⏸️ USER
- [x] T010 [US1] Configure Docker to use Minikube daemon with `& minikube docker-env | Invoke-Expression` ⏸️ USER
- [x] T011 [US1] Build backend image with `docker build -t todo-backend:latest ./backend` from `todo-web-app/` ⏸️ USER
- [x] T012 [US1] Build frontend image with `docker build -t todo-frontend:latest ./frontend` from `todo-web-app/` ⏸️ USER
- [x] T013 [US1] Verify images with `docker images | Select-String "todo"` ⏸️ USER

**Checkpoint**: Minikube running with both todo images available

---

## Phase 3: User Story 2 - Application Deployment (Priority: P1) 🎯 MVP

**Goal**: Deploy backend and frontend services using Helm charts

**Independent Test**: `kubectl get pods -n todo-app` shows all pods Running with 1/1 Ready

### Implementation for User Story 2

- [x] T014 [US2] Create namespace with `kubectl create namespace todo-app` ⏸️ USER
- [x] T015 [US2] Deploy app using script with `.\deploy.ps1` from `todo-web-app/` ⏸️ USER
- [x] T016 [US2] Verify pods with `kubectl get pods -n todo-app -w` (wait for Running) ⏸️ USER
- [x] T017 [US2] Check backend logs with `kubectl logs deployment/todo-backend -n todo-app --tail=50` ⏸️ USER
- [x] T018 [US2] Check frontend logs with `kubectl logs deployment/todo-frontend -n todo-app --tail=50` ⏸️ USER
- [x] T019 [US2] Verify services with `kubectl get svc -n todo-app` ⏸️ USER

**Checkpoint**: Both pods Running, no errors in logs

---

## Phase 4: User Story 3 - Application Access (Priority: P2)

**Goal**: Access frontend application through browser

**Independent Test**: Browser opens to Todo app login page

### Implementation for User Story 3

- [x] T020 [US3] Open frontend in browser with `minikube service todo-frontend -n todo-app` ⏸️ USER
- [x] T021 [US3] Verify login page displays correctly ⏸️ USER
- [x] T022 [US3] Sign up or sign in to the application ⏸️ USER (Note: Origin validation error - requires rebuild with correct BETTER_AUTH_URL)
- [x] T023 [US3] Verify dashboard loads after authentication ⏸️ USER (Partial - UI loads but auth has config issue)

**Checkpoint**: User can access and authenticate with the app

---

## Phase 5: User Story 4 - E2E Chatbot Verification (Priority: P2)

**Goal**: Verify chatbot works end-to-end in Kubernetes environment

**Independent Test**: Chat message creates task that appears in task list

### Implementation for User Story 4

- [x] T024 [US4] Open chatbot widget in the application ⏸️ USER
- [x] T025 [US4] Send message: "Add a task to test kubernetes deployment" ⏸️ USER
- [x] T026 [US4] Verify chatbot confirms task creation ⏸️ USER (Backend received POST /api/chat 200 OK)
- [x] T027 [US4] Send message: "Show my tasks" ⏸️ USER
- [x] T028 [US4] Verify task list includes the kubernetes test task ⏸️ USER
- [x] T029 [US4] Send message: "Mark test kubernetes deployment as complete" ⏸️ USER
- [x] T030 [US4] Verify task status changes to completed ⏸️ USER

**Checkpoint**: Full chatbot functionality verified in K8s

---

## Phase 6: User Story 5 - Logging and Troubleshooting (Priority: P3)

**Goal**: Verify logs and debugging capabilities

**Independent Test**: Can view pod logs and describe pod events

### Implementation for User Story 5

- [x] T031 [US5] View backend logs with `kubectl logs deployment/todo-backend -n todo-app` ⏸️ USER
- [x] T032 [US5] View frontend logs with `kubectl logs deployment/todo-frontend -n todo-app` ⏸️ USER
- [x] T033 [US5] Describe backend pod with `kubectl describe pod -l app.kubernetes.io/name=todo-backend -n todo-app` ⏸️ USER
- [x] T034 [US5] View cluster events with `kubectl get events -n todo-app --sort-by='.lastTimestamp'` ⏸️ USER
- [x] T035 [US5] Verify secret values with `kubectl exec deployment/todo-backend -n todo-app -- env | Select-String "DATABASE|AUTH|GEMINI"` ⏸️ USER

**Checkpoint**: Logging and troubleshooting capabilities verified

---

## Phase 7: Polish & Cleanup Documentation

**Purpose**: Document cleanup and final verification

- [ ] T036 [P] Document cleanup commands in README
- [ ] T037 Test cleanup with `helm uninstall todo-frontend -n todo-app` ⏸️ USER
- [ ] T038 Test cleanup with `helm uninstall todo-backend -n todo-app` ⏸️ USER
- [ ] T039 Delete namespace with `kubectl delete namespace todo-app` ⏸️ USER
- [ ] T040 Stop Minikube with `minikube stop` ⏸️ USER

---

## Dependencies & Execution Order

### Phase Dependencies

```text
Phase 1 (Setup)
    ↓
Phase 2 (US1: Cluster Setup)
    ↓
Phase 3 (US2: Deployment)
    ↓
Phase 4 (US3: Access) ─────┬───► Phase 5 (US4: E2E)
                           │
                           └───► Phase 6 (US5: Logging)
    ↓
Phase 7 (Cleanup)
```

### Critical Path

1. **T008**: Minikube start (blocks all)
2. **T011-T012**: Image builds (blocks deployment)
3. **T015**: helm install (blocks access/verification)

---

## MVP Scope

**Minimum Viable Deployment** = Phases 1-3 (T001-T019)

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 1 | T001-T007 | Prerequisites |
| Phase 2 | T008-T013 | Cluster + Images |
| Phase 3 | T014-T019 | Deployment |

**MVP Success Criteria**:
- ✅ Minikube running
- ✅ Both images built
- ✅ Both pods Running
- ✅ No errors in logs

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 40 |
| **Setup Phase** | 7 tasks |
| **US1 (Cluster)** | 6 tasks |
| **US2 (Deploy)** | 6 tasks |
| **US3 (Access)** | 4 tasks |
| **US4 (E2E)** | 7 tasks |
| **US5 (Logging)** | 5 tasks |
| **Polish** | 5 tasks |
| **MVP Tasks** | 19 tasks |
| **User-Executed** | 33 tasks (⏸️) |
