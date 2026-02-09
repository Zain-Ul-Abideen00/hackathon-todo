<#
.SYNOPSIS
    Deploy the Todo Web App to Minikube with Dapr and Kafka

.DESCRIPTION
    This script deploys the entire Todo Web App stack to a Minikube cluster including:
    - Kafka cluster (via Strimzi operator)
    - Dapr components (pub/sub, state store, secrets)
    - All microservices (backend, frontend, notification, recurring, audit, websocket)

    Secrets are loaded from .env files and passed via helm --set (never committed to git)

.PARAMETER Step
    Run a specific deployment step (1-8) or 'all' for complete deployment

.PARAMETER Namespace
    The namespace to deploy to (default: todo-app)

.PARAMETER SkipBuild
    Skip Docker image build step

.EXAMPLE
    .\deploy-k8s.ps1 -Step all
    .\deploy-k8s.ps1 -Step 3 -SkipBuild
#>

param(
    [Parameter()]
    [string]$Step = "all",

    [string]$Namespace = "todo-app",

    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$K8sRoot = Split-Path -Parent $ScriptRoot
$ProjectRoot = Split-Path -Parent $K8sRoot

# Colors for output
function Write-Step {
    param($msg)
    Write-Host "`n=== $msg ===" -ForegroundColor Cyan
}

function Write-Success {
    param($msg)
    Write-Host "[OK] $msg" -ForegroundColor Green
}

function Write-Info {
    param($msg)
    Write-Host "  $msg" -ForegroundColor Yellow
}

# Load .env file into hashtable
function Load-EnvFile {
    param($path)
    $env = @{}
    if (Test-Path $path) {
        Get-Content $path | ForEach-Object {
            if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim().Trim('"')
                $env[$key] = $value
            }
        }
    }
    return $env
}

Write-Host @"
================================================================
     Todo Web App - Kubernetes Deployment Script
     Dapr + Kafka + Microservices
================================================================
"@ -ForegroundColor Magenta

# Load environment variables from .env files
$backendEnv = Load-EnvFile "$ProjectRoot\backend\.env"
$frontendEnv = Load-EnvFile "$ProjectRoot\frontend\.env"

# Step 1: Prerequisites Check
function Step-1-Prerequisites {
    Write-Step "Step 1: Checking Prerequisites"

    # Check Minikube (suppress stderr to avoid NativeCommandError)
    $mkStatus = minikube status --format='{{.Host}}' 2>$null
    if ($mkStatus -ne "Running") {
        Write-Host "[ERROR] Minikube not running. Start with:" -ForegroundColor Red
        Write-Host "  minikube start" -ForegroundColor Yellow
        exit 1
    }
    Write-Success "Minikube is running"

    # Check Helm
    $helmCheck = helm version 2>$null
    if (-not $helmCheck) {
        Write-Host "[ERROR] Helm not installed. Install from https://helm.sh/docs/intro/install/" -ForegroundColor Red
        exit 1
    }
    Write-Success "Helm is installed"

    # Check Dapr (check for dapr-system namespace instead of dapr CLI)
    $daprNs = kubectl get namespace dapr-system --ignore-not-found 2>$null
    if (-not $daprNs) {
        Write-Info "Installing Dapr on Kubernetes..."
        dapr init -k --wait
    }
    Write-Success "Dapr is installed on Kubernetes"

    # Configure Docker to use Minikube's daemon
    # Write-Info "Configuring Docker to use Minikube's daemon..."
    # & minikube -p minikube docker-env --shell powershell | Invoke-Expression
    # Write-Success "Docker configured for Minikube"

    # Check Docker Desktop is running
    $dockerCheck = docker info 2>$null
    if (-not $dockerCheck) {
        Write-Host "[ERROR] Docker Desktop not running. Start Docker Desktop first." -ForegroundColor Red
        exit 1
    }
    Write-Success "Docker Desktop is running"

    # Verify secrets from .env
    $requiredBackend = @("DATABASE_URL", "BETTER_AUTH_SECRET", "GEMINI_API_KEY")
    foreach ($key in $requiredBackend) {
        if (-not $backendEnv[$key]) {
            Write-Host "[ERROR] Missing required secret in backend/.env: $key" -ForegroundColor Red
            exit 1
        }
    }
    Write-Success "All required secrets found in .env files"
}


