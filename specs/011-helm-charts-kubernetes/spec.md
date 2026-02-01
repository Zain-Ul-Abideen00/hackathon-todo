# Feature Specification: Helm Charts for Todo App

**Feature Branch**: `011-helm-charts-kubernetes`
**Created**: 2026-01-31
**Status**: Draft
**Input**: User description: "Helm Charts for Todo App (Module 2)"

## Clarifications

### Session 2026-01-31

- Q: What probe timing parameters should be used for liveness/readiness probes? → A: Standard probes (initialDelaySeconds: 10, periodSeconds: 10, failureThreshold: 3)
- Q: What NodePort values should be used for Minikube access? → A: Explicit ports (Backend: 30800, Frontend: 30300)
- Q: How should the backend connect to external Neon PostgreSQL in K8s? → A: Standard egress (Neon uses public HTTPS, no special K8s network policy needed)

## User Scenarios & Testing

### User Story 1 - Backend Helm Installation (Priority: P1)

As a DevOps engineer, I can install the backend service with a single Helm command so that I have a repeatable, version-controlled deployment method.

**Why this priority**: The backend is the core service that the frontend depends on. Without a working backend deployment, no other features can function.

**Independent Test**: Can be fully tested by running `helm install todo-backend ./k8s/local/backend` on Minikube and verifying the pod starts and responds to health checks.

**Acceptance Scenarios**:

1. **Given** Minikube is running with local Docker images, **When** I run `helm install todo-backend ./k8s/local/backend -n todo-app`, **Then** a deployment with 1 replica is created and reaches Running state.
2. **Given** the backend is installed, **When** I access `/api/health`, **Then** I receive a 200 OK response.
3. **Given** secrets are provided via `--set`, **When** the pod starts, **Then** environment variables (DATABASE_URL, BETTER_AUTH_SECRET, GEMINI_API_KEY) are available.

---

### User Story 2 - Frontend Helm Installation (Priority: P2)

As a DevOps engineer, I can install the frontend service with a single Helm command so that users can access the Todo application UI.

**Why this priority**: The frontend provides user access to the application. It depends on the backend being deployed first.

**Independent Test**: Can be tested by running `helm install todo-frontend ./k8s/local/frontend` and accessing the frontend via NodePort.

**Acceptance Scenarios**:

1. **Given** Minikube is running and backend is deployed, **When** I run `helm install todo-frontend ./k8s/local/frontend -n todo-app`, **Then** a deployment with 1 replica is created.
2. **Given** the frontend is installed, **When** I access the NodePort URL, **Then** I see the Todo application UI.
3. **Given** the ConfigMap includes backend URL, **When** the pod starts, **Then** NEXT_PUBLIC_API_URL environment variable points to the backend service.

---

### User Story 3 - Configuration via values.yaml (Priority: P2)

As a DevOps engineer, I can customize deployments by modifying values.yaml or passing `--set` flags so that I can adapt the deployment to different environments.

**Why this priority**: Configuration flexibility is essential for adapting to different environments (local, staging, production) without modifying templates.

**Independent Test**: Can be tested by modifying replica count in values.yaml and verifying the deployment uses the new value.

**Acceptance Scenarios**:

1. **Given** values.yaml specifies `replicaCount: 2`, **When** I install the chart, **Then** the deployment creates 2 replicas.
2. **Given** I pass `--set image.tag=v2.0.0`, **When** I install the chart, **Then** the pod uses the specified image tag.
3. **Given** I pass `--set resources.limits.memory=1Gi`, **When** I install the chart, **Then** the container has 1Gi memory limit.

---

### User Story 4 - Secrets Management (Priority: P1)

As a DevOps engineer, secrets are managed via Kubernetes Secrets so that sensitive data is not exposed in plain text in configuration files.

**Why this priority**: Security is critical. Secrets must be properly managed from the start to prevent credential leaks.

**Independent Test**: Can be tested by verifying secrets are base64 encoded and mounted as environment variables in pods.

**Acceptance Scenarios**:

1. **Given** secrets are defined in the Helm chart, **When** I install with `--set secrets.databaseUrl="..."`, **Then** a Kubernetes Secret is created with encoded values.
2. **Given** the Secret exists, **When** the deployment pod starts, **Then** environment variables are populated from the Secret.
3. **Given** I use `kubectl get secret`, **When** I describe the secret, **Then** values are not visible in plain text.

---

### User Story 5 - Environment-Specific Values (Priority: P3)

