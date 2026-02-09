# run-backend.ps1 - Start backend with Dapr sidecar
# Run this from the todo-web-app directory

$ErrorActionPreference = "Continue"
$ROOT = $PSScriptRoot

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Starting Backend with Dapr Sidecar  " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Enable Dapr event publishing
$env:DAPR_ENABLED = "true"

# Fix Windows encoding for emojis in console output
$env:PYTHONIOENCODING = "utf-8"

# Set components path (absolute path needed for dapr run)
$COMPONENTS_PATH = "$ROOT\.dapr\components"

Write-Host ""
Write-Host "Backend URL:     http://localhost:8000" -ForegroundColor White
Write-Host "Dapr Sidecar:    http://localhost:3500" -ForegroundColor White
Write-Host "Components:      $COMPONENTS_PATH" -ForegroundColor Gray
Write-Host ""

Set-Location "$ROOT\backend"

# Run with dapr
dapr run `
    --app-id backend `
    --app-port 8000 `
    --dapr-http-port 3500 `
    --resources-path $COMPONENTS_PATH `
    -- uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
