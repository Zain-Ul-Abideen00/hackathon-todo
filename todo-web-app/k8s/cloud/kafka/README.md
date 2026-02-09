# Kafka on Kubernetes with Strimzi

This directory contains Strimzi Kafka cluster manifests for the Todo Web App.

## Prerequisites

1. **Install Strimzi Operator**:
   ```bash
   helm repo add strimzi https://strimzi.io/charts/
   helm repo update
   helm install strimzi-kafka-operator strimzi/strimzi-kafka-operator \
     --namespace kafka --create-namespace
   ```

2. **Verify operator is running**:
   ```bash
   kubectl get pods -n kafka
   # Wait for strimzi-cluster-operator-* to be Running
   ```

## Deployment

```bash
# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Deploy Kafka cluster and topics
kubectl apply -f cluster.yaml

# 3. Verify deployment
kubectl get kafka -n kafka
kubectl get kafkatopics -n kafka
```

## Topics

| Topic | Partitions | Retention | Purpose |
|-------|------------|-----------|---------|
| `task-events` | 3 | 7 days | Task lifecycle events (created/completed) |
| `reminder-events` | 3 | 7 days | Due date reminder notifications |
| `task-updates` | 3 | 1 day | Real-time multi-client sync |

## Verification

```bash
# Check Kafka cluster status
kubectl get kafka kafka-cluster -n kafka -o jsonpath='{.status.conditions}'

# List topics
kubectl get kafkatopics -n kafka

# Test producing a message
kubectl exec -it kafka-cluster-kafka-0 -n kafka -- bin/kafka-console-producer.sh \
  --bootstrap-server localhost:9092 --topic task-events

# Test consuming messages
kubectl exec -it kafka-cluster-kafka-0 -n kafka -- bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 --topic task-events --from-beginning
```

## Connection String

For Dapr pub/sub component:
```
kafka-cluster-kafka-bootstrap.kafka.svc.cluster.local:9092
```
