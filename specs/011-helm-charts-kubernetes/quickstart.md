# Quickstart: Deploying Todo App with Helm on Minikube

**Feature**: 011-helm-charts-kubernetes
**Prerequisites**: Docker Desktop, Minikube, Helm 3.x, kubectl

---

## Prerequisites Check

```bash
# Verify installations
docker --version    # Docker 20+
minikube version    # Minikube 1.30+
helm version        # Helm 3.x
kubectl version     # kubectl 1.28+
```

---

## Step 1: Start Minikube

```bash
# Start cluster with adequate resources
minikube start --driver=docker --memory=4096 --cpus=2

# Configure shell to use Minikube's Docker daemon
# PowerShell:
& minikube docker-env | Invoke-Expression

# Or Bash/WSL:
eval $(minikube docker-env)
```

---

## Step 2: Build Docker Images

```bash
cd todo-web-app

# Build backend image
docker build -t todo-backend:latest ./backend

# Build frontend image
docker build -t todo-frontend:latest ./frontend

# Verify images are available
docker images | Select-String "todo"
```

---

## Step 3: Create Namespace

```bash
kubectl create namespace todo-app
```

---

## Step 4: Deploy Backend

```bash
# Replace placeholders with actual values
helm install todo-backend ./k8s/local/backend -n todo-app \
  --set secrets.databaseUrl="postgresql+asyncpg://user:pass@host.neon.tech/db?sslmode=require" \
  --set secrets.betterAuthSecret="your-32-char-secret-here" \
  --set secrets.geminiApiKey="your-gemini-api-key"

# Verify deployment
kubectl get pods -n todo-app
# Expected: todo-backend-xxx   1/1   Running   0   XXs

# Check logs if needed
kubectl logs deployment/todo-backend -n todo-app
```

---

## Step 5: Deploy Frontend

```bash
helm install todo-frontend ./k8s/local/frontend -n todo-app

# Verify both pods are running
kubectl get pods -n todo-app
# Expected:
# todo-backend-xxx    1/1   Running   0   XXs
# todo-frontend-xxx   1/1   Running   0   XXs
```

---

## Step 6: Access Application

```bash
# Get frontend URL
minikube service todo-frontend -n todo-app

# Browser will open automatically, or use the URL shown
# Default: http://127.0.0.1:XXXXX (NodePort 30300 mapped)
```

---

## Step 7: Verify E2E

1. Open browser to frontend URL
2. Sign up / Sign in
3. Open chatbot
4. Send: "Add a task called Test Kubernetes"
5. Verify task appears in task list
6. Send: "Show my tasks"
7. Verify the new task is listed

---

## Troubleshooting

### Pod not starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n todo-app

# Check events
kubectl get events -n todo-app --sort-by='.lastTimestamp'
```

### Image pull errors

```bash
# Ensure you're using Minikube's Docker
& minikube docker-env | Invoke-Expression

# Rebuild images
docker build -t todo-backend:latest ./backend
```

### Backend can't reach Neon

```bash
# Verify secret is set correctly
kubectl get secret -n todo-app

# Shell into pod to test connectivity
kubectl exec -it deployment/todo-backend -n todo-app -- /bin/sh
# Then: curl -I https://your-neon-host.neon.tech
```

### Check environment variables

```bash
kubectl exec deployment/todo-backend -n todo-app -- env | Select-String "DATABASE|AUTH|GEMINI"
```

---

## Cleanup

```bash
# Uninstall charts
helm uninstall todo-frontend -n todo-app
helm uninstall todo-backend -n todo-app

# Delete namespace
kubectl delete namespace todo-app

# Stop Minikube
minikube stop
```

---

## Quick Reference

| Service | NodePort | Internal URL |
|---------|----------|--------------|
| Backend | 30800 | http://todo-backend:8000 |
| Frontend | 30300 | http://todo-frontend:3000 |

| Command | Purpose |
|---------|---------|
| `helm lint ./k8s/local/backend` | Validate chart syntax |
| `helm template todo-backend ./k8s/local/backend` | Preview generated YAML |
| `helm upgrade todo-backend ./k8s/local/backend -n todo-app` | Update deployment |
| `kubectl rollout restart deployment/todo-backend -n todo-app` | Restart pods |
