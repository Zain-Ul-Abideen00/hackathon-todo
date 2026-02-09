# deploy-dapr.ps1 - Phase 5: Deploy with Dapr Integration
# =============================================================================
# This script deploys the Todo App with Dapr sidecar injection enabled.
# It creates proper Kubernetes secrets (not Helm values) for security.
#
# Features:
#   - Reads secrets from backend/.env
#   - Creates K8s secrets via kubectl (proper secret management)
#   - Deploys Dapr components (pubsub, statestore, secretstore)
#   - Deploys backend and notification-service with Dapr sidecars
#
# Prerequisites:
#   - Minikube running with docker-env applied
#   - Docker images built: todo-backend:latest, notification-service:latest
#   - Dapr installed in cluster: dapr init -k --wait
#
# Usage: .\deploy-dapr.ps1
# =============================================================================

# Use Continue for non-terminating errors (kubectl warnings)
$ErrorActionPreference = "Continue"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       Phase 5: Dapr Integration Deployment                    " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$NAMESPACE = "todo-app"
$BACKEND_ENV_PATH = "./backend/.env"
$DAPR_COMPONENTS_PATH = "./dapr"

# =============================================================================
# Step 1: Load secrets from backend/.env
# =============================================================================
Write-Host "[1/6] Loading secrets from $BACKEND_ENV_PATH..." -ForegroundColor Yellow

if (-not (Test-Path $BACKEND_ENV_PATH)) {
    Write-Host "ERROR: $BACKEND_ENV_PATH not found!" -ForegroundColor Red
    Write-Host "Please create backend/.env with required secrets." -ForegroundColor Red
    exit 1
}

$secrets = @{}
Get-Content $BACKEND_ENV_PATH | ForEach-Object {
    $line = $_
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $parts = $line -split "=", 2
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim().Trim('"')
            $secrets[$key] = $value
        }
    }
}

# Verify required secrets
$requiredSecrets = @("DATABASE_URL", "BETTER_AUTH_SECRET")
foreach ($key in $requiredSecrets) {
    if (-not $secrets[$key]) {
        Write-Host "ERROR: Missing required secret: $key" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   Loaded $($secrets.Count) environment variables" -ForegroundColor Green

# =============================================================================
# Step 2: Create namespace
# =============================================================================
Write-Host "[2/6] Creating namespace '$NAMESPACE'..." -ForegroundColor Yellow
$nsExists = kubectl get namespace $NAMESPACE --ignore-not-found -o name 2>$null
if (-not $nsExists) {
    kubectl create namespace $NAMESPACE
}
Write-Host "   Namespace ready" -ForegroundColor Green

# =============================================================================
# Step 3: Create Kubernetes secrets (proper secret management)
# =============================================================================
Write-Host "[3/6] Creating Kubernetes secrets..." -ForegroundColor Yellow

# Delete existing secret if exists (to update)
kubectl delete secret backend-secrets -n $NAMESPACE --ignore-not-found 2>$null

# Create secret with all values from .env
$secretArgs = @(
    "create", "secret", "generic", "backend-secrets",
    "-n", $NAMESPACE,
    "--from-literal=DATABASE_URL=$($secrets['DATABASE_URL'])",
    "--from-literal=BETTER_AUTH_SECRET=$($secrets['BETTER_AUTH_SECRET'])",
    "--from-literal=CORS_ORIGINS=$($secrets['CORS_ORIGINS'])",
    "--from-literal=ENVIRONMENT=$($secrets['ENVIRONMENT'])"
)

# Add optional secrets if they exist
if ($secrets['GEMINI_API_KEY']) {
    $secretArgs += "--from-literal=GEMINI_API_KEY=$($secrets['GEMINI_API_KEY'])"
}
if ($secrets['GROQ_API_KEY']) {
    $secretArgs += "--from-literal=GROQ_API_KEY=$($secrets['GROQ_API_KEY'])"
}

& kubectl @secretArgs
Write-Host "   Kubernetes secret 'backend-secrets' created" -ForegroundColor Green

# =============================================================================
# Step 4: Deploy Dapr components
# =============================================================================
Write-Host "[4/6] Deploying Dapr components..." -ForegroundColor Yellow

if (Test-Path $DAPR_COMPONENTS_PATH) {
    kubectl apply -f $DAPR_COMPONENTS_PATH -n $NAMESPACE
    Write-Host "   Dapr components deployed" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Dapr components path not found, skipping..." -ForegroundColor DarkYellow
}

# =============================================================================
# Step 5: Deploy Backend with Dapr
# =============================================================================
Write-Host "[5/6] Deploying backend service with Dapr sidecar..." -ForegroundColor Yellow

# Uninstall existing if present
helm uninstall backend -n $NAMESPACE 2>$null

# Install with Dapr enabled and local image
$backendArgs = @(
    "install", "backend", "./k8s/local/backend",
    "-n", $NAMESPACE,
    "--set", "image.repository=todo-backend",
    "--set", "image.tag=latest",
    "--set", "image.pullPolicy=Never",
    "--set", "dapr.enabled=true",
    "--set", "secrets.databaseUrl=$($secrets['DATABASE_URL'])",
    "--set", "secrets.betterAuthSecret=$($secrets['BETTER_AUTH_SECRET'])",
    "--set", "secrets.geminiApiKey=$($secrets['GEMINI_API_KEY'])",
    "--set", "secrets.groqApiKey=$($secrets['GROQ_API_KEY'])"
)
& helm @backendArgs
Write-Host "   Backend deployed with Dapr sidecar" -ForegroundColor Green

# =============================================================================
# Step 6: Deploy Notification Service with Dapr
# =============================================================================
Write-Host "[6/6] Deploying notification-service with Dapr sidecar..." -ForegroundColor Yellow

# Uninstall existing if present
helm uninstall notification-service -n $NAMESPACE 2>$null

$notificationArgs = @(
    "install", "notification-service", "./k8s/local/notification-service",
    "-n", $NAMESPACE,
    "--set", "image.repository=notification-service",
    "--set", "image.tag=latest",
    "--set", "image.pullPolicy=Never",
    "--set", "dapr.enabled=true"
)
& helm @notificationArgs
Write-Host "   Notification service deployed with Dapr sidecar" -ForegroundColor Green

# =============================================================================
# Summary
# =============================================================================
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "           Deployment Complete!                                " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Check pod status:" -ForegroundColor Cyan
Write-Host "   kubectl get pods -n $NAMESPACE" -ForegroundColor White
Write-Host ""
Write-Host "View backend logs:" -ForegroundColor Cyan
Write-Host "   kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=todo-backend -f" -ForegroundColor White
Write-Host ""
Write-Host "View notification-service logs:" -ForegroundColor Cyan
Write-Host "   kubectl logs -n $NAMESPACE -l app.kubernetes.io/name=notification-service -f" -ForegroundColor White
Write-Host ""
Write-Host "Access backend API (via NodePort):" -ForegroundColor Cyan
Write-Host "   minikube service backend-todo-backend -n $NAMESPACE --url" -ForegroundColor White
Write-Host ""

# Show current pod status
Write-Host "Current Pod Status:" -ForegroundColor Cyan
kubectl get pods -n $NAMESPACE