# Step 2: Install Strimzi and Deploy Kafka
function Step-2-Kafka {
    Write-Step "Step 2: Deploying Kafka (Strimzi)"

    # Install Strimzi operator (check by looking for the deployment, not pods)
    $strimziDeploy = kubectl get deployment strimzi-cluster-operator -n kafka --ignore-not-found 2>$null
    if (-not $strimziDeploy) {
        Write-Info "Installing Strimzi Kafka operator..."
        helm repo add strimzi https://strimzi.io/charts/ 2>$null
        helm repo update 2>$null
        helm install strimzi-kafka-operator strimzi/strimzi-kafka-operator `
            --namespace kafka --create-namespace --wait
    }
    Write-Success "Strimzi operator installed"

    # Deploy Kafka cluster
    Write-Info "Deploying Kafka cluster and topics..."
    kubectl apply -f "$K8sRoot\cloud\kafka\namespace.yaml"
    kubectl apply -f "$K8sRoot\cloud\kafka\cluster.yaml"

    # Wait for Kafka to be ready
    Write-Info "Waiting for Kafka cluster to be ready (may take 2-3 minutes)..."
    kubectl wait kafka/kafka-cluster --for=condition=Ready --timeout=300s -n kafka 2>$null
    Write-Success "Kafka cluster is ready"

    # Verify topics
    $topics = kubectl get kafkatopics -n kafka -o name 2>$null
    if ($topics) {
        Write-Success "Kafka topics created: $($topics -join ', ')"
    } else {
        Write-Info "Kafka topics will be created when cluster is fully ready"
    }
}


# Step 3: Create Namespace
function Step-3-Namespace {
    Write-Step "Step 3: Creating Namespace"

    # Create namespace
    kubectl apply -f "$ScriptRoot\namespace.yaml"
    Write-Success "Namespace '$Namespace' created"
}

# Step 4: Deploy Dapr Components
function Step-4-Dapr {
    Write-Step "Step 4: Deploying Dapr Components"

    # Apply all Dapr components
    kubectl apply -f "$ProjectRoot\dapr\pubsub.yaml" -n $Namespace
    kubectl apply -f "$ProjectRoot\dapr\statestore.yaml" -n $Namespace
    kubectl apply -f "$ProjectRoot\dapr\secretstore.yaml" -n $Namespace

    # Apply subscriptions
    $subsPath = "$ProjectRoot\dapr\subscriptions"
    if (Test-Path $subsPath) {
        kubectl apply -f $subsPath -n $Namespace
    }
    Write-Success "Dapr components and subscriptions deployed"

    # Verify components
    $components = kubectl get components -n $Namespace -o name 2>&1
    Write-Success "Dapr components: $($components -join ', ')"
}

# Step 5: Build Docker Images (Docker Desktop) and Load into Minikube
function Step-5-Build {
    Write-Step "Step 5: Building Docker Images"

    if ($SkipBuild) {
        Write-Info "Skipping Docker build (--SkipBuild flag)"
        return
    }

    $services = @(
        @{ Name = "backend"; Image = "todo-backend" },
        @{ Name = "frontend"; Image = "todo-frontend" },
        @{ Name = "notification-service"; Image = "todo-notification-service" },
        @{ Name = "recurring-service"; Image = "todo-recurring-service" },
        @{ Name = "audit-service"; Image = "todo-audit-service" },
        @{ Name = "websocket-service"; Image = "todo-websocket-service" }
    )

    # First, delete existing deployments so images aren't in use
    Write-Info "Cleaning up existing deployments..."
    $ErrorActionPreference = "SilentlyContinue"
    helm uninstall todo-backend -n todo-app 2>&1 | Out-Null
    helm uninstall todo-frontend -n todo-app 2>&1 | Out-Null
    helm uninstall todo-notification-service -n todo-app 2>&1 | Out-Null
    helm uninstall todo-recurring-service -n todo-app 2>&1 | Out-Null
    helm uninstall todo-audit-service -n todo-app 2>&1 | Out-Null
    helm uninstall todo-websocket-service -n todo-app 2>&1 | Out-Null

    # Wait for pods to terminate
    Write-Info "Waiting for pods to terminate..."
    Start-Sleep -Seconds 5

    # Clean old images from Minikube (use SSH to force remove)
    Write-Info "Cleaning old images from Minikube..."
    foreach ($svc in $services) {
        # Use minikube ssh to run docker rmi with force flag
        minikube ssh "docker rmi -f $($svc.Image):latest" 2>&1 | Out-Null
    }
    $ErrorActionPreference = "Stop"
    Write-Success "Cleanup complete"

    # Build images using Docker Desktop (faster - uses host resources)
    Write-Info "Building images with Docker Desktop..."
    foreach ($svc in $services) {
        $svcPath = "$ProjectRoot\$($svc.Name)"
        if (Test-Path "$svcPath\Dockerfile") {
            Write-Info "Building $($svc.Name)..."
            docker build -t "$($svc.Image):latest" $svcPath
            if ($LASTEXITCODE -eq 0) {
                Write-Success "$($svc.Name) image built"
            } else {
                Write-Host "[ERROR] Failed to build $($svc.Name)" -ForegroundColor Red
                return
            }
        } else {
            Write-Info "No Dockerfile found for $($svc.Name), skipping..."
        }
    }

    # Load all images into Minikube
    Write-Info "Loading images into Minikube (this may take a few minutes)..."
    $imageNames = ($services | ForEach-Object { "$($_.Image):latest" }) -join " "

    foreach ($svc in $services) {
        Write-Info "Loading $($svc.Image)..."
        minikube image load "$($svc.Image):latest"
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$($svc.Image) loaded into Minikube"
        } else {
            Write-Host "[WARN] Failed to load $($svc.Image), will try to pull from registry" -ForegroundColor Yellow
        }
    }

    Write-Success "All images built and loaded into Minikube"
}


# Step 6: Deploy Services via Helm (with secrets from .env)
function Step-6-Deploy {
    Write-Step "Step 6: Deploying Services via Helm"

    # Deploy backend with secrets from .env
    Write-Info "Deploying backend..."
    $backendArgs = @(
        "upgrade", "--install", "todo-backend", "$ScriptRoot\backend",
        "-n", $Namespace, "--create-namespace",
        "--set", "secrets.databaseUrl=$($backendEnv['DATABASE_URL'])",
        "--set", "secrets.betterAuthSecret=$($backendEnv['BETTER_AUTH_SECRET'])",
        "--set", "secrets.geminiApiKey=$($backendEnv['GEMINI_API_KEY'])",
        "--set", "secrets.groqApiKey=$($backendEnv['GROQ_API_KEY'])",
        "--wait", "--timeout", "120s"
    )
    & helm @backendArgs
    Write-Success "backend deployed"

    # Deploy frontend with secrets from .env
    Write-Info "Deploying frontend..."
    $frontendArgs = @(
        "upgrade", "--install", "todo-frontend", "$ScriptRoot\frontend",
        "-n", $Namespace,
        "--set", "secrets.databaseUrl=$($frontendEnv['DATABASE_URL'])",
        "--set", "secrets.betterAuthSecret=$($frontendEnv['BETTER_AUTH_SECRET'])",
        "--wait", "--timeout", "120s"
    )
    & helm @frontendArgs
    Write-Success "frontend deployed"

    # Deploy other services (no secrets needed)
    $otherCharts = @("notification-service", "recurring-service", "audit-service", "websocket-service")
    foreach ($chart in $otherCharts) {
        $chartPath = "$ScriptRoot\$chart"
        if (Test-Path $chartPath) {
            Write-Info "Deploying $chart..."
            helm upgrade --install "todo-$chart" $chartPath `
                --namespace $Namespace `
                --wait --timeout 120s
            Write-Success "$chart deployed"
        } else {
            Write-Info "Chart not found: $chartPath, skipping..."
        }
    }
}

# Step 7: Verify Deployment
function Step-7-Verify {
    Write-Step "Step 7: Verifying Deployment"

    Write-Info "Checking pods..."
    kubectl get pods -n $Namespace -o wide

    Write-Info "Checking services..."
    kubectl get svc -n $Namespace

    Write-Info "Checking Dapr components..."
    kubectl get components -n $Namespace

    Write-Info "To open Dapr Dashboard, run: dapr dashboard -k"
}

# Step 8: Port Forward
function Step-8-PortForward {
    Write-Step "Step 8: Setting up Port Forwarding"

    Write-Info "Starting port forwards in background..."
    Start-Job -ScriptBlock { kubectl port-forward svc/todo-backend 8000:8000 -n todo-app } -Name "backend-pf"
    Start-Job -ScriptBlock { kubectl port-forward svc/todo-frontend 3000:3000 -n todo-app } -Name "frontend-pf"
    Start-Job -ScriptBlock { kubectl port-forward svc/todo-websocket-service 8004:8004 -n todo-app } -Name "websocket-pf"

    Write-Host @"

Port forwards started:
  - Backend:   http://localhost:8000
  - Frontend:  http://localhost:3000
  - WebSocket: ws://localhost:8004

To stop: Get-Job | Stop-Job | Remove-Job
"@ -ForegroundColor Green
}

# Main execution
switch ($Step) {
    "1" { Step-1-Prerequisites }
    "2" { Step-2-Kafka }
    "3" { Step-3-Namespace }
    "4" { Step-4-Dapr }
    "5" { Step-5-Build }
    "6" { Step-6-Deploy }
    "7" { Step-7-Verify }
    "8" { Step-8-PortForward }
    "all" {
        Step-1-Prerequisites
        Step-2-Kafka
        Step-3-Namespace
        Step-4-Dapr
        Step-5-Build
        Step-6-Deploy
        Step-7-Verify
        Write-Host "`n[SUCCESS] Deployment complete! Run '.\deploy-k8s.ps1 -Step 8' for port forwarding." -ForegroundColor Green
    }
    default {
        Write-Host "Usage: .\deploy-k8s.ps1 -Step [1-8|all]" -ForegroundColor Yellow
        Write-Host @"
Steps:
  1. Prerequisites - Check Minikube, Helm, Dapr, .env files
  2. Kafka        - Install Strimzi and deploy Kafka cluster
  3. Namespace    - Create todo-app namespace
  4. Dapr         - Deploy Dapr components
  5. Build        - Build Docker images
  6. Deploy       - Deploy services via Helm (secrets from .env)
  7. Verify       - Check deployment status
  8. PortForward  - Setup port forwarding
  all             - Run all steps
"@
    }
}
