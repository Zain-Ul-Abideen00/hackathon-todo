# Dapr Component Types Reference

## State Store Components

| Component | Type | Best For |
|-----------|------|----------|
| Redis | `state.redis` | Fast caching, session state |
| PostgreSQL | `state.postgresql` | ACID compliance, SQL queries |
| MongoDB | `state.mongodb` | Document storage, flexible schema |
| Azure Cosmos DB | `state.azure.cosmosdb` | Global distribution |
| AWS DynamoDB | `state.aws.dynamodb` | Serverless scale |

### Redis State Store

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
    - name: redisHost
      value: redis:6379
    - name: redisPassword
      secretKeyRef:
        name: redis-secret
        key: password
    - name: enableTLS
      value: "true"
```

### PostgreSQL State Store

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.postgresql
  version: v1
  metadata:
    - name: connectionString
      secretKeyRef:
        name: postgres-secret
        key: connection-string
    - name: tableName
      value: "dapr_state"
```

## Pub/Sub Components

| Component | Type | Best For |
|-----------|------|----------|
| Redis Streams | `pubsub.redis` | Simple, already have Redis |
| Apache Kafka | `pubsub.kafka` | High throughput, event sourcing |
| RabbitMQ | `pubsub.rabbitmq` | Traditional messaging |
| Azure Service Bus | `pubsub.azure.servicebus` | Azure integration |
| AWS SNS/SQS | `pubsub.aws.snssqs` | AWS integration |

### Redis Pub/Sub

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
    - name: redisHost
      value: redis:6379
    - name: consumerID
      value: "{podName}"  # For StatefulSets
```

### Kafka Pub/Sub

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "kafka-bootstrap:9092"
    - name: consumerGroup
      value: "dapr-consumers"
    - name: authType
      value: "none"  # or "password", "mtls"
    - name: initialOffset
      value: "oldest"
```

## Secret Store Components

| Component | Type | Best For |
|-----------|------|----------|
| Kubernetes | `secretstores.kubernetes` | K8s-native secrets |
| HashiCorp Vault | `secretstores.hashicorp.vault` | Enterprise secrets |
| AWS Secrets Manager | `secretstores.aws.secretmanager` | AWS workloads |
| Azure Key Vault | `secretstores.azure.keyvault` | Azure workloads |
| Local File | `secretstores.local.file` | Development only |

### Kubernetes Secrets

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubernetes-secrets
spec:
  type: secretstores.kubernetes
  version: v1
```

### HashiCorp Vault

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: vault
spec:
  type: secretstores.hashicorp.vault
  version: v1
  metadata:
    - name: vaultAddr
      value: "https://vault.default.svc.cluster.local:8200"
    - name: vaultToken
      secretKeyRef:
        name: vault-token
        key: token
```

## Binding Components

### Input Bindings (Triggers)

| Component | Type | Triggers On |
|-----------|------|-------------|
| Cron | `bindings.cron` | Schedule |
| Kafka | `bindings.kafka` | Message arrival |
| RabbitMQ | `bindings.rabbitmq` | Queue message |
| HTTP | `bindings.http` | Webhook |

### Cron Input Binding

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: cron-binding
spec:
  type: bindings.cron
  version: v1
  metadata:
    - name: schedule
      value: "@every 5m"  # Every 5 minutes
    - name: direction
      value: "input"
```

### Output Bindings (Actions)

| Component | Type | Action |
|-----------|------|--------|
| HTTP | `bindings.http` | HTTP request |
| SMTP | `bindings.smtp` | Send email |
| Twilio | `bindings.twilio.sendgrid` | Send SMS |
| AWS S3 | `bindings.aws.s3` | File storage |

### HTTP Output Binding

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: http-binding
spec:
  type: bindings.http
  version: v1
  metadata:
    - name: url
      value: "https://api.example.com/webhook"
    - name: direction
      value: "output"
```

## Configuration Stores

| Component | Type | Best For |
|-----------|------|----------|
| Redis | `configuration.redis` | Fast, simple |
| PostgreSQL | `configuration.postgresql` | Relational data |
| Azure App Config | `configuration.azure.appconfig` | Azure integration |

### Redis Configuration

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: configstore
spec:
  type: configuration.redis
  version: v1
  metadata:
    - name: redisHost
      value: redis:6379
```

## Component Scoping

Restrict components to specific apps:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secure-secrets
spec:
  type: secretstores.kubernetes
  version: v1
  scopes:
    - task-api
    - notification-service
```
