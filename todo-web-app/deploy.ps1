# deploy.ps1 - Deploy Todo App to Minikube using .env files
# Usage: .\deploy.ps1

$ErrorActionPreference = "Stop"

Write-Host "Todo App Minikube Deployment" -ForegroundColor Cyan

# Load backend .env
$backendEnv = @{}
Get-Content "./backend/.env" | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"')
        $backendEnv[$key] = $value
    }
}

# Load frontend .env
$frontendEnv = @{}
Get-Content "./frontend/.env" | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"')
        $frontendEnv[$key] = $value
    }
}

Write-Host "Loaded environment variables from .env files" -ForegroundColor Green

# Verify required secrets exist
$requiredBackend = @("DATABASE_URL", "BETTER_AUTH_SECRET", "GEMINI_API_KEY")
foreach ($key in $requiredBackend) {
    if (-not $backendEnv[$key]) {
        Write-Host "Missing required backend secret: $key" -ForegroundColor Red
        exit 1
    }
}

Write-Host "All required secrets found" -ForegroundColor Green

# Create namespace if not exists
Write-Host "Creating namespace..." -ForegroundColor Yellow
kubectl create namespace todo-app --dry-run=client -o yaml | kubectl apply -f -

# Deploy backend
Write-Host "Deploying backend..." -ForegroundColor Yellow
$backendArgs = @(
    "upgrade", "--install", "todo-backend", "./k8s/local/backend",
    "-n", "todo-app",
    "--set", "secrets.databaseUrl=$($backendEnv['DATABASE_URL'])",
    "--set", "secrets.betterAuthSecret=$($backendEnv['BETTER_AUTH_SECRET'])",
    "--set", "secrets.geminiApiKey=$($backendEnv['GEMINI_API_KEY'])",
    "--set", "secrets.groqApiKey=$($backendEnv['GROQ_API_KEY'])"
)
& helm @backendArgs

# Deploy frontend
Write-Host "Deploying frontend..." -ForegroundColor Yellow
$frontendArgs = @(
    "upgrade", "--install", "todo-frontend", "./k8s/local/frontend",
    "-n", "todo-app",
    "--set", "secrets.databaseUrl=$($frontendEnv['DATABASE_URL'])",
    "--set", "secrets.betterAuthSecret=$($frontendEnv['BETTER_AUTH_SECRET'])"
)
& helm @frontendArgs

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Check status:" -ForegroundColor Cyan
Write-Host "   kubectl get pods -n todo-app"
Write-Host ""
Write-Host "Access app:" -ForegroundColor Cyan
Write-Host "   minikube service todo-frontend -n todo-app"
