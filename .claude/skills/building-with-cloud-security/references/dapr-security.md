# Dapr Security Reference

## Overview

Dapr provides security features out-of-the-box:
- **mTLS** between sidecars (automatic)
- **API token authentication** (optional, for exposed APIs)
- **Component scopes** (restrict which apps can use components)
- **Secret scopes** (control access to secrets within components)

## mTLS (Mutual TLS)

### How It Works
1. **Sentry** service acts as Certificate Authority
2. Issues short-lived certificates (24 hours default)
3. All sidecar-to-sidecar communication encrypted
4. Automatic certificate rotation

### Verify mTLS Status
```bash
# Check Sentry is running
kubectl get pods -n dapr-system -l app=dapr-sentry

# Check mTLS is enabled
dapr status -k

# View certificate details
kubectl exec -it dapr-sentry-xxx -n dapr-system -- cat /var/run/secrets/dapr.io/tls/ca.crt
```

### Configuration
```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: dapr-system
spec:
  mtls:
    enabled: true
    workloadCertTTL: "24h"
    allowedClockSkew: "15m"
```

### Certificate Rotation
```bash
# Renew root certificate (keep cluster running)
dapr mtls renew-certificate -k --valid-until 365 --restart

# Export current certificates
dapr mtls export -o ./certs
```

## API Token Authentication

### Enable for Dapr API
```yaml
# Create secret with token
apiVersion: v1
kind: Secret
metadata:
  name: dapr-api-token
  namespace: dapr-system
type: Opaque
data:
  token: <base64-encoded-token>
```

```yaml
# Dapr configuration
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  api:
    allowed:
      - apiVersion: v1
        httpVerbs: ["POST", "GET"]
        name: state
      - apiVersion: v1
        httpVerbs: ["POST"]
        name: invoke
```

### Enable for App API (Dapr → App)
```yaml
# App receives token in header
apiVersion: v1
kind: Secret
metadata:
  name: app-api-token
  namespace: production
type: Opaque
data:
  token: <base64-encoded-token>
```

Pod annotation:
```yaml
annotations:
  dapr.io/app-token-secret: "app-api-token"
```

Your app validates:
```python
from fastapi import Request, HTTPException

@app.middleware("http")
async def verify_dapr_token(request: Request, call_next):
    if request.headers.get("dapr-api-token") != expected_token:
        raise HTTPException(status_code=401)
    return await call_next(request)
```

## Component Scopes

### Restrict Component to Specific Apps
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: production
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: redis:6379
  scopes:
  - task-api    # Only task-api can access
  - admin-api   # And admin-api
```

### Pub/Sub Topic Scopes
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: production
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: kafka:9092
  scopes:
  - task-api
  - notification-service
```

```yaml
# Subscription with topic restrictions
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: task-events
  namespace: production
spec:
  pubsubname: pubsub
  topic: tasks
  routes:
    default: /events
  scopes:
  - task-api  # Only task-api receives this subscription
```

## Secret Scopes

### Restrict Secret Access per Component
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localsecretstore
  namespace: production
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: /secrets/secrets.json
  scopes:
  - task-api  # Only task-api can read secrets from this store
```

### Configuration-Level Secret Access
```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  secrets:
    scopes:
    - storeName: kubernetes  # K8s secret store
      defaultAccess: deny
      allowedSecrets:
      - db-password
      - api-key
    - storeName: vault
      defaultAccess: deny
      deniedSecrets:
      - admin-creds  # Explicitly block
```

## App Security Context

### Restrict Sidecar Access
```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "task-api"
  dapr.io/app-port: "8000"

  # Only allow localhost to call sidecar
  dapr.io/sidecar-listen-addresses: "127.0.0.1"

  # Disable specific APIs
  dapr.io/enable-api-logging: "true"

  # Read-only file system for sidecar
  dapr.io/volume-mounts-read-only: "true"
```

## Network Security with Dapr

### NetworkPolicy for Dapr
```yaml
# Allow app to talk to its sidecar
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dapr-sidecar
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: task-api
  ingress:
  - from:
    - podSelector:
        matchLabels:
          dapr.io/app-id: task-api
    ports:
    - port: 8000  # App port
  egress:
  - to:
    - podSelector:
        matchLabels:
          dapr.io/app-id: task-api
    ports:
    - port: 3500  # Dapr HTTP
    - port: 50001 # Dapr gRPC
---
# Allow Dapr control plane
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dapr-system
  namespace: production
spec:
  podSelector: {}
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: dapr-system
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: dapr-system
```

## Security Audit Checklist

- [ ] mTLS enabled and Sentry healthy
- [ ] API tokens configured for exposed Dapr APIs
- [ ] Component scopes defined (no * wildcards)
- [ ] Secret scopes configured (default deny)
- [ ] Sidecar listen addresses restricted to localhost
- [ ] NetworkPolicies allow Dapr traffic
- [ ] Certificate rotation scheduled
- [ ] Audit logging enabled

## Troubleshooting

```bash
# Check sidecar injection
kubectl get pods -n production -o jsonpath='{.items[*].spec.containers[*].name}'

# View sidecar logs
kubectl logs task-api-xxx -c daprd -n production

# Check component availability
dapr components -k -n production

# Verify mTLS certificates
kubectl exec task-api-xxx -c daprd -- cat /var/run/secrets/dapr.io/tls/ca.crt
```
