# Tasks: Helm Charts for Todo App

**Input**: Design documents from `/specs/011-helm-charts-kubernetes/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Tests**: Helm lint and template validation (infrastructure, not code tests)

**Organization**: Tasks grouped by user story priority from spec.md (P1 → P3)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- All file paths are relative to `todo-web-app/`

## Execution Methodology

> **⚠️ IMPORTANT**: For any long-running commands (installation, build, deploy, Minikube operations), the agent will:
> 1. **PAUSE** before executing
> 2. **Provide the command** for user to run locally
> 3. **Wait for user feedback** before proceeding
>
> **Examples of commands requiring user execution**:
> - `helm install ...` / `helm upgrade ...`
> - `docker build ...`
> - `minikube start` / `minikube service ...`
> - `kubectl apply ...` / `kubectl get pods ...`
> - Any command that may take >10 seconds
>
> The agent will create all files, but **validation commands** are user-executed.

## Phase 1: Setup (Directory Structure)

**Purpose**: Create Helm chart directory structure

- [x] T001 Create backend chart directory at `k8s/local/backend/templates/`
- [x] T002 Create frontend chart directory at `k8s/local/frontend/templates/`

---

## Phase 2: Foundational (Chart Metadata)

**Purpose**: Chart.yaml and _helpers.tpl for both charts - MUST complete before templates

**⚠️ CRITICAL**: No template work can begin until this phase is complete

- [x] T003 [P] Create backend `Chart.yaml` at `k8s/local/backend/Chart.yaml`
- [x] T004 [P] Create frontend `Chart.yaml` at `k8s/local/frontend/Chart.yaml`
- [x] T005 [P] Create backend `_helpers.tpl` at `k8s/local/backend/templates/_helpers.tpl`
- [x] T006 [P] Create frontend `_helpers.tpl` at `k8s/local/frontend/templates/_helpers.tpl`
- [x] T007 [P] Create backend `.helmignore` at `k8s/local/backend/.helmignore`
- [x] T008 [P] Create frontend `.helmignore` at `k8s/local/frontend/.helmignore`

**Checkpoint**: Chart foundations ready - user story implementation can begin

---

## Phase 3: User Story 1 - Backend Helm Installation (Priority: P1) 🎯 MVP

**Goal**: Install backend service with single Helm command

**Independent Test**: `helm install todo-backend ./k8s/local/backend -n todo-app` → Pod reaches Running state

### Implementation for User Story 1

- [x] T009 [US1] Create backend `values.yaml` at `k8s/local/backend/values.yaml`
  - replicaCount, image, service (NodePort 30800), resources, probes, config, secrets placeholders
- [x] T010 [US1] Create backend `deployment.yaml` at `k8s/local/backend/templates/deployment.yaml`
  - Deployment with env from ConfigMap/Secret, liveness/readiness probes
- [x] T011 [US1] Create backend `service.yaml` at `k8s/local/backend/templates/service.yaml`
  - NodePort service on port 8000, nodePort 30800
- [x] T012 [US1] Create backend `configmap.yaml` at `k8s/local/backend/templates/configmap.yaml`
  - CORS_ORIGINS, ENVIRONMENT from values
- [x] T013 [US1] Create backend `secret.yaml` at `k8s/local/backend/templates/secret.yaml`
  - DATABASE_URL, BETTER_AUTH_SECRET, GEMINI_API_KEY, GROQ_API_KEY
- [x] T014 [US1] Validate backend chart with `helm lint ./k8s/local/backend` ✅
- [x] T015 [US1] Preview backend templates with `helm template todo-backend ./k8s/local/backend` ✅

**Checkpoint**: Backend Helm chart complete and validated

---

## Phase 4: User Story 2 - Frontend Helm Installation (Priority: P2)

**Goal**: Install frontend service with single Helm command

**Independent Test**: `helm install todo-frontend ./k8s/local/frontend -n todo-app` → Pod reaches Running state

### Implementation for User Story 2

- [x] T016 [US2] Create frontend `values.yaml` at `k8s/local/frontend/values.yaml`
  - replicaCount, image, service (NodePort 30300), resources, probes, config, secrets placeholders
- [x] T017 [US2] Create frontend `deployment.yaml` at `k8s/local/frontend/templates/deployment.yaml`
  - Deployment with env from ConfigMap/Secret, liveness/readiness probes
- [x] T018 [US2] Create frontend `service.yaml` at `k8s/local/frontend/templates/service.yaml`
  - NodePort service on port 3000, nodePort 30300
- [x] T019 [US2] Create frontend `configmap.yaml` at `k8s/local/frontend/templates/configmap.yaml`
  - NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CHATKIT_URL, NEXT_PUBLIC_BETTER_AUTH_URL, NEXT_PUBLIC_CHATKIT_DOMAIN_KEY
- [x] T020 [US2] Create frontend `secret.yaml` at `k8s/local/frontend/templates/secret.yaml`
  - DATABASE_URL, BETTER_AUTH_SECRET
- [x] T021 [US2] Validate frontend chart with `helm lint ./k8s/local/frontend` ✅
- [x] T022 [US2] Preview frontend templates with `helm template todo-frontend ./k8s/local/frontend` ✅

**Checkpoint**: Frontend Helm chart complete and validated

---

## Phase 5: User Story 3 - Configuration via values.yaml (Priority: P2)

**Goal**: Customize deployments via values.yaml or --set flags

**Independent Test**: Change `replicaCount: 2` in values.yaml → Deployment creates 2 replicas

### Implementation for User Story 3

- [x] T023 [US3] Verify backend values.yaml has all configurable parameters documented
- [x] T024 [US3] Verify frontend values.yaml has all configurable parameters documented
- [x] T025 [US3] Test `--set replicaCount=2` override with helm template for backend ✅
- [x] T026 [US3] Test `--set replicaCount=2` override with helm template for frontend ✅

**Checkpoint**: Configuration flexibility verified

---

## Phase 6: User Story 4 - Secrets Management (Priority: P1)

**Goal**: Secrets managed via Kubernetes Secrets, not plain text

**Independent Test**: `kubectl get secret todo-backend-secret -o yaml` shows base64 encoded values

### Implementation for User Story 4

- [x] T027 [US4] Verify backend secret.yaml uses stringData (auto base64 by K8s) ✅
- [x] T028 [US4] Verify frontend secret.yaml uses stringData ✅
- [x] T029 [US4] Test secret injection with `helm template --set secrets.databaseUrl=test` ✅
- [x] T030 [US4] Document secret installation command in quickstart.md ✅

**Checkpoint**: Secrets properly encoded and injected

---

## Phase 7: User Story 5 - Environment-Specific Values (Priority: P3)

**Goal**: Support different value files for local vs cloud

**Independent Test**: `helm install -f values-local.yaml` uses Minikube-specific settings

### Implementation for User Story 5

- [x] T031 [P] [US5] Create `values-local.yaml` at `k8s/local/values-local.yaml` ✅
  - imagePullPolicy: Never, NodePort settings, development defaults

**Checkpoint**: Environment-specific configuration ready

---

## Phase 8: Polish & Documentation

**Purpose**: Final validation and documentation

- [x] T032 [P] Run full helm lint on both charts ✅
- [x] T033 [P] Run helm template --dry-run on both charts ✅
- [x] T034 Update quickstart.md with exact install commands for both charts ✅
- [x] T035 Create README.md at `k8s/local/README.md` with chart documentation ✅

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phase 3-7 (User Stories)**: All depend on Phase 2 completion
- **Phase 8 (Polish)**: Depends on Phase 3-7 completion

### User Story Dependencies

- **US1 (Backend)**: P1 - Start first, no dependencies
- **US2 (Frontend)**: P2 - Can start after US1 or in parallel
- **US3 (Config)**: P2 - Depends on US1+US2 complete
- **US4 (Secrets)**: P1 - Integrated with US1+US2
- **US5 (Env Values)**: P3 - Can start after Phase 2

### Parallel Opportunities

**Phase 2** (all parallel):
```
T003 (backend Chart.yaml) || T004 (frontend Chart.yaml)
T005 (backend helpers) || T006 (frontend helpers)
T007 (backend helmignore) || T008 (frontend helmignore)
```

**US1 + US2** (can run in parallel - different charts):
```
T009-T015 (backend) || T016-T022 (frontend)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T008)
3. Complete Phase 3: US1 - Backend (T009-T015)
4. **STOP and VALIDATE**: `helm lint` + `helm template`
5. Deploy to Minikube and test health endpoint

### Full Delivery

1. MVP (Phases 1-3)
2. Add US2 - Frontend (T016-T022)
3. Validate both charts work together
4. Add US3-US5 for configuration flexibility
5. Polish and document (Phase 8)

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 35 |
| Phase 1 (Setup) | 2 |
| Phase 2 (Foundational) | 6 |
| US1 (Backend) | 7 |
| US2 (Frontend) | 7 |
| US3 (Config) | 4 |
| US4 (Secrets) | 4 |
| US5 (Env Values) | 1 |
| Phase 8 (Polish) | 4 |
| Parallel Opportunities | 12 |

**MVP Scope**: Phases 1-3 (T001-T015) = 15 tasks
