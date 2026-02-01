---
id: 005
title: Phase 4 Kubernetes Constitution Update
stage: constitution
date: 2026-01-31
surface: agent
model: gemini-2.5-pro
feature: none
branch: main
user: Zain-Ul-Abideen00
command: /sp-constitution
labels: [kubernetes, docker, helm, minikube, phase4, deployment]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests: []
---

# PHR: Phase 4 Kubernetes Constitution Update

## Prompt

```text
@[/sp-constitution] Update the constitution for Phase 4: Local Kubernetes Deployment.

## Project Overview
Deploy the Phase 3 Todo Chatbot on a local Kubernetes cluster (Minikube) using:
- Docker for containerization (optimized production images)
- Helm Charts for package management
- Minikube for local Kubernetes cluster
- kubectl-ai for AI-assisted operations (optional)

## Project Structure
Location: `todo-web-app/` directory (existing Phase 3 structure)
- `todo-web-app/backend/Dockerfile`: Production Dockerfile for FastAPI
- `todo-web-app/frontend/Dockerfile`: Production Dockerfile for Next.js
- `todo-web-app/k8s/`: NEW - Kubernetes configurations
  - `k8s/frontend/`: Helm chart for frontend
  - `k8s/backend/`: Helm chart for backend
  - `k8s/values-local.yaml`: Minikube-specific overrides

## Agentic Development Principles

### 1. Subagent Usage
- Use `@docker-expert` for ALL Dockerfile creation and optimization
- Use `@kubernetes-architect` for Helm chart design and K8s architecture
- Use `@kubernetes-specialist` for deployment operations and debugging
- Use `@deployment-engineer` for CI/CD patterns

### 2. Skill References
- Reference `production-dockerfile` skill for optimized Docker images
- Reference `helm-chart-scaffolding` skill for Helm chart patterns
- Reference `k8s-manifest-generator` skill for Kubernetes resources

### 3. AIOps Tools (Optional)
- Use `kubectl-ai` for natural language K8s commands
- Use Docker AI (Gordon) if available: `docker ai "What can you do?"`

## Code Quality Principles

### Docker (Production Images)
1. Multi-stage builds to minimize image size
2. Non-root user for security
3. Health check endpoints
4. .dockerignore to exclude unnecessary files
5. Layer caching optimization for fast builds
6. Environment variables for configuration
7. Consistent base images (python:3.12-slim, node:20-alpine)

### Helm Charts
1. Separate charts for frontend and backend
2. values.yaml for configurable parameters
3. ConfigMaps for non-secret configuration
4. Secrets for sensitive data (DATABASE_URL, API keys)
5. Resource limits and requests defined
6. Liveness and readiness probes
7. Ingress for external access (or NodePort for Minikube)

### Kubernetes Resources
1. Deployments with appropriate replicas
2. Services for internal communication
3. ConfigMaps for environment variables
4. Secrets for credentials
5. Ingress or NodePort for external access
6. Resource requests/limits for all containers

### Environment Variables Strategy
Backend needs (via Secret/ConfigMap):
- DATABASE_URL: Neon PostgreSQL connection string
- BETTER_AUTH_SECRET: Shared JWT secret
- GEMINI_API_KEY: LLM API key
- CORS_ORIGINS: Frontend URL (dynamic in K8s)

Frontend needs (via ConfigMap):
- NEXT_PUBLIC_API_URL: Backend service URL in cluster
- NEXT_PUBLIC_CHATKIT_URL: Backend chat endpoint
- BETTER_AUTH_SECRET: For JWT signing

### Minikube Specifics
1. Use `minikube docker-env` to build images locally
2. Use `minikube tunnel` or `minikube service` for access
3. NodePort services for simplicity
4. `imagePullPolicy: Never` when using local images

## Development Workflow
1. Run `/sp.specify` for each module specification
2. Run `/sp.plan` with agent and skill references
3. Run `/sp.tasks` to generate task breakdown
4. Run `/sp.implement` invoking appropriate subagents
5. Verify with actual deployment tests

## Verification Strategy
1. Docker: Build and run containers locally first
2. Helm: `helm lint` and `helm template` for validation
3. Minikube: `kubectl get pods`, `kubectl logs`, `kubectl describe`
4. E2E: Access frontend via browser, test chatbot flow

## Deliverables Checklist
- [ ] Production Dockerfile for backend (multi-stage)
- [ ] Production Dockerfile for frontend (multi-stage)
- [ ] Helm chart for backend with templates
- [ ] Helm chart for frontend with templates
- [ ] Minikube deployment working
- [ ] Frontend accessible via browser
- [ ] Chatbot functional in K8s environment
- [ ] README with deployment instructions
- [ ] Demo video (under 90 seconds)
```

## Response

### Summary of Changes

Updated constitution from **v3.0.0** to **v4.0.0** (MAJOR version bump) with the following changes:

#### New Principles Added (4)
- **XVII. Docker Containerization**: Multi-stage builds, non-root users, layer caching, health checks, size targets (<200MB backend, <150MB frontend)
- **XVIII. Helm Chart Architecture**: Chart structure, values configuration, templating best practices, validation with `helm lint`
- **XIX. Kubernetes Deployment**: Minikube setup, required resources (Deployment, Service, ConfigMap, Secret), probes, resource limits
- **XX. Environment Configuration Strategy**: Separation of ConfigMaps and Secrets, K8s-native environment variable management

#### Expanded Sections
- **Agentic Development (XII)**: Added 4 new subagents (`@docker-expert`, `@kubernetes-architect`, `@kubernetes-specialist`, `@deployment-engineer`) and 4 new skills (`production-dockerfile`, `helm-chart-scaffolding`, `k8s-manifest-generator`, `k8s-security-policies`)
- **Tooling & Environment (XI)**: Added Infrastructure section with Docker, Minikube, Helm, kubectl, kubectl-ai
- **Security (V)**: Added container security and K8s secrets rules
- **TDD (VI)**: Added Helm lint and kubectl dry-run for infrastructure testing
- **Project Structure**: Added `k8s/` directory with Helm charts for frontend and backend

#### Deliverables Checklist
- Phase 2 and Phase 3 marked as COMPLETE (inherited)
- Phase 4 deliverables added (9 items)

## Outcome

Constitution updated successfully. Ready for Phase 4 implementation.
