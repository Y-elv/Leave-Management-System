# PowerShell script to set up environment variables for the Leave Management Backend
# Modify the values below according to your setup

Write-Host "Setting up environment variables for Leave Management Backend..." -ForegroundColor Green

# Database Configuration (Neon PostgreSQL)
# Neon connection string format: postgresql://username:password@hostname/database?sslmode=require
# Convert to JDBC format: jdbc:postgresql://hostname:5432/database?sslmode=require
# Example: If Neon gives you: postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
# Use: jdbc:postgresql://ep-cool-name-123456.us-east-2.aws.neon.tech:5432/neondb?sslmode=require

$env:DB_URL = "jdbc:postgresql://your-neon-host:5432/your-database?sslmode=require"
$env:DB_USERNAME = "your-neon-username"
$env:DB_PASSWORD = "your-neon-password"

# JWT Configuration
$env:JWT_SECRET = "your-jwt-secret-key-change-this-in-production"
$env:JWT_EXPIRATION = "86400000"  # 24 hours in milliseconds

# OAuth2 Configuration (Azure AD)
$env:client-id = "your-azure-client-id"
$env:client-secret = "your-azure-client-secret"
$env:issuer-uri = "https://login.microsoftonline.com/your-tenant-id/v2.0"

# Email Configuration (Gmail SMTP)
$env:mail_port = "587"
$env:mail_username = "your-email@gmail.com"
$env:mail_password = "your-gmail-app-password"

Write-Host "Environment variables set!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Please update the values in this script with your actual credentials." -ForegroundColor Yellow
Write-Host ""
Write-Host "To run the application, use:" -ForegroundColor Cyan
Write-Host "  mvn spring-boot:run" -ForegroundColor White

