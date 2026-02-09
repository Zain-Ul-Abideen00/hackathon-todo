# Local Kubernetes Deployment Guide

Complete guide for deploying the **Todo Chatbot** to a local Minikube Kubernetes cluster. This setup is ideal for development, testing, and learning Kubernetes concepts.

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Quick Start](#-quick-start)
3. [Step-by-Step Installation](#-step-by-step-installation)
4. [Deployment](#-deployment)
5. [Accessing the Application](#-accessing-the-application)
6. [Helm Charts Reference](#-helm-charts-reference)
7. [Useful Commands](#-useful-commands)
8. [Troubleshooting](#-troubleshooting)
9. [Cleanup](#-cleanup)

---

## 🔧 Prerequisites

### Required Software

| Software | Minimum Version | Download Link | Purpose |
|----------|-----------------|---------------|---------|
| **Docker Desktop** | 4.25+ | [docker.com](https://www.docker.com/products/docker-desktop/) | Container runtime |
| **Minikube** | 1.32+ | [minikube.sigs.k8s.io](https://minikube.sigs.k8s.io/docs/start/) | Local Kubernetes |
| **kubectl** | 1.28+ | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) | Kubernetes CLI |
| **Helm** | 3.12+ | [helm.sh](https://helm.sh/docs/intro/install/) | Package manager |
| **PowerShell** | 5.1+ | Pre-installed on Windows | Automation |

### System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| **RAM** | 4 GB | 8 GB |
| **CPU** | 2 cores | 4 cores |
| **Disk** | 20 GB free | 40 GB free |

---

## ⚡ Quick Start

**For experienced users** - deploy in under 5 minutes:

```powershell
# 1. Start Minikube
minikube start --driver=docker --memory=4096 --cpus=2

# 2. Configure Docker to use Minikube's daemon
& minikube docker-env | Invoke-Expression

# 3. Build images inside Minikube
cd todo-web-app
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# 4. Deploy with script
.\deploy.ps1

# 5. Access the app
kubectl port-forward svc/todo-frontend 3000:3000 -n todo-app
kubectl port-forward svc/todo-backend 8000:8000 -n todo-app
# Open http://localhost:3000
```

---

## 📦 Step-by-Step Installation

### 1. Install Docker Desktop

#### Windows

1. Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Run the installer
3. Restart your computer if prompted
4. Launch Docker Desktop
5. Verify installation:
   ```powershell
   docker --version
   # Docker version 24.0.7, build afdd53b

   docker info
   # Should show Docker is running
   ```

#### Configure Docker Resources

Open Docker Desktop → Settings → Resources:
- **Memory**: At least 4 GB (recommended 6 GB)
- **CPUs**: At least 2 (recommended 4)
- **Disk image size**: At least 20 GB

---

### 2. Install Minikube

#### Windows (PowerShell as Administrator)

**Option A: Using winget**
```powershell
winget install Kubernetes.minikube
```

**Option B: Using Chocolatey**
```powershell
choco install minikube
```

**Option C: Manual Download**
```powershell
# Download the installer
Invoke-WebRequest -Uri "https://storage.googleapis.com/minikube/releases/latest/minikube-installer.exe" -OutFile "minikube-installer.exe"

# Run the installer
.\minikube-installer.exe
```

Verify installation:
```powershell
minikube version
# minikube version: v1.32.0
```

---

### 3. Install kubectl

#### Windows (PowerShell as Administrator)

**Option A: Using winget**
```powershell
winget install Kubernetes.kubectl
```

**Option B: Using Chocolatey**
```powershell
choco install kubernetes-cli
```

**Option C: Manual Download**
```powershell
# Download kubectl
curl.exe -LO "https://dl.k8s.io/release/v1.29.0/bin/windows/amd64/kubectl.exe"

# Move to a directory in PATH (e.g., C:\Windows\System32)
Move-Item -Path ".\kubectl.exe" -Destination "C:\Windows\System32\kubectl.exe"
```

Verify installation:
```powershell
kubectl version --client
# Client Version: v1.29.0
```

---

### 4. Install Helm

#### Windows (PowerShell as Administrator)

**Option A: Using winget**
```powershell
winget install Helm.Helm
```

**Option B: Using Chocolatey**
```powershell
choco install kubernetes-helm
```

**Option C: Using Scoop**
```powershell
scoop install helm
```

Verify installation:
```powershell
helm version
# version.BuildInfo{Version:"v3.14.0", ...}
```

---

## 🚀 Deployment

### Step 1: Start Minikube Cluster

```powershell
# Start with recommended resources
minikube start --driver=docker --memory=4096 --cpus=2

# Verify cluster is running
minikube status
```

Expected output:
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

---

### Step 2: Configure Docker Environment

This step is **critical** - it configures Docker to build images directly inside Minikube:

```powershell
# Configure Docker to use Minikube's Docker daemon
& minikube docker-env | Invoke-Expression

# Verify (should show minikube containers)
docker ps

# Verify you're in Minikube's Docker (should show minikube)
docker info | Select-String "Name:"

```

> ⚠️ **Important**: Run this command in every new terminal session before building images!

---

### Step 3: Build Docker Images

Navigate to the `todo-web-app` directory and build:

```powershell
cd d:\GIAIC\Quarter 4\Hackathon\Project 2\hackathon-todo\todo-web-app

# Build backend image
docker build -t todo-backend:latest ./backend

# Build frontend image
docker build -t todo-frontend:latest ./frontend

# Verify images are available
docker images | Select-String "todo"
```

Expected output:
```
todo-backend    latest    abc123...   2 minutes ago   500MB
todo-frontend   latest    def456...   1 minute ago    400MB
```

---

### Step 4: Configure Environment Variables

Ensure your `.env` files contain the required secrets:

**`backend/.env`**:
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
```

**`frontend/.env`**:
```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CHATKIT_URL=http://localhost:8000/api/chat
```

---

### Step 5: Deploy Using Script

```powershell
# Run the deployment script
.\deploy.ps1
```

The script will:
1. ✅ Load environment variables from `.env` files
2. ✅ Validate required secrets exist
3. ✅ Create `todo-app` namespace
4. ✅ Deploy backend Helm chart
5. ✅ Deploy frontend Helm chart

Expected output:
```
Todo App Minikube Deployment
Loaded environment variables from .env files
All required secrets found
Creating namespace...
namespace/todo-app created
Deploying backend...
Release "todo-backend" has been installed.
Deploying frontend...
Release "todo-frontend" has been installed.
Deployment complete!
```

---

### Step 6: Verify Deployment

```powershell
# Check pods status
kubectl get pods -n todo-app

# Wait for pods to be ready (1/1 Running)
kubectl get pods -n todo-app -w
```

Expected output:
```
NAME                            READY   STATUS    RESTARTS   AGE
todo-backend-xxx-xxx            1/1     Running   0          2m
todo-frontend-xxx-xxx           1/1     Running   0          2m
```

---

## 🌐 Accessing the Application

### Option 1: Port Forwarding (Recommended)

```powershell
# Terminal 1: Forward frontend
kubectl port-forward svc/todo-frontend 3000:3000 -n todo-app

# Terminal 2: Forward backend (for API access)
kubectl port-forward svc/todo-backend 8000:8000 -n todo-app
```

Access at: **http://localhost:3000**

---

### Option 2: Minikube Service Tunnel

```powershell
# Opens browser automatically
minikube service todo-frontend -n todo-app
```

> ⚠️ **Note**: This uses a random port. You still need port-forward for backend at `localhost:8000`.

---

### Option 3: NodePort Direct Access

Get the Minikube IP:
```powershell
minikube ip
# 192.168.49.2
```

Access at:
- **Frontend**: http://192.168.49.2:30300
- **Backend**: http://192.168.49.2:30800

> ⚠️ **Note**: May not work on some Windows setups due to Docker Desktop networking.

---

## 📊 Helm Charts Reference

### Backend Chart (`./backend/`)

| Value | Default | Description |
|-------|---------|-------------|
| `replicaCount` | 1 | Number of pod replicas |
| `image.repository` | todo-backend | Docker image name |
| `image.tag` | latest | Image tag |
| `image.pullPolicy` | Never | Use local images |
| `service.type` | NodePort | Service type |
| `service.port` | 8000 | Service port |
| `service.nodePort` | 30800 | NodePort for external access |
| `probes.liveness.initialDelaySeconds` | 30 | Wait before first probe |
| `config.corsOrigins` | localhost:* | CORS allowed origins |
| `secrets.databaseUrl` | "" | PostgreSQL connection string |
| `secrets.betterAuthSecret` | "" | JWT signing secret |
| `secrets.geminiApiKey` | "" | Gemini AI API key |
| `secrets.groqApiKey` | "" | Groq AI API key |

### Frontend Chart (`./frontend/`)

| Value | Default | Description |
|-------|---------|-------------|
| `replicaCount` | 1 | Number of pod replicas |
| `image.repository` | todo-frontend | Docker image name |
| `image.tag` | latest | Image tag |
| `image.pullPolicy` | Never | Use local images |
| `service.type` | NodePort | Service type |
| `service.port` | 3000 | Service port |
| `service.nodePort` | 30300 | NodePort for external access |
| `config.apiUrl` | http://todo-backend:8000 | Backend API URL |
| `config.chatkitUrl` | http://todo-backend:8000/api/chat | ChatKit endpoint |
| `secrets.databaseUrl` | "" | PostgreSQL connection string |
| `secrets.betterAuthSecret` | "" | JWT signing secret |

---

## 🛠️ Useful Commands

### Minikube Commands

#### Cluster Lifecycle

```powershell
# Start cluster with custom resources
minikube start --driver=docker --memory=4096 --cpus=2

# Start with specific Kubernetes version
minikube start --kubernetes-version=v1.29.0

# Stop cluster (preserves data)
minikube stop

# Pause cluster (saves resources without stopping)
minikube pause

# Unpause cluster
minikube unpause

# Delete cluster completely
minikube delete

# Delete all clusters
minikube delete --all

# Check cluster status
minikube status

# Get cluster IP address
minikube ip
# Example: 192.168.49.2

# SSH into Minikube VM
minikube ssh

# Open Kubernetes dashboard in browser
minikube dashboard

# Get Minikube logs for debugging
minikube logs
```

#### Minikube Addons

```powershell
# List all available addons
minikube addons list

# Enable metrics-server (for kubectl top)
minikube addons enable metrics-server

# Enable ingress controller
minikube addons enable ingress

# Enable dashboard
minikube addons enable dashboard

# Disable an addon
minikube addons disable dashboard
```

#### Minikube Service Access

```powershell
# Open service in browser (creates tunnel)
minikube service todo-frontend -n todo-app

# Get service URL without opening browser
minikube service todo-frontend -n todo-app --url

# List all service URLs
minikube service list
```

---

### Docker Commands (Minikube Context)

#### Docker Environment Setup

```powershell
# ⚠️ CRITICAL: Configure Docker to use Minikube's daemon
# Run this in EVERY new terminal before building images!
& minikube docker-env | Invoke-Expression

# Verify you're using Minikube's Docker (should show minikube containers)
docker ps

# Reset to local Docker (if needed)
& minikube docker-env -u | Invoke-Expression
```

#### Building Images

```powershell
# Build image (from todo-web-app directory)
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# Build with no cache (force fresh build)
docker build --no-cache -t todo-frontend:latest ./frontend

# Build with specific Dockerfile
docker build -f Dockerfile.prod -t todo-backend:prod ./backend

# Build with build arguments
docker build --build-arg NODE_ENV=production -t todo-frontend:latest ./frontend
```

#### Image Management

```powershell
# List all images
docker images

# List images matching pattern
docker images | Select-String "todo"

# Remove specific image
docker rmi todo-frontend:latest

# Remove unused images
docker image prune

# Remove ALL unused images (including tagged)
docker image prune -a

# Remove dangling images only
docker image prune -f

# Check image size
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

#### Container Debugging

```powershell
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container logs
docker logs <container-id>

# Execute command in running container
docker exec -it <container-id> /bin/sh

# Inspect container details
docker inspect <container-id>
```

---

### kubectl Commands

#### Namespace Management

```powershell
# Create namespace
kubectl create namespace todo-app

# List all namespaces
kubectl get namespaces

# Delete namespace (deletes all resources in it!)
kubectl delete namespace todo-app

# Set default namespace for session
kubectl config set-context --current --namespace=todo-app
```

#### Pod Management

```powershell
# List pods in namespace
kubectl get pods -n todo-app

# List pods with more details
kubectl get pods -n todo-app -o wide

# Watch pods in real-time
kubectl get pods -n todo-app -w

# Get pods by label
kubectl get pods -l app.kubernetes.io/name=todo-backend -n todo-app

# Describe pod (detailed info + events)
kubectl describe pod <pod-name> -n todo-app

# Describe pods by label
kubectl describe pod -l app.kubernetes.io/name=todo-backend -n todo-app

# Delete a specific pod (will be recreated by deployment)
kubectl delete pod <pod-name> -n todo-app

# Delete pods by label
kubectl delete pods -l app.kubernetes.io/name=todo-backend -n todo-app
```

#### Viewing Logs

```powershell
# Get logs from a pod
kubectl logs <pod-name> -n todo-app

# Get logs from a deployment (picks one pod)
kubectl logs deployment/todo-backend -n todo-app

# Follow logs in real-time
kubectl logs -f deployment/todo-backend -n todo-app

# Get last N lines of logs
kubectl logs deployment/todo-backend -n todo-app --tail=100

# Get logs from previous container instance (after crash)
kubectl logs deployment/todo-backend -n todo-app --previous

# Get logs with timestamps
kubectl logs deployment/todo-backend -n todo-app --timestamps

# Get logs from all pods with label
kubectl logs -l app.kubernetes.io/name=todo-backend -n todo-app
```

#### Executing Commands in Pods

```powershell
# Open shell in pod
kubectl exec -it <pod-name> -n todo-app -- /bin/sh

# Open bash (if available)
kubectl exec -it <pod-name> -n todo-app -- /bin/bash

# Run single command
kubectl exec deployment/todo-backend -n todo-app -- env

# Check environment variables
kubectl exec deployment/todo-backend -n todo-app -- env | Select-String "DATABASE"

# Check if service is reachable from inside pod
kubectl exec deployment/todo-frontend -n todo-app -- curl http://todo-backend:8000/api/health

# List files in container
kubectl exec deployment/todo-backend -n todo-app -- ls -la /app
```

#### Deployment Management

```powershell
# List deployments
kubectl get deployments -n todo-app

# Describe deployment
kubectl describe deployment todo-backend -n todo-app

# Scale deployment (change replica count)
kubectl scale deployment todo-backend --replicas=3 -n todo-app

# Restart deployment (rolling restart - picks up new images)
kubectl rollout restart deployment/todo-backend -n todo-app

# Check rollout status
kubectl rollout status deployment/todo-backend -n todo-app

# View rollout history
kubectl rollout history deployment/todo-backend -n todo-app

# Rollback to previous version
kubectl rollout undo deployment/todo-backend -n todo-app

# Rollback to specific revision
kubectl rollout undo deployment/todo-backend --to-revision=2 -n todo-app
```

#### Service Management

```powershell
# List services
kubectl get svc -n todo-app

# Describe service
kubectl describe svc todo-frontend -n todo-app

# Port forward to service (recommended for local access)
kubectl port-forward svc/todo-frontend 3000:3000 -n todo-app

# Port forward to pod directly
kubectl port-forward pod/<pod-name> 3000:3000 -n todo-app

# Port forward in background (PowerShell)
Start-Job { kubectl port-forward svc/todo-frontend 3000:3000 -n todo-app }

# Get service endpoints
kubectl get endpoints todo-backend -n todo-app
```

#### ConfigMaps and Secrets

```powershell
# List ConfigMaps
kubectl get configmap -n todo-app

# View ConfigMap contents
kubectl describe configmap todo-backend-config -n todo-app

# Get ConfigMap as YAML
kubectl get configmap todo-backend-config -n todo-app -o yaml

# List Secrets
kubectl get secrets -n todo-app

# View Secret (base64 encoded)
kubectl describe secret todo-backend-secret -n todo-app

# Decode secret value (PowerShell)
kubectl get secret todo-backend-secret -n todo-app -o jsonpath="{.data.DATABASE_URL}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
```

#### Resource Inspection

```powershell
# Get all resources in namespace
kubectl get all -n todo-app

# Get resource as YAML
kubectl get deployment todo-backend -n todo-app -o yaml

# Get resource as JSON
kubectl get deployment todo-backend -n todo-app -o json

# Export deployment spec (without cluster-specific fields)
kubectl get deployment todo-backend -n todo-app -o yaml --export

# Watch all resources
kubectl get all -n todo-app -w
```

#### Resource Usage & Metrics

```powershell
# Check pod resource usage (requires metrics-server)
kubectl top pods -n todo-app

# Check node resource usage
kubectl top nodes

# Get resource requests/limits
kubectl describe pod -l app.kubernetes.io/name=todo-backend -n todo-app | Select-String -Pattern "Requests|Limits" -Context 0,2
```

#### Events & Debugging

```powershell
# Get cluster events (sorted by time)
kubectl get events -n todo-app --sort-by='.lastTimestamp'

# Get events for specific resource
kubectl get events -n todo-app --field-selector involvedObject.name=todo-backend

# Describe all resources (comprehensive debug)
kubectl describe all -n todo-app

# Check API server connection
kubectl cluster-info

# Validate YAML before applying
kubectl apply --dry-run=client -f manifest.yaml
```

---

### Helm Commands

#### Release Management

```powershell
# List installed releases
helm list -n todo-app

# List all releases (including failed)
helm list -n todo-app --all

# Install a release
helm install todo-backend ./k8s/local/backend -n todo-app

# Install with custom values
helm install todo-backend ./k8s/local/backend -n todo-app -f custom-values.yaml

# Install with set values
helm install todo-backend ./k8s/local/backend -n todo-app --set replicaCount=2

# Upgrade release (apply changes)
helm upgrade todo-backend ./k8s/local/backend -n todo-app

# Upgrade with --set values
helm upgrade todo-backend ./k8s/local/backend -n todo-app --set image.tag=v2

# Install or upgrade (upsert)
helm upgrade --install todo-backend ./k8s/local/backend -n todo-app

# Uninstall release
helm uninstall todo-backend -n todo-app
```

#### Release History & Rollback

```powershell
# View release history
helm history todo-backend -n todo-app

# Rollback to previous version
helm rollback todo-backend -n todo-app

# Rollback to specific revision
helm rollback todo-backend 2 -n todo-app
```

#### Inspecting Releases

```powershell
# Get current values
helm get values todo-backend -n todo-app

# Get all values (including defaults)
helm get values todo-backend -n todo-app --all

# Get release manifest (what was deployed)
helm get manifest todo-backend -n todo-app

# Get release notes
helm get notes todo-backend -n todo-app

# Show chart default values
helm show values ./k8s/local/backend
```

#### Chart Development

```powershell
# Lint chart for errors
helm lint ./k8s/local/backend

# Template chart (preview rendered YAML)
helm template todo-backend ./k8s/local/backend -n todo-app

# Template with values
helm template todo-backend ./k8s/local/backend -n todo-app --set replicaCount=2

# Dependency update
helm dependency update ./k8s/local/backend
```

---

### Common Workflows

#### 🔄 Rebuild and Redeploy Image

When you make code changes and need to deploy them:

```powershell
# 1. Configure Docker for Minikube
& minikube docker-env | Invoke-Expression

# 2. Rebuild the image
docker build -t todo-frontend:latest ./frontend

# 3. Restart deployment to pick up new image
kubectl rollout restart deployment/todo-frontend -n todo-app

# 4. Wait for rollout to complete
kubectl rollout status deployment/todo-frontend -n todo-app

# 5. Verify new pod is running
kubectl get pods -n todo-app
```

#### 🔧 Update Configuration (values.yaml)

When you change Helm values.yaml:

```powershell
# 1. Upgrade the Helm release
helm upgrade todo-frontend ./k8s/local/frontend -n todo-app

# 2. Restart pods to pick up ConfigMap changes
kubectl rollout restart deployment/todo-frontend -n todo-app

# 3. Verify configuration applied
kubectl exec deployment/todo-frontend -n todo-app -- env | Select-String "BETTER_AUTH"
```

#### 🐛 Debug a Failing Pod

```powershell
# 1. Check pod status
kubectl get pods -n todo-app

# 2. Get pod events
kubectl describe pod -l app.kubernetes.io/name=todo-backend -n todo-app

# 3. Check current logs
kubectl logs deployment/todo-backend -n todo-app --tail=50

# 4. Check previous container logs (if crashed)
kubectl logs deployment/todo-backend -n todo-app --previous

# 5. Get cluster events
kubectl get events -n todo-app --sort-by='.lastTimestamp' | Select-Object -Last 10
```

#### 🔐 View Secret Values

```powershell
# List secrets
kubectl get secrets -n todo-app

# View all environment variables in pod
kubectl exec deployment/todo-backend -n todo-app -- env

# Filter specific variables
kubectl exec deployment/todo-backend -n todo-app -- env | Select-String "DATABASE|AUTH|API"
```

#### 📊 Monitor Resource Usage

```powershell
# Enable metrics-server addon
minikube addons enable metrics-server

# Wait a minute for metrics to be collected, then:
kubectl top pods -n todo-app
kubectl top nodes
```

#### 🌐 Test Internal Connectivity

```powershell
# From frontend pod, test backend connectivity
kubectl exec deployment/todo-frontend -n todo-app -- curl -s http://todo-backend:8000/api/health

# Check DNS resolution
kubectl exec deployment/todo-frontend -n todo-app -- nslookup todo-backend
```

#### 🔁 Complete Fresh Redeployment

Start from scratch without deleting Minikube:

```powershell
# 1. Uninstall Helm releases
helm uninstall todo-frontend -n todo-app
helm uninstall todo-backend -n todo-app

# 2. Delete namespace
kubectl delete namespace todo-app

# 3. Rebuild images (optional, if code changed)
& minikube docker-env | Invoke-Expression
docker build -t todo-backend:latest ./backend
docker build -t todo-frontend:latest ./frontend

# 4. Redeploy
.\deploy.ps1

# 5. Set up port forwarding
kubectl port-forward svc/todo-frontend 3000:3000 -n todo-app
kubectl port-forward svc/todo-backend 8000:8000 -n todo-app
```

---

## 🔧 Troubleshooting

### Pod in CrashLoopBackOff

**Symptoms**: Pod keeps restarting

**Diagnosis**:
```powershell
kubectl logs deployment/todo-backend -n todo-app --previous
kubectl describe pod -l app.kubernetes.io/name=todo-backend -n todo-app
```

**Common Causes**:
1. Database connection failure
2. Missing environment variables
3. Port conflict

**Solutions**:
- Increase `probes.liveness.initialDelaySeconds` to 60
- Verify `DATABASE_URL` is correct
- Check secrets are populated

---

### ImagePullBackOff

**Symptoms**: Pod can't pull image

**Diagnosis**:
```powershell
kubectl describe pod -l app.kubernetes.io/name=todo-backend -n todo-app
```

**Solution**: Ensure `imagePullPolicy: Never` and images are built in Minikube's Docker:
```powershell
& minikube docker-env | Invoke-Expression
docker images | Select-String "todo"
```

---

### CORS Errors

**Symptoms**: Browser console shows CORS blocked

**Solution**: Update `config.corsOrigins` in values.yaml:
```yaml
config:
  corsOrigins: "http://localhost:3000,http://127.0.0.1:3000,http://localhost:30300"
```

Then upgrade:
```powershell
.\deploy.ps1
```

---

### Auth Origin Error

**Symptoms**: "Invalid origin" when logging in

**Cause**: `NEXT_PUBLIC_BETTER_AUTH_URL` doesn't match access URL

**Solution**: Rebuild frontend with correct URL or use port-forwarding on the expected port (3000).

---

### Slow Pod Startup

**Symptoms**: Pod takes long to become Ready

**Cause**: Database connection warmup

**Solution**: Increase probe delays in values.yaml:
```yaml
probes:
  liveness:
    initialDelaySeconds: 45
    periodSeconds: 10
    failureThreshold: 5
```

---

### Minikube Won't Start

**Symptoms**: `minikube start` fails

**Common Fixes**:
```powershell
# Reset Minikube
minikube delete
minikube start --driver=docker

# Check Docker is running
docker info

# Use less memory if constrained
minikube start --driver=docker --memory=3072 --cpus=2
```

---

## 🧹 Cleanup

### Remove Application Only

```powershell
# Remove Helm releases
helm uninstall todo-frontend -n todo-app
helm uninstall todo-backend -n todo-app

# Delete namespace
kubectl delete namespace todo-app
```

### Stop Minikube (Preserves Data)

```powershell
minikube stop
```

### Complete Cleanup

```powershell
# Delete everything
minikube delete

# Clean up Docker images (optional)
docker image prune -a
```

---

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Minikube Handbook](https://minikube.sigs.k8s.io/docs/handbook/)
- [Helm Documentation](https://helm.sh/docs/)
- [Docker Getting Started](https://docs.docker.com/get-started/)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-01 | Initial release |

---

**Made with ❤️ by Zain Ul Abideen**