As a DevOps engineer, I can use different value files for local (Minikube) vs cloud environments so that I can maintain separate configurations.

**Why this priority**: While important for long-term maintainability, this is a convenience feature that can be addressed after core functionality works.

**Independent Test**: Can be tested by installing with `-f values-local.yaml` and verifying Minikube-specific settings are applied.

**Acceptance Scenarios**:

1. **Given** values-local.yaml exists with `imagePullPolicy: Never`, **When** I install with `-f values-local.yaml`, **Then** the deployment uses local images without pulling.
2. **Given** values-local.yaml specifies NodePort, **When** I install, **Then** the service is accessible via `minikube service` command.

---

### Edge Cases

- What happens when required secrets are not provided? → Deployment should fail clearly with missing env var error.
- How does the system handle when backend service is unavailable? → Frontend health checks should reflect unhealthy state.
- What if image pull fails? → Pod should show ImagePullBackOff with clear error message.
- What happens with invalid values.yaml? → `helm lint` should catch errors before deployment.
- How does backend connect to external Neon database? → Standard egress via public HTTPS/TLS (DATABASE_URL with sslmode=require).

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a Helm chart for backend deployment located at `k8s/local/backend/`
- **FR-002**: System MUST provide a Helm chart for frontend deployment located at `k8s/local/frontend/`
- **FR-003**: Backend chart MUST create a Deployment with configurable replica count (default: 1)
- **FR-004**: Frontend chart MUST create a Deployment with configurable replica count (default: 1)
- **FR-005**: Backend chart MUST create a Service (NodePort: 30800 for Minikube access)
- **FR-006**: Frontend chart MUST create a Service (NodePort: 30300 for Minikube access)
- **FR-007**: Backend chart MUST create a ConfigMap for CORS_ORIGINS and ENVIRONMENT configuration
- **FR-008**: Frontend chart MUST create a ConfigMap for NEXT_PUBLIC_API_URL, NEXT_PUBLIC_CHATKIT_URL, NEXT_PUBLIC_BETTER_AUTH_URL, and NEXT_PUBLIC_CHATKIT_DOMAIN_KEY
- **FR-009**: Backend chart MUST create a Secret for DATABASE_URL, BETTER_AUTH_SECRET, GEMINI_API_KEY, GROQ_API_KEY
- **FR-010**: Frontend chart MUST create a Secret for DATABASE_URL and BETTER_AUTH_SECRET
- **FR-011**: Both charts MUST configure liveness probes (backend: /api/health, frontend: /) with initialDelaySeconds: 10, periodSeconds: 10, failureThreshold: 3
- **FR-012**: Both charts MUST configure readiness probes (backend: /api/health, frontend: /) with initialDelaySeconds: 10, periodSeconds: 10, failureThreshold: 3
- **FR-013**: Both charts MUST define resource requests (256Mi memory, 100m CPU)
- **FR-014**: Both charts MUST define resource limits (512Mi memory, 500m CPU)
- **FR-015**: Charts MUST support `imagePullPolicy: Never` for Minikube local images
- **FR-016**: Charts MUST include `_helpers.tpl` for standard Helm label templates
- **FR-017**: Charts MUST pass `helm lint` validation without errors

### Key Entities

- **Helm Chart**: Package containing Chart.yaml, values.yaml, and templates/ for K8s deployment
- **Deployment**: K8s resource managing pod replicas with rolling updates
- **Service**: K8s resource for network access (NodePort for external, ClusterIP for internal)
- **ConfigMap**: K8s resource for non-sensitive environment configuration
- **Secret**: K8s resource for sensitive credentials (base64 encoded)
- **values.yaml**: Default configuration values for the chart
- **_helpers.tpl**: Reusable Go template functions for labels and names

## Success Criteria

### Measurable Outcomes

- **SC-001**: `helm lint ./k8s/local/backend` passes with no errors within 5 seconds
- **SC-002**: `helm lint ./k8s/local/frontend` passes with no errors within 5 seconds
- **SC-003**: `helm template todo-backend ./k8s/local/backend` renders valid YAML without errors
- **SC-004**: `helm template todo-frontend ./k8s/local/frontend` renders valid YAML without errors
- **SC-005**: Backend pod reaches Running state within 60 seconds of Helm install
- **SC-006**: Frontend pod reaches Running state within 60 seconds of Helm install
- **SC-007**: 100% of required environment variables are accessible in pods via ConfigMap/Secret
- **SC-008**: Health check endpoints respond within 5 seconds of pod becoming Ready
