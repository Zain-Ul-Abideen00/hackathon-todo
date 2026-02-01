# Implementation Plan: Helm Charts for Todo App

**Branch**: `011-helm-charts-kubernetes` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-helm-charts-kubernetes/spec.md`

## Summary

Create Helm charts for deploying the Todo App backend (FastAPI) and frontend (Next.js) to Minikube. Charts will utilize Go templating for configuration flexibility, support NodePort services for local access, and manage secrets/configmaps for environment variables. Follows constitution principles XVII-XX for Kubernetes deployment.

## Technical Context

**Language/Version**: Helm 3.x with Go templating
**Primary Dependencies**: Kubernetes 1.28+, Minikube, Docker images from Module 1
**Storage**: Neon PostgreSQL (external, accessed via DATABASE_URL secret)
**Testing**: `helm lint`, `helm template`, `kubectl dry-run`, manual pod verification
**Target Platform**: Minikube (local Kubernetes cluster)
**Project Type**: Infrastructure/Kubernetes configuration
**Performance Goals**: Pod startup within 60 seconds
**Constraints**: NodePort range 30000-32767, image pull policy `Never` for local builds
**Scale/Scope**: Single replica per service for local development

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status |
|-----------|-------------|--------|
| XVIII. Helm Chart Architecture | Separate charts for frontend/backend | ✅ Compliant |
| XVIII. Helm Chart Architecture | values.yaml for configurable params | ✅ Compliant |
| XVIII. Helm Chart Architecture | _helpers.tpl for template functions | ✅ Planned |
| XIX. Kubernetes Deployment | Liveness/Readiness probes | ✅ FR-010, FR-011 |
| XIX. Kubernetes Deployment | Resource requests/limits | ✅ FR-012, FR-013 |
| XIX. Kubernetes Deployment | NodePort for Minikube | ✅ FR-005, FR-006 |
| XX. Environment Configuration | ConfigMaps for non-secrets | ✅ FR-007, FR-008 |
| XX. Environment Configuration | Secrets for credentials | ✅ FR-009 |
| V. Security First | K8s Secrets only for sensitive data | ✅ Planned |

**Gate Status**: ✅ PASS - All constitution requirements met

## Project Structure

### Documentation (this feature)

```text
specs/011-helm-charts-kubernetes/
├── plan.md              # This file
├── research.md          # Phase 0: Helm best practices
├── quickstart.md        # Phase 1: Deployment guide
└── tasks.md             # Phase 2: Task breakdown (via /sp.tasks)
```

### Source Code (Helm Charts)

```text
todo-web-app/k8s/
├── local/                          # Minikube configurations
│   ├── backend/                    # Backend Helm chart
│   │   ├── Chart.yaml              # Chart metadata
│   │   ├── values.yaml             # Default values
│   │   ├── .helmignore             # Ignore patterns
│   │   └── templates/
│   │       ├── _helpers.tpl        # Template helpers
│   │       ├── deployment.yaml     # Pod deployment
│   │       ├── service.yaml        # NodePort service
│   │       ├── configmap.yaml      # CORS config
│   │       └── secret.yaml         # Credentials
│   ├── frontend/                   # Frontend Helm chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   ├── .helmignore
│   │   └── templates/
│   │       ├── _helpers.tpl
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       └── configmap.yaml
│   └── values-local.yaml           # Global Minikube overrides
└── cloud/                          # Phase 5 (future)
```

**Structure Decision**: Charts located at `k8s/local/` per Project_Structure_Guide.md to separate Phase 4 (Minikube) from Phase 5 (cloud) configurations.

---

## Proposed Changes

### Component: Backend Helm Chart

#### [NEW] Chart.yaml
`todo-web-app/k8s/local/backend/Chart.yaml`

```yaml
apiVersion: v2
name: todo-backend
description: FastAPI Backend for Todo Chatbot
version: 0.1.0
appVersion: "1.0.0"
```

#### [NEW] values.yaml
`todo-web-app/k8s/local/backend/values.yaml`

- `replicaCount: 1`
- `image.repository: todo-backend`, `image.tag: latest`, `image.pullPolicy: Never`
- `service.type: NodePort`, `service.port: 8000`, `service.nodePort: 30800`
- `resources.requests: {memory: 256Mi, cpu: 100m}`
- `resources.limits: {memory: 512Mi, cpu: 500m}`
- `config.corsOrigins: http://localhost:30300`, `config.environment: development`
- `secrets.databaseUrl`, `secrets.betterAuthSecret`, `secrets.geminiApiKey`, `secrets.groqApiKey` (empty placeholders)
- `probes.initialDelaySeconds: 10`, `probes.periodSeconds: 10`, `probes.failureThreshold: 3`

#### [NEW] templates/deployment.yaml
- Deployment with 1 replica
- Container from `image.repository:image.tag`
- Environment variables from ConfigMap and Secret refs
- Liveness probe: `httpGet /api/health` with configured timing
- Readiness probe: `httpGet /api/health` with configured timing
- Resource limits from values

#### [NEW] templates/service.yaml
- NodePort service on port 8000
- Target port 8000
- NodePort 30800

