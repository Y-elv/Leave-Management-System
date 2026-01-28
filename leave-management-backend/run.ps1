# Convenience script to load .env and run the application
# Usage: .\run.ps1

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Load environment variables from .env
& "$scriptPath\load-env.ps1"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to load environment variables. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting Spring Boot application..." -ForegroundColor Green
Write-Host ""

# Run the application
mvn spring-boot:run

