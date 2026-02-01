# Implementation Plan: Minikube Deployment (Module 3)

**Branch**: `012-minikube-deployment` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-minikube-deployment/spec.md`
**Dependencies**: Module 1 (Dockerfiles), Module 2 (Helm Charts)

## Summary

Deploy the Todo Chatbot application to a local Minikube Kubernetes cluster. This module provides step-by-step deployment commands, secret configuration, and E2E verification procedures. The plan follows the Execution Methodology where long-running commands are provided for user execution.

## Technical Context

**Platform**: Minikube with Docker driver
**Cluster Resources**: 4GB RAM, 2 CPUs minimum
**Namespace**: `todo-app`
**Services**: NodePort (Backend: 30800, Frontend: 30300)
**External Dependencies**: Neon PostgreSQL (public internet)
**Target Platform**: Local Kubernetes for development/testing

## Constitution Check

| Principle | Requirement | Status |
|-----------|-------------|--------|
| XIX. Kubernetes Deployment | Deploy with Helm charts | ✅ Using Module 2 charts |
| XIX. Kubernetes Deployment | NodePort for Minikube | ✅ Configured |
| XX. Environment Configuration | Secrets via K8s Secrets | ✅ Via helm --set |
| XX. Environment Configuration | ConfigMaps for non-secrets | ✅ Via values.yaml |
| XVII. Container Strategy | imagePullPolicy: Never | ✅ For Minikube |

**Gate Status**: ✅ PASS

## Project Structure

### Deployment Artifacts (from Module 2)

```text
todo-web-app/k8s/local/
├── README.md                    # Quick reference
├── values-local.yaml            # Minikube overrides
├── backend/                     # Backend Helm chart
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
└── frontend/                    # Frontend Helm chart
    ├── Chart.yaml
    ├── values.yaml
    └── templates/
```

### New Artifacts (this module)

```text
specs/012-minikube-deployment/
├── plan.md              # This file
├── quickstart.md        # Step-by-step deployment guide
└── checklists/
    └── requirements.md  # Quality checklist
```

---

## Deployment Steps

### Step 1: Start Minikube

```powershell
minikube start --driver=docker --memory=4096 --cpus=2
```

**Expected Output**: "Done! kubectl is now configured to use "minikube" cluster"

### Step 2: Configure Docker Environment

```powershell
# PowerShell
& minikube docker-env | Invoke-Expression

# Verify
docker ps  # Should show Minikube containers
```

### Step 3: Build Images Inside Minikube

```powershell
cd todo-web-app

# Build backend
docker build -t todo-backend:latest ./backend

# Build frontend
docker build -t todo-frontend:latest ./frontend

# Verify
docker images | Select-String "todo"
```

### Step 4: Create Namespace

```powershell
kubectl create namespace todo-app
```

### Step 5: Deploy Using Script (Recommended)

The `deploy.ps1` script automatically reads secrets from your `.env` files:

```powershell
cd todo-web-app
.\deploy.ps1
```

This script:
1. Loads `backend/.env` and `frontend/.env`
2. Validates required secrets exist
3. Deploys both charts with proper secrets
4. Uses `helm upgrade --install` for idempotent deployments

### Alternative: Manual Deployment with Environment Variables

If you prefer manual control, load .env into PowerShell variables:

```powershell
# Load .env into environment
Get-Content ./backend/.env | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        Set-Item -Path "env:$($matches[1].Trim())" -Value $matches[2].Trim().Trim('"')
    }
}

# Deploy using environment variables
helm install todo-backend ./k8s/local/backend -n todo-app `
  --set secrets.databaseUrl="$env:DATABASE_URL" `
  --set secrets.betterAuthSecret="$env:BETTER_AUTH_SECRET" `
  --set secrets.geminiApiKey="$env:GEMINI_API_KEY" `
  --set secrets.groqApiKey="$env:GROQ_API_KEY"
```

### Step 7: Verify Deployment

```powershell
# Check pods (should show Running)
kubectl get pods -n todo-app

# Check services
kubectl get svc -n todo-app

# View backend logs
kubectl logs deployment/todo-backend -n todo-app --tail=50

# View frontend logs
kubectl logs deployment/todo-frontend -n todo-app --tail=50
```

### Step 8: Access Application

```powershell
# Open in browser
minikube service todo-frontend -n todo-app
```

### Step 9: E2E Verification

1. Open browser to the frontend URL
2. Sign up / Sign in
3. Open the chatbot widget
4. Send: "Add a task to test kubernetes deployment"
5. Verify task creation confirmation
6. Send: "Show my tasks"
7. Verify task list includes the new task

---

## Troubleshooting

### Pod Not Starting

```powershell
kubectl describe pod <pod-name> -n todo-app
kubectl get events -n todo-app --sort-by='.lastTimestamp'
```

### ImagePullBackOff Error

```powershell
# Ensure Docker uses Minikube's daemon
& minikube docker-env | Invoke-Expression
docker images | Select-String "todo"

# Rebuild if needed
docker build -t todo-backend:latest ./backend
```

### Secret Verification

```powershell
kubectl get secret todo-backend-secret -n todo-app -o yaml
kubectl exec deployment/todo-backend -n todo-app -- env | Select-String "DATABASE|AUTH|GEMINI"
```

### Pod Shell Access

```powershell
kubectl exec -it deployment/todo-backend -n todo-app -- /bin/sh
```

---

## Cleanup

```powershell
# Uninstall charts
helm uninstall todo-frontend -n todo-app
helm uninstall todo-backend -n todo-app

# Delete namespace
kubectl delete namespace todo-app

# Stop Minikube
minikube stop

# Delete cluster (optional)
minikube delete
```

---

## Verification Checklist

| Check | Command | Expected |
|-------|---------|----------|
| Cluster running | `minikube status` | host: Running |
| Images built | `docker images \| grep todo` | 2 images |
| Namespace exists | `kubectl get ns todo-app` | Active |
| Backend running | `kubectl get pods -n todo-app` | 1/1 Running |
| Frontend running | `kubectl get pods -n todo-app` | 1/1 Running |
| Backend health | `curl http://$(minikube ip):30800/api/health` | 200 OK |
| Frontend access | `minikube service todo-frontend -n todo-app` | Browser opens |
| Chatbot works | Send "add task test" | Task created |

---

## Complexity Tracking

| Item | Decision | Rationale |
|------|----------|-----------|
| NodePort over Ingress | Simplicity | Ingress requires controller installation |
| Secrets via --set | Convenience | Avoids committing secrets to files |
| Single replica | Local dev | Scale not needed for testing |
