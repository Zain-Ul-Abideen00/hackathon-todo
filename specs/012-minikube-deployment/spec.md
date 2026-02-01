# Feature Specification: Minikube Deployment (Module 3)

**Feature Branch**: `012-minikube-deployment`
**Created**: 2026-01-31
**Status**: Draft
**Input**: Module 3 of Phase 4 - Deploy Todo Chatbot to local Kubernetes (Minikube)
**Dependencies**: Module 1 (Dockerfiles), Module 2 (Helm Charts)

## Summary

This module provides step-by-step deployment guidance for running the Todo Chatbot application on a local Minikube Kubernetes cluster. It covers the complete workflow from cluster setup to end-to-end verification, enabling DevOps engineers to validate the application in a production-like environment before cloud deployment.

---

## User Scenarios & Testing

### User Story 1 - Minikube Cluster Setup (Priority: P1)

As a DevOps engineer, I can start a Minikube cluster and configure Docker to build images directly into the cluster, so that the application images are immediately available for deployment.

**Why this priority**: Foundation - no deployment can occur without a running cluster

**Independent Test**: Run `minikube status` and `docker images | grep todo` to verify cluster is running and images are available

**Acceptance Scenarios**:

1. **Given** Docker Desktop is installed, **When** I run `minikube start --driver=docker`, **Then** a Kubernetes cluster starts successfully within 2 minutes
2. **Given** Minikube is running, **When** I configure Docker environment with `minikube docker-env`, **Then** subsequent `docker build` commands target Minikube's Docker daemon
3. **Given** Minikube's Docker is configured, **When** I build backend and frontend images, **Then** both images appear in `docker images` list inside Minikube

---

### User Story 2 - Application Deployment (Priority: P1)

As a DevOps engineer, I can deploy the backend and frontend services using Helm charts with proper secrets configuration, so that the application runs in Kubernetes.

**Why this priority**: Core functionality - the primary deployment capability

**Independent Test**: Run `kubectl get pods -n todo-app` and verify all pods show "Running" status

**Acceptance Scenarios**:

1. **Given** images are built, **When** I create namespace and install backend chart with secrets, **Then** backend pod starts and reaches Running state within 60 seconds
2. **Given** backend is running, **When** I install frontend chart, **Then** frontend pod starts and reaches Running state within 60 seconds
3. **Given** both pods are running, **When** I check pod logs, **Then** no error messages appear in startup logs

---

### User Story 3 - Application Access (Priority: P2)

As a DevOps engineer, I can access the frontend application through a browser, so that I can verify the UI is properly served from Kubernetes.

**Why this priority**: Essential for user verification but depends on successful deployment

**Independent Test**: Open browser to Minikube service URL and see the login page

**Acceptance Scenarios**:

1. **Given** frontend pod is running, **When** I run `minikube service todo-frontend -n todo-app`, **Then** my browser opens to the frontend URL
2. **Given** browser opens, **When** I view the page, **Then** the Todo app login page displays correctly
3. **Given** login page displays, **When** I attempt to sign in, **Then** authentication works and dashboard appears

---

### User Story 4 - End-to-End Chatbot Verification (Priority: P2)

As a user, the chatbot should work end-to-end in the Kubernetes environment, allowing me to manage tasks through natural language.

**Why this priority**: Critical for validating the complete system integration

**Independent Test**: Send chat message "Add a task to buy groceries" and verify task appears in task list

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I open the chatbot and send "Add a task to buy groceries", **Then** the chatbot confirms task creation
2. **Given** task is created, **When** I send "Show my tasks", **Then** the chatbot lists the grocery task
3. **Given** tasks exist, **When** I send "Mark buy groceries as complete", **Then** the task status changes to completed

---

### User Story 5 - Logging and Troubleshooting (Priority: P3)

As a DevOps engineer, I can view logs and troubleshoot issues in the Kubernetes deployment, so that I can diagnose and fix problems.

**Why this priority**: Important for operational readiness but not blocking user functionality

**Independent Test**: Run `kubectl logs deployment/todo-backend -n todo-app` and see application logs

