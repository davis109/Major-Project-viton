# PowerShell script to start AI VITON backend
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  AI VITON Backend Starter" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv_viton\Scripts\Activate.ps1"

Write-Host ""
Write-Host "Starting FastAPI backend server..." -ForegroundColor Green
Set-Location backend
python app.py
