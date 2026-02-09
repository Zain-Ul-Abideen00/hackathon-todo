# run-local.ps1 - Local Development with Dapr
# =============================================================================
# This script starts the backend and notification-service with Dapr sidecars
# for local development and testing. No Kubernetes required.
#
# Prerequisites:
#   1. Dapr CLI installed (dapr --version)
#   2. Dapr initialized locally (dapr init)
#   3. Docker running (for Dapr runtime containers)
#
# Usage:
#   Option 1: Run all services (opens new terminals)
#       .\run-local.ps1
#
#   Option 2: Run specific service manually
#       .\run-local.ps1 -Service backend
#       .\run-local.ps1 -Service notification
#       .\run-local.ps1 -Service frontend
#
# =============================================================================

param(
    [ValidateSet("all", "backend", "notification", "frontend")]
    [string]$Service = "all"
)

$ErrorActionPreference = "Continue"

$ROOT = $PSScriptRoot
$COMPONENTS_PATH = "$ROOT\.dapr\components"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       Local Development with Dapr                             " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "[Check] Verifying prerequisites..." -ForegroundColor Yellow

$daprVersion = dapr --version 2>$null
if (-not $daprVersion) {
    Write-Host "ERROR: Dapr CLI not installed. Run: winget install Dapr.CLI" -ForegroundColor Red
    exit 1
}
Write-Host "   Dapr CLI: OK" -ForegroundColor Green

$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "ERROR: Docker not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "   Docker: OK" -ForegroundColor Green

# Check if Dapr is initialized
$daprContainers = docker ps --filter "name=dapr_" --format "{{.Names}}" 2>$null
if (-not $daprContainers) {
    Write-Host ""
    Write-Host "Dapr not initialized locally. Initializing now..." -ForegroundColor Yellow
    dapr init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to initialize Dapr" -ForegroundColor Red
        exit 1
    }
}
Write-Host "   Dapr Runtime: OK" -ForegroundColor Green
Write-Host ""

function Start-Backend {
    Write-Host "[Backend] Starting on port 8000 with Dapr sidecar..." -ForegroundColor Yellow
    Write-Host "   App ID: backend" -ForegroundColor Gray
    Write-Host "   Dapr HTTP Port: 3500" -ForegroundColor Gray
    Write-Host "   Components: $COMPONENTS_PATH" -ForegroundColor Gray
    Write-Host ""

    Set-Location "$ROOT\backend"

    # Enable Dapr event publishing
    $env:DAPR_ENABLED = "true"

    # Fix Windows encoding for emojis
    $env:PYTHONIOENCODING = "utf-8"

    # Start with Dapr
    dapr run `
        --app-id backend `
        --app-port 8000 `
        --dapr-http-port 3500 `
        --resources-path "$COMPONENTS_PATH" `
        --log-level debug `
        -- uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
}

function Start-NotificationService {
    Write-Host "[Notification] Starting on port 8001 with Dapr sidecar..." -ForegroundColor Yellow
    Write-Host "   App ID: notification-service" -ForegroundColor Gray
    Write-Host "   Dapr HTTP Port: 3501" -ForegroundColor Gray
    Write-Host "   Components: $COMPONENTS_PATH" -ForegroundColor Gray
    Write-Host ""

    Set-Location "$ROOT\notification-service"

    # Fix Windows encoding for emojis
    $env:PYTHONIOENCODING = "utf-8"

    # Start with Dapr
    dapr run `
        --app-id notification-service `
        --app-port 8001 `
        --dapr-http-port 3501 `
        --resources-path "$COMPONENTS_PATH" `
        --log-level debug `
        -- uv run uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
}

function Start-Frontend {
    Write-Host "[Frontend] Starting on port 3000..." -ForegroundColor Yellow
    Set-Location "$ROOT\frontend"
    pnpm dev
}

# Execute based on service parameter
switch ($Service) {
    "backend" {
        Start-Backend
    }
    "notification" {
        Start-NotificationService
    }
    "frontend" {
        Start-Frontend
    }
    "all" {
        Write-Host "Starting all services in separate terminals..." -ForegroundColor Cyan
        Write-Host ""

        # Start backend in new terminal
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT'; .\run-local.ps1 -Service backend"

        # Wait a moment for backend to start
        Start-Sleep -Seconds 3

        # Start notification-service in new terminal
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT'; .\run-local.ps1 -Service notification"

        # Wait a moment
        Start-Sleep -Seconds 2

        # Start frontend in new terminal
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT'; .\run-local.ps1 -Service frontend"

        Write-Host ""
        Write-Host "================================================================" -ForegroundColor Green
        Write-Host "       All services starting in separate terminals!            " -ForegroundColor Green
        Write-Host "================================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Services:" -ForegroundColor Cyan
        Write-Host "   Backend:             http://localhost:8000" -ForegroundColor White
        Write-Host "   Backend Dapr:        http://localhost:3500" -ForegroundColor White
        Write-Host "   Notification:        http://localhost:8001" -ForegroundColor White
        Write-Host "   Notification Dapr:   http://localhost:3501" -ForegroundColor White
        Write-Host "   Frontend:            http://localhost:3000" -ForegroundColor White
        Write-Host ""
        Write-Host "Test pub/sub:" -ForegroundColor Cyan
        Write-Host '   curl.exe -X POST http://localhost:3500/v1.0/publish/taskpubsub/task-events -H "Content-Type: application/json" -d "{\"type\":\"task.created\"}"' -ForegroundColor White
    }
}
