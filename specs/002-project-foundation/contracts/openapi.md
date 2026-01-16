# API Contracts: Project Foundation Setup (Module 1)

**Branch**: `002-project-foundation` | **Date**: 2026-01-08

## Overview

Module 1 establishes the project foundation and defines only one API endpoint: the health check.

---

## Health Check Endpoint

### GET /api/health

**Purpose**: Verify backend service is running and responsive.

**Request**:
- Method: `GET`
- Path: `/api/health`
- Authentication: None required

**Response** (200 OK):
```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": "2026-01-08T15:00:00Z"
}
```

**Response Schema**:
```yaml
type: object
properties:
  status:
    type: string
    enum: [healthy]
  version:
    type: string
    pattern: "^\\d+\\.\\d+\\.\\d+$"
  timestamp:
    type: string
    format: date-time
required:
  - status
  - version
  - timestamp
```

**Error Responses**:
- `503 Service Unavailable`: Backend is starting up or unhealthy

---

## OpenAPI Definition (Minimal)

```yaml
openapi: 3.1.0
info:
  title: Todo Web App API
  version: 0.1.0
  description: FastAPI backend for Todo Web Application

servers:
  - url: http://localhost:8000
    description: Local development server

paths:
  /api/health:
    get:
      summary: Health check endpoint
      description: Returns service health status
      operationId: healthCheck
      tags:
        - Health
      responses:
        "200":
          description: Service is healthy
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthResponse"
        "503":
          description: Service is unhealthy

components:
  schemas:
    HealthResponse:
      type: object
      properties:
        status:
          type: string
          example: healthy
        version:
          type: string
          example: 0.1.0
        timestamp:
          type: string
          format: date-time
      required:
        - status
        - version
        - timestamp
```

---

## Future Contracts (Module 3+)

Task CRUD endpoints will be defined in Module 3:
- `GET /api/{user_id}/tasks`
- `POST /api/{user_id}/tasks`
- `GET /api/{user_id}/tasks/{task_id}`
- `PUT /api/{user_id}/tasks/{task_id}`
- `DELETE /api/{user_id}/tasks/{task_id}`
- `PATCH /api/{user_id}/tasks/{task_id}/complete`
