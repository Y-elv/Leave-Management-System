# PowerShell script to load .env file and set environment variables
# This script reads the .env file and sets environment variables for the current session

$envFile = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env file not found at $envFile" -ForegroundColor Red
    exit 1
}

Write-Host "Loading environment variables from .env file..." -ForegroundColor Green

# Read .env file and set environment variables
Get-Content $envFile | ForEach-Object {
    # Skip empty lines and comments
    if ($_ -match '^\s*#|^\s*$') {
        return
    }
    
    # Parse KEY="VALUE" or KEY=VALUE format
    if ($_ -match '^\s*([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove quotes if present
        if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") {
            $value = $matches[1]
        }
        
        # Fix sslmode\=require to sslmode=require (remove backslash)
        $value = $value -replace '\\=', '='
        
        # Set environment variable
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
        Write-Host "  Set: $key" -ForegroundColor Gray
    }
}

Write-Host "Environment variables loaded successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run the application with:" -ForegroundColor Cyan
Write-Host "  mvn spring-boot:run" -ForegroundColor White

exit 0

