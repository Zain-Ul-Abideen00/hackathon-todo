# Task API with Dapr: Complete Example

## Project Structure

```
task-api-dapr/
├── pyproject.toml
├── main.py
├── models.py
├── components/
│   ├── statestore.yaml
│   ├── pubsub.yaml
│   └── secrets.yaml
├── subscriptions/
│   └── task-subscription.yaml
├── k8s/
│   ├── deployment.yaml
│   └── service.yaml
└── Dockerfile
```

## pyproject.toml

```toml
[project]
name = "task-api-dapr"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "dapr>=1.13.0",
    "dapr-ext-fastapi>=1.13.0",
    "pydantic>=2.0.0",
]
```

## models.py

```python
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = None
    priority: int = Field(default=1, ge=1, le=5)

class Task(BaseModel):
    id: str
    title: str
    description: str | None = None
    status: TaskStatus = TaskStatus.PENDING
    priority: int = 1
    created_at: datetime
    updated_at: datetime

class TaskEvent(BaseModel):
    event_type: str
    task_id: str
    title: str
    status: str
    timestamp: datetime
```

## main.py

```python
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, HTTPException
from dapr.clients import DaprClient
from dapr.ext.fastapi import DaprApp
import json
import uuid

from models import Task, TaskCreate, TaskStatus, TaskEvent

# Configuration
STORE_NAME = "statestore"
PUBSUB_NAME = "pubsub"
TOPIC_NAME = "task-events"

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan handler for startup/shutdown."""
    # Verify Dapr sidecar is ready
    with DaprClient() as client:
        client.wait(timeout_s=30)
    yield

app = FastAPI(
    title="Task API with Dapr",
    description="Distributed Task Management using Dapr building blocks",
    lifespan=lifespan
)
dapr_app = DaprApp(app)

# =============================================================================
# API Endpoints
# =============================================================================

@app.post("/tasks", response_model=Task, status_code=201)
async def create_task(task_create: TaskCreate):
    """Create a new task, store state, and publish event."""
    now = datetime.utcnow()
    task = Task(
        id=str(uuid.uuid4()),
        title=task_create.title,
        description=task_create.description,
        priority=task_create.priority,
        created_at=now,
        updated_at=now
    )

    with DaprClient() as client:
        # Save to state store
        client.save_state(
            store_name=STORE_NAME,
            key=f"task-{task.id}",
            value=task.model_dump_json()
        )

        # Publish creation event
        event = TaskEvent(
            event_type="task.created",
            task_id=task.id,
            title=task.title,
            status=task.status.value,
            timestamp=now
        )
        client.publish_event(
            pubsub_name=PUBSUB_NAME,
            topic_name=TOPIC_NAME,
            data=event.model_dump_json(),
            data_content_type="application/json"
        )

    return task

@app.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str):
    """Retrieve a task by ID from state store."""
    with DaprClient() as client:
        state = client.get_state(
            store_name=STORE_NAME,
            key=f"task-{task_id}"
        )

        if not state.data:
            raise HTTPException(status_code=404, detail="Task not found")

        return Task.model_validate_json(state.data)

@app.put("/tasks/{task_id}/status", response_model=Task)
async def update_task_status(task_id: str, status: TaskStatus):
    """Update task status with optimistic concurrency."""
    with DaprClient() as client:
        # Get current state with ETag
        state = client.get_state(
            store_name=STORE_NAME,
            key=f"task-{task_id}"
        )

        if not state.data:
            raise HTTPException(status_code=404, detail="Task not found")

        task = Task.model_validate_json(state.data)
        task.status = status
        task.updated_at = datetime.utcnow()

        # Save with ETag for concurrency control
        client.save_state(
            store_name=STORE_NAME,
            key=f"task-{task_id}",
            value=task.model_dump_json(),
            etag=state.etag
        )

        # Publish status change event
        event = TaskEvent(
            event_type=f"task.{status.value}",
            task_id=task.id,
            title=task.title,
            status=status.value,
            timestamp=task.updated_at
        )
        client.publish_event(
            pubsub_name=PUBSUB_NAME,
            topic_name=TOPIC_NAME,
            data=event.model_dump_json(),
            data_content_type="application/json"
        )

        return task

@app.delete("/tasks/{task_id}", status_code=204)
async def delete_task(task_id: str):
    """Delete a task and publish deletion event."""
    with DaprClient() as client:
        # Verify exists
        state = client.get_state(
            store_name=STORE_NAME,
            key=f"task-{task_id}"
        )

        if not state.data:
            raise HTTPException(status_code=404, detail="Task not found")

        task = Task.model_validate_json(state.data)

        # Delete state
        client.delete_state(
            store_name=STORE_NAME,
            key=f"task-{task_id}"
        )

        # Publish deletion event
        event = TaskEvent(
            event_type="task.deleted",
            task_id=task.id,
            title=task.title,
            status=task.status.value,
            timestamp=datetime.utcnow()
        )
        client.publish_event(
            pubsub_name=PUBSUB_NAME,
            topic_name=TOPIC_NAME,
            data=event.model_dump_json(),
            data_content_type="application/json"
        )

# =============================================================================
# Event Subscriptions
# =============================================================================

@dapr_app.subscribe(pubsub=PUBSUB_NAME, topic=TOPIC_NAME)
async def handle_task_event(event_data: dict):
    """
    Handle task events - this would typically call other services.
    In a real system, this might be in a separate notification-service.
    """
    print(f"Received event: {event_data}")

    event_type = event_data.get("event_type", "unknown")
    task_id = event_data.get("task_id", "unknown")

    # Example: Call notification service
    if event_type == "task.completed":
        with DaprClient() as client:
            try:
                client.invoke_method(
                    app_id="notification-service",
                    method_name="notify",
                    data=json.dumps({
                        "type": "task_completed",
                        "task_id": task_id,
                        "message": f"Task {task_id} has been completed"
                    }),
                    http_verb="POST"
                )
            except Exception as e:
                print(f"Failed to notify: {e}")

    return {"status": "SUCCESS"}

# =============================================================================
# Health Check
# =============================================================================

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy project files
COPY pyproject.toml .
COPY *.py .

# Install dependencies
RUN uv sync --frozen --no-dev

# Expose port
EXPOSE 8000

# Run with uvicorn
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## components/statestore.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
    - name: redisHost
      value: redis-master.default.svc.cluster.local:6379
    - name: redisPassword
      value: ""
```

