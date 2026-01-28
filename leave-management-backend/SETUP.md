# Backend Setup Guide

## Required Environment Variables

Before running the backend, you need to set the following environment variables:

### Database Configuration
- `DB_URL` - PostgreSQL connection URL (e.g., `jdbc:postgresql://localhost:5432/leave_management`)
- `DB_USERNAME` - Database username (e.g., `postgres`)
- `DB_PASSWORD` - Database password

### JWT Configuration
- `JWT_SECRET` - Secret key for JWT token generation (use a strong random string)
- `JWT_EXPIRATION` - Token expiration time in milliseconds (e.g., `86400000` for 24 hours)

### OAuth2 Configuration (Azure AD)
- `client-id` - Azure AD application client ID
- `client-secret` - Azure AD application client secret
- `issuer-uri` - Azure AD issuer URI (e.g., `https://login.microsoftonline.com/{tenant-id}/v2.0`)

### Email Configuration (Gmail SMTP)
- `mail_port` - SMTP port (usually `587`)
- `mail_username` - Your Gmail address
- `mail_password` - Your Gmail app password (not your regular password)

## Quick Setup (PowerShell)

Run the `setup-env.ps1` script in this directory, or manually set variables:

```powershell
$env:DB_URL = "jdbc:postgresql://localhost:5432/leave_management"
$env:DB_USERNAME = "postgres"
$env:DB_PASSWORD = "your_password"
$env:JWT_SECRET = "your-secret-key-here"
$env:JWT_EXPIRATION = "86400000"
$env:client-id = "your-azure-client-id"
$env:client-secret = "your-azure-client-secret"
$env:issuer-uri = "https://login.microsoftonline.com/your-tenant-id/v2.0"
$env:mail_port = "587"
$env:mail_username = "your-email@gmail.com"
$env:mail_password = "your-app-password"
```

## Running the Application

After setting environment variables:

```powershell
mvn spring-boot:run
```

Or using the JAR:

```powershell
java -jar target/leave-management-backend-0.0.1-SNAPSHOT.jar
```

## Database Setup

1. Make sure PostgreSQL is running
2. Create a database:
   ```sql
   CREATE DATABASE leave_management;
   ```
3. The application will automatically create tables on first run (due to `spring.jpa.hibernate.ddl-auto=update`)