#### [NEW] templates/configmap.yaml
- `CORS_ORIGINS` from `values.config.corsOrigins`
- `ENVIRONMENT: development`

#### [NEW] templates/secret.yaml
- `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GEMINI_API_KEY`, `GROQ_API_KEY` using `stringData`

#### [NEW] templates/_helpers.tpl
- `todo-backend.name`, `todo-backend.fullname`, `todo-backend.labels`, `todo-backend.selectorLabels`

---

### Component: Frontend Helm Chart

#### [NEW] Chart.yaml
`todo-web-app/k8s/local/frontend/Chart.yaml`

```yaml
apiVersion: v2
name: todo-frontend
description: Next.js Frontend for Todo Chatbot
version: 0.1.0
appVersion: "1.0.0"
```

#### [NEW] values.yaml
`todo-web-app/k8s/local/frontend/values.yaml`

- `replicaCount: 1`
- `image.repository: todo-frontend`, `image.tag: latest`, `image.pullPolicy: Never`
- `service.type: NodePort`, `service.port: 3000`, `service.nodePort: 30300`
- `resources.requests: {memory: 256Mi, cpu: 100m}`
- `resources.limits: {memory: 512Mi, cpu: 500m}`
- `config.apiUrl: http://todo-backend:8000`
- `config.chatkitUrl: http://todo-backend:8000/api/chat`
- `config.betterAuthUrl: http://localhost:30300`
- `config.chatkitDomainKey: localhost`
- `secrets.databaseUrl`, `secrets.betterAuthSecret` (empty placeholders)
- `probes.initialDelaySeconds: 10`, `probes.periodSeconds: 10`, `probes.failureThreshold: 3`

#### [NEW] templates/deployment.yaml
- Deployment with 1 replica
- Container from `image.repository:image.tag`
- Environment variables from ConfigMap and Secret refs
- Liveness probe: `httpGet /` with configured timing
- Readiness probe: `httpGet /` with configured timing
- Resource limits from values

#### [NEW] templates/service.yaml
- NodePort service on port 3000
- Target port 3000
- NodePort 30300

#### [NEW] templates/configmap.yaml
- `NEXT_PUBLIC_API_URL` from `values.config.apiUrl`
- `NEXT_PUBLIC_CHATKIT_URL` from `values.config.chatkitUrl`
- `NEXT_PUBLIC_BETTER_AUTH_URL` from `values.config.betterAuthUrl`
- `NEXT_PUBLIC_CHATKIT_DOMAIN_KEY` from `values.config.chatkitDomainKey`

#### [NEW] templates/secret.yaml
- `DATABASE_URL`, `BETTER_AUTH_SECRET` using `stringData`

#### [NEW] templates/_helpers.tpl
- `todo-frontend.name`, `todo-frontend.fullname`, `todo-frontend.labels`, `todo-frontend.selectorLabels`

---

## Verification Plan

### Automated Tests

| Test | Command | Expected Result |
|------|---------|-----------------|
| Backend chart lint | `helm lint ./k8s/local/backend` | 0 errors, 0 warnings |
| Frontend chart lint | `helm lint ./k8s/local/frontend` | 0 errors, 0 warnings |
| Backend template render | `helm template todo-backend ./k8s/local/backend` | Valid YAML output |
| Frontend template render | `helm template todo-frontend ./k8s/local/frontend` | Valid YAML output |
| Template dry-run | `helm install --dry-run --debug todo-backend ./k8s/local/backend` | No errors |

### Manual Verification (Minikube Deployment)

1. **Start Minikube**: `minikube start --driver=docker`
2. **Set Docker env**: `& minikube docker-env | Invoke-Expression` (PowerShell)
3. **Build images** (requires Module 1 complete):
   ```bash
   cd todo-web-app
   docker build -t todo-backend:latest ./backend
   docker build -t todo-frontend:latest ./frontend
   ```
4. **Create namespace**: `kubectl create namespace todo-app`
5. **Install backend**:
   ```bash
   helm install todo-backend ./k8s/local/backend -n todo-app \
     --set secrets.databaseUrl="YOUR_NEON_URL" \
     --set secrets.betterAuthSecret="YOUR_32_CHAR_SECRET" \
     --set secrets.geminiApiKey="YOUR_GEMINI_KEY"
   ```
6. **Verify backend pod**: `kubectl get pods -n todo-app` (should show Running)
7. **Install frontend**: `helm install todo-frontend ./k8s/local/frontend -n todo-app`
8. **Verify frontend pod**: `kubectl get pods -n todo-app` (both Running)
9. **Access frontend**: `minikube service todo-frontend -n todo-app`
10. **Test chatbot**: Open browser, login, send "Show my tasks"

---

## Complexity Tracking

> No constitution violations. All changes follow established patterns.

| Item | Decision | Rationale |
|------|----------|-----------|
| Separate charts | Frontend + Backend | Per constitution XVIII, independent scaling |
| NodePort over Ingress | Simplicity for Minikube | Ingress requires additional controller setup |
| `imagePullPolicy: Never` | Local development | Minikube builds images locally |
