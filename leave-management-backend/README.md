# Leave Management System Backend

A Spring Boot-based RESTful API for managing employee leave requests.

## Features

- User authentication (simulated Microsoft Authenticator integration)
- Leave request submission and approval workflow
- Leave balance tracking with automatic monthly accrual
- Year-end leave balance processing with carry-forward rules
- Team calendar support
- Admin/HR features for leave management

## Technical Stack

- Java 17
- Spring Boot 3.1.5
- Spring Data JPA
- PostgreSQL
- Lombok
- Maven

## Prerequisites

1. Java 17 or higher
2. PostgreSQL 12 or higher
3. Maven 3.6 or higher

## Setup Instructions

1. Clone the repository
2. Create a PostgreSQL database named `leave_management`
3. Update database credentials in `src/main/resources/application.properties` if needed
4. Run the application:
   ```bash
   mvn spring-boot:run
   ```

## API Endpoints

### Authentication
- POST /auth/login - Simulate login (Microsoft Authenticator integration)
- GET /auth/me - Get current user profile

### Leave Management
- GET /leave - Get user's leave history
- GET /leave/balance - Get user's leave balance
- POST /leave - Submit leave request
- POST /leave/{id}/approve - Approve/reject leave request

## Leave Accrual Rules

- Monthly accrual: 1.66 days
- Yearly entitlement: 20 days
- Maximum carry-forward: 5 days
- Automatic monthly accrual on 1st of each month
- Year-end balance processing on January 1st

## Security Notes

This is a basic implementation. In production:
1. Implement proper authentication using Microsoft Authenticator
2. Add request validation
3. Implement proper error handling
4. Add API documentation
5. Add comprehensive logging
6. Implement proper security measures
