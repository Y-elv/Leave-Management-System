# Neon Database Setup Guide

## Getting Your Neon Connection Details

1. Log in to your [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to the **Connection Details** section
4. You'll see a connection string like:
   ```
   postgresql://username:password@ep-xxxxx-xxxxx.region.aws.neon.tech/database?sslmode=require
   ```

## Converting Neon Connection String to JDBC Format

Neon provides a connection string in this format:
```
postgresql://username:password@hostname/database?sslmode=require
```

Spring Boot needs it in JDBC format:
```
jdbc:postgresql://hostname:5432/database?sslmode=require
```

### Example Conversion:

**Neon gives you:**
```
postgresql://myuser:mypass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Use for DB_URL:**
```
jdbc:postgresql://ep-cool-name-123456.us-east-2.aws.neon.tech:5432/neondb?sslmode=require
```

**Extract:**
- **DB_USERNAME**: `myuser`
- **DB_PASSWORD**: `mypass`
- **DB_URL**: `jdbc:postgresql://ep-cool-name-123456.us-east-2.aws.neon.tech:5432/neondb?sslmode=require`

## Quick Setup (PowerShell)

1. Edit `setup-env.ps1` with your Neon credentials
2. Run the script:
   ```powershell
   .\setup-env.ps1
   ```
3. Or set manually:
   ```powershell
   $env:DB_URL = "jdbc:postgresql://your-neon-host:5432/your-database?sslmode=require"
   $env:DB_USERNAME = "your-neon-username"
   $env:DB_PASSWORD = "your-neon-password"
   $env:JWT_SECRET = "your-secret-key"
   $env:JWT_EXPIRATION = "86400000"
   ```

## Important Notes

- **SSL is required**: Always include `?sslmode=require` in your connection string
- **Port**: Neon uses port `5432` (standard PostgreSQL port)
- **Database name**: Usually `neondb` or the name you specified when creating the database
- **Host**: The hostname from Neon (usually starts with `ep-`)

## Testing the Connection

After setting environment variables, run:
```powershell
mvn spring-boot:run
```

The application will automatically create tables on first run (due to `spring.jpa.hibernate.ddl-auto=update`).