**Acceptance Scenarios**:

1. **Given** pods are running, **When** I run `kubectl logs deployment/todo-backend -n todo-app`, **Then** I see FastAPI startup logs
2. **Given** pods are running, **When** I run `kubectl logs deployment/todo-frontend -n todo-app`, **Then** I see Next.js startup logs
3. **Given** a pod fails, **When** I run `kubectl describe pod <name> -n todo-app`, **Then** I see event details explaining the failure

---

### Edge Cases

- What happens when Minikube runs out of memory? → Pods are evicted with OOMKilled status
- How does system handle incorrect secrets? → Backend pod fails readiness probe, stays in CrashLoopBackOff
- What if images aren't built in Minikube's Docker? → ImagePullBackOff error with "image not found"
- What happens if Neon database is unreachable? → Backend health check fails, pod marked as not ready

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST start Minikube cluster using Docker driver
- **FR-002**: System MUST configure Docker CLI to use Minikube's Docker daemon
- **FR-003**: System MUST build backend Docker image inside Minikube with tag `todo-backend:latest`
- **FR-004**: System MUST build frontend Docker image inside Minikube with tag `todo-frontend:latest`
- **FR-005**: System MUST create Kubernetes namespace `todo-app`
- **FR-006**: System MUST install backend Helm chart with required secrets (DATABASE_URL, BETTER_AUTH_SECRET, GEMINI_API_KEY)
- **FR-007**: System MUST install frontend Helm chart with required secrets (DATABASE_URL, BETTER_AUTH_SECRET)
- **FR-008**: Backend pod MUST reach Running state within 60 seconds of deployment
- **FR-009**: Frontend pod MUST reach Running state within 60 seconds of deployment
- **FR-010**: Backend health endpoint MUST respond at `/api/health`
- **FR-011**: Frontend MUST be accessible via Minikube service URL
- **FR-012**: Chatbot MUST be able to create tasks via natural language
- **FR-013**: Chatbot MUST be able to list tasks via natural language
- **FR-014**: Pod logs MUST be accessible via `kubectl logs` command
- **FR-015**: System MUST provide cleanup commands to remove all resources

### Key Entities

- **Minikube Cluster**: Local Kubernetes environment with Docker driver
- **Namespace**: `todo-app` - isolated environment for all application resources
- **Pod**: Running container instance (backend or frontend)
- **Service**: NodePort exposing pods (30800 for backend, 30300 for frontend)
- **Secret**: Kubernetes secret containing sensitive environment variables

---

## Success Criteria

1. **Cluster Availability**: Minikube cluster starts and reports "Running" status
2. **Image Build Success**: Both Docker images build without errors in under 5 minutes each
3. **Pod Health**: All pods reach "Running" status with 1/1 containers ready within 60 seconds
4. **Service Accessibility**: Frontend accessible via browser within 30 seconds of pod ready state
5. **API Health**: Backend `/api/health` endpoint returns success response
6. **Chatbot Functionality**: End-to-end test passes (add task → list tasks → complete task)
7. **Log Accessibility**: Application logs viewable via kubectl without errors
8. **Clean Teardown**: All resources removed successfully with cleanup commands

---

## Assumptions

- Docker Desktop is installed and running on the host machine
- Minikube CLI is installed (version 1.30+)
- Helm CLI is installed (version 3.x)
- kubectl CLI is installed and configured
- Neon PostgreSQL database is accessible from Minikube (public internet)
- User has valid API keys for GEMINI (and optionally GROQ)
- Module 1 (Dockerfiles) and Module 2 (Helm Charts) are complete
- Host machine has at least 4GB RAM available for Minikube

---

## Out of Scope

- Cloud Kubernetes deployment (Phase 5)
- Horizontal Pod Autoscaling configuration
- Ingress controller setup (using NodePort instead)
- SSL/TLS certificate configuration
- Persistent volume setup (database is external)
- CI/CD pipeline integration
- Performance testing and optimization
- Multi-node cluster configuration

---

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
