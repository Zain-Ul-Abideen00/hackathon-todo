# run-notification.ps1 - Start notification-service with Dapr sidecar
# Run this from the todo-web-app directory

$ErrorActionPreference = "Continue"
$ROOT = $PSScriptRoot

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Starting Notification Service with Dapr " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Set components path (absolute path needed for dapr run)
$COMPONENTS_PATH = "$ROOT\.dapr\components"

# Fix Windows encoding for emojis in console output
$env:PYTHONIOENCODING = "utf-8"

Write-Host ""
Write-Host "Service URL:     http://localhost:8001" -ForegroundColor White
Write-Host "Dapr Sidecar:    http://localhost:3501" -ForegroundColor White
Write-Host "Components:      $COMPONENTS_PATH" -ForegroundColor Gray
Write-Host ""

Set-Location "$ROOT\notification-service"

# Run with dapr
dapr run `
    --app-id notification-service `
    --app-port 8001 `
    --dapr-http-port 3501 `
    --resources-path $COMPONENTS_PATH `
    -- uv run uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
