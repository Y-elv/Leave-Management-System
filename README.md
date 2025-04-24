# Leave-Management-System

A full-stack leave management application built with Spring Boot and React TypeScript, featuring Azure AD authentication.

## Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- npm or yarn
- Azure AD account with configured application

## Project Structure

- `leave-management-backend/`: Spring Boot backend application
- `leave-management-frontend/`: React TypeScript frontend application

## Configuration

### Backend Configuration

1. Navigate to `leave-management-backend/src/main/resources/application.properties`
2. Ensure the following properties are configured:
   - Azure AD client ID
   - Azure AD client secret
   - Proper redirect URIs
3. The backend runs on port 8083

### Frontend Configuration

1. Navigate to `leave-management-frontend/`
2. Install dependencies using npm or yarn
3. The frontend runs on port 5174

## Running the Application

### Start the Backend

```bash
cd leave-management-backend
./mvnw spring-boot:run
```

The backend will be available at http://localhost:8083

### Start the Frontend

```bash
cd leave-management-frontend
npm install    # or yarn install
npm run dev    # or yarn dev
```

The frontend will be available at http://localhost:5174

## Authentication

The application uses Azure AD for authentication with the following flow:
1. Frontend initiates auth via '/oauth2/authorization/azure-dev'
2. Backend handles the OAuth2 flow
3. Redirect URI: http://localhost:8083/login/oauth2/code/azure-dev

## Additional Information

For detailed setup and configuration:
- See `leave-management-backend/README.md` for backend-specific instructions
- See `leave-management-frontend/README.md` for frontend-specific instructions