# Dapr Components

This directory contains Dapr component manifests for the Todo Web App event-driven architecture.

## Components

| Component | Type | Purpose |
|-----------|------|---------|
| `pubsub.yaml` | pubsub.kafka | Kafka message broker for event streaming |
| `statestore.yaml` | state.postgresql | PostgreSQL state storage for Dapr |
| `secretstore.yaml` | secretstores.kubernetes | Kubernetes secrets integration |

## Subscriptions

Located in `subscriptions/`:

| Subscription | Topic | Consumer Service |
|--------------|-------|------------------|
| `task-events.yaml` | task-events | recurring-service |
| `reminders.yaml` | reminder-events | notification-service |
| `task-updates.yaml` | task-updates | websocket-service |
| `audit.yaml` | task-events | audit-service |

## Deployment

```bash
# Deploy all components to todo-app namespace
kubectl apply -f pubsub.yaml -n todo-app
kubectl apply -f statestore.yaml -n todo-app
kubectl apply -f secretstore.yaml -n todo-app

# Deploy subscriptions
kubectl apply -f subscriptions/ -n todo-app
```

## Verification

```bash
# Check component status
kubectl get components -n todo-app

# View in Dapr dashboard
dapr dashboard -k
```

## Prerequisites

1. **Kafka cluster deployed**: See `../k8s/cloud/kafka/README.md`
2. **Dapr installed in cluster**: `helm install dapr dapr/dapr -n dapr-system --create-namespace`
3. **todo-app namespace exists**: `kubectl create namespace todo-app`

## Service Scopes

Components are scoped to specific services:

- **backend**: pubsub, statestore, secretstore
- **notification-service**: pubsub, statestore, secretstore
- **recurring-service**: pubsub, statestore
- **websocket-service**: pubsub
- **audit-service**: pubsub
