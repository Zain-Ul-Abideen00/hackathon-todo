# run-all-services.ps1 - Start all microservices with Dapr sidecars
# =============================================================================
# This script starts all services for the full event-driven architecture:
# - Backend (port 8000, Dapr 3500)
# - Notification (port 8001, Dapr 3501)
# - Recurring (port 8002, Dapr 3502)
# - Audit (port 8003, Dapr 3503)
# - WebSocket (port 8004, Dapr 3504)
# - Frontend (port 3000)
#
# Prerequisites:
# - dapr init --slim (installs binaries without Docker containers)
# - Docker: Redis container running on port 6379
# =============================================================================

param(
    [switch]$StopOnly  # Use -StopOnly to just stop all services without starting new ones
)

$ErrorActionPreference = "Continue"
$ROOT = $PSScriptRoot
$COMPONENTS_PATH = "$ROOT\.dapr\components"
$CONFIG_PATH = "$ROOT\.dapr\config.yaml"
$DAPR_BIN = "$env:USERPROFILE\.dapr\bin"

# Function to stop all Dapr services and free ports
function Stop-AllServices {
    Write-Host "Stopping all Dapr services..." -ForegroundColor Yellow

    # Stop Dapr instances gracefully via dapr CLI
    $services = @("backend", "notification-service", "recurring-service", "audit-service", "websocket-service")
    foreach ($svc in $services) {
        dapr stop --app-id $svc 2>$null
    }

    # Kill scheduler process
    Get-Process -Name "scheduler" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

    # Kill only our service processes (NOT Docker!)
    # Target specific process names instead of arbitrary port killing
    $processNames = @("daprd", "uvicorn", "python")
    foreach ($procName in $processNames) {
        Get-Process -Name $procName -ErrorAction SilentlyContinue | ForEach-Object {
            # Only kill if command line contains our service paths
            $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
            if ($cmdLine -and ($cmdLine -match "backend|notification-service|recurring-service|audit-service|websocket-service")) {
                Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
                Write-Host "   Stopped: $procName (PID $($_.Id))" -ForegroundColor Gray
            }
        }
    }

    # Also stop any leftover PowerShell terminals running our services
    # (These are the -NoExit terminals we spawned)
    Get-Process -Name "powershell" -ErrorAction SilentlyContinue | ForEach-Object {
        $cmdLine = (Get-CimInstance Win32_Process -Filter "ProcessId = $($_.Id)" -ErrorAction SilentlyContinue).CommandLine
        if ($cmdLine -and ($cmdLine -match "dapr run" -or $cmdLine -match "pnpm dev")) {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
            Write-Host "   Stopped: terminal (PID $($_.Id))" -ForegroundColor Gray
        }
    }

    Write-Host "[OK] All services stopped" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# Stop any existing services first
Stop-AllServices

if ($StopOnly) {
    Write-Host "Services stopped. Use without -StopOnly to restart." -ForegroundColor Cyan
    exit 0
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "       Starting All Services with Dapr (Slim Mode)             " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Fix Windows encoding
$env:PYTHONIOENCODING = "utf-8"

# Ensure Redis is running
$redis = docker ps --filter "name=dapr_redis" --format "{{.Names}}" 2>$null
if (-not $redis) {
    Write-Host "Starting Redis..." -ForegroundColor Yellow
    docker run -d --name dapr_redis -p 6379:6379 redis:6 2>$null
    if ($LASTEXITCODE -ne 0) {
        docker start dapr_redis 2>$null
    }
    Start-Sleep -Seconds 2
}
Write-Host "   [OK] Redis running on port 6379" -ForegroundColor Green

# Start Dapr Scheduler (for Jobs API - runs in background)
$schedulerRunning = Get-Process -Name "scheduler" -ErrorAction SilentlyContinue
if (-not $schedulerRunning) {
    Write-Host "Starting Dapr Scheduler..." -ForegroundColor Yellow
    $schedulerPath = "$DAPR_BIN\scheduler.exe"
    if (Test-Path $schedulerPath) {
        Start-Process -FilePath $schedulerPath -ArgumentList "--etcd-data-dir=$env:TEMP\dapr-scheduler" -WindowStyle Hidden
        Start-Sleep -Seconds 2
        Write-Host "   [OK] Scheduler running on port 6060" -ForegroundColor Green
    } else {
        Write-Host "   [SKIP] Scheduler not found (Jobs API disabled)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [OK] Scheduler already running" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting services in separate terminals..." -ForegroundColor Yellow
Write-Host ""

# Start Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$ROOT\backend'
`$env:DAPR_ENABLED = 'true'
`$env:PYTHONIOENCODING = 'utf-8'
dapr run --app-id backend --app-port 8000 --dapr-http-port 3500 --resources-path '$COMPONENTS_PATH' --config '$CONFIG_PATH' --log-level warn -- uv run uvicorn src.main:app --host 0.0.0.0 --port 8000
"@
Write-Host "   [OK] Backend starting..." -ForegroundColor Green
Start-Sleep -Seconds 3

# Start Notification Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$ROOT\notification-service'
`$env:PYTHONIOENCODING = 'utf-8'
dapr run --app-id notification-service --app-port 8001 --dapr-http-port 3501 --resources-path '$COMPONENTS_PATH' --config '$CONFIG_PATH' --log-level warn -- uv run uvicorn src.main:app --host 0.0.0.0 --port 8001
"@
Write-Host "   [OK] Notification Service starting..." -ForegroundColor Green
Start-Sleep -Seconds 3

# Start Recurring Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$ROOT\recurring-service'
`$env:PYTHONIOENCODING = 'utf-8'
dapr run --app-id recurring-service --app-port 8002 --dapr-http-port 3502 --resources-path '$COMPONENTS_PATH' --config '$CONFIG_PATH' --log-level warn -- uv run uvicorn src.main:app --host 0.0.0.0 --port 8002
"@
Write-Host "   [OK] Recurring Service starting..." -ForegroundColor Green
Start-Sleep -Seconds 3

# Start Audit Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$ROOT\audit-service'
`$env:PYTHONIOENCODING = 'utf-8'
dapr run --app-id audit-service --app-port 8003 --dapr-http-port 3503 --resources-path '$COMPONENTS_PATH' --config '$CONFIG_PATH' --log-level warn -- uv run uvicorn src.main:app --host 0.0.0.0 --port 8003
"@
Write-Host "   [OK] Audit Service starting..." -ForegroundColor Green
Start-Sleep -Seconds 3

# Start WebSocket Service
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$ROOT\websocket-service'
`$env:PYTHONIOENCODING = 'utf-8'
dapr run --app-id websocket-service --app-port 8004 --dapr-http-port 3504 --resources-path '$COMPONENTS_PATH' --config '$CONFIG_PATH' --log-level warn -- uv run uvicorn src.main:app --host 0.0.0.0 --port 8004
"@
Write-Host "   [OK] WebSocket Service starting..." -ForegroundColor Green
Start-Sleep -Seconds 2

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT\frontend'; pnpm dev"
Write-Host "   [OK] Frontend starting..." -ForegroundColor Green

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "       All services starting in separate terminals!            " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Cyan
Write-Host "   Backend:             http://localhost:8000  (Dapr: 3500)" -ForegroundColor White
Write-Host "   Notification:        http://localhost:8001  (Dapr: 3501)" -ForegroundColor White
Write-Host "   Recurring:           http://localhost:8002  (Dapr: 3502)" -ForegroundColor White
Write-Host "   Audit:               http://localhost:8003  (Dapr: 3503)" -ForegroundColor White
Write-Host "   WebSocket:           http://localhost:8004  (Dapr: 3504)" -ForegroundColor White
Write-Host "   Frontend:            http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Commands:" -ForegroundColor Cyan
Write-Host "   Stop all:  .\run-all-services.ps1 -StopOnly" -ForegroundColor White
Write-Host ""
Write-Host "Test pub/sub:" -ForegroundColor Cyan
Write-Host '   Invoke-RestMethod -Method POST -Uri "http://localhost:3500/v1.0/publish/taskpubsub/task-events" -ContentType "application/json" -Body ''{"event_type":"TaskCreated","task_id":999,"user_id":"test","title":"Test","timestamp":"2026-02-08T00:00:00Z"}''' -ForegroundColor White
