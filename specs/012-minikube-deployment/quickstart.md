# Quickstart: Minikube Deployment

Deploy the Todo Chatbot to local Kubernetes in 10 minutes.

## Prerequisites

- Docker Desktop running
- Minikube CLI installed (`winget install minikube`)
- Helm CLI installed (`winget install Helm.Helm`)
- kubectl CLI installed (`winget install Kubernetes.kubectl`)

## Quick Deploy

### 1. Start Minikube

```powershell
minikube start --driver=docker --memory=4096 --cpus=2
```

### 2. Configure Docker

```powershell
& minikube docker-env | Invoke-Expression
```

### 3. Build Images

```powershell
cd d:\GIAIC\Quarter 4\Hackathon\Project 2\hackathon-todo\todo-web-app

docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend
```

### 4. Create Namespace

```powershell
kubectl create namespace todo-app
```

### 5. Deploy App (reads secrets from .env files)

```powershell
.\deploy.ps1
```

This script automatically loads secrets from:
- `backend/.env` → Backend secrets
- `frontend/.env` → Frontend secrets

### 7. Verify Pods

```powershell
kubectl get pods -n todo-app -w
```

Wait until both pods show `1/1 Running`.

### 8. Access App

```powershell
minikube service todo-frontend -n todo-app
```

## E2E Test

1. Browser opens to frontend
2. Sign up / Sign in
3. Open chatbot
4. Send: "Add a task to buy groceries"
5. Verify task created
6. Send: "Show my tasks"
7. Verify task appears

## Troubleshooting

```powershell
# Check pod status
kubectl describe pod -l app.kubernetes.io/name=todo-backend -n todo-app

# View logs
kubectl logs deployment/todo-backend -n todo-app --tail=100

# Check secrets
kubectl get secret -n todo-app

# Check events
kubectl get events -n todo-app --sort-by='.lastTimestamp'
```

## Cleanup

```powershell
helm uninstall todo-frontend -n todo-app
helm uninstall todo-backend -n todo-app
kubectl delete namespace todo-app
minikube stop
```