## components/pubsub.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: default
spec:
  type: pubsub.redis
  version: v1
  metadata:
    - name: redisHost
      value: redis-master.default.svc.cluster.local:6379
```

## subscriptions/task-subscription.yaml

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: task-subscription
  namespace: default
spec:
  pubsubname: pubsub
  topic: task-events
  routes:
    default: /events/task-events
```

## k8s/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: task-api
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: task-api
  template:
    metadata:
      labels:
        app: task-api
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "task-api"
        dapr.io/app-port: "8000"
        dapr.io/enable-api-logging: "true"
    spec:
      containers:
        - name: task-api
          image: task-api:latest
          ports:
            - containerPort: 8000
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 30
```

## k8s/service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: task-api
  namespace: default
spec:
  selector:
    app: task-api
  ports:
    - port: 80
      targetPort: 8000
  type: ClusterIP
```

## Deployment Commands

```bash
# Install Redis (prerequisite)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install redis bitnami/redis --set auth.enabled=false

# Apply Dapr components
kubectl apply -f components/
kubectl apply -f subscriptions/

# Build and deploy
docker build -t task-api:latest .
# For Minikube: eval $(minikube docker-env) first

kubectl apply -f k8s/

# Test
kubectl port-forward service/task-api 8000:80

# Create task
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "priority": 2}'

# Get task
curl http://localhost:8000/tasks/{task-id}

# Update status
curl -X PUT "http://localhost:8000/tasks/{task-id}/status?status=completed"
```
