# Secrets Management Reference

## Kubernetes Secrets (Base Level)

### Creating Secrets

```bash
# From literals
kubectl create secret generic db-creds \
  --from-literal=username=admin \
  --from-literal=password=supersecret \
  -n production

# From files
kubectl create secret generic tls-cert \
  --from-file=tls.crt=./cert.pem \
  --from-file=tls.key=./key.pem \
  -n production

# Docker registry
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=user \
  --docker-password=token \
  -n production
```

### Secret YAML
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-creds
  namespace: production
type: Opaque
data:
  username: YWRtaW4=  # base64 encoded
  password: c3VwZXJzZWNyZXQ=
```

### Using Secrets in Pods

```yaml
# As environment variables
env:
- name: DB_USER
  valueFrom:
    secretKeyRef:
      name: db-creds
      key: username
- name: DB_PASS
  valueFrom:
    secretKeyRef:
      name: db-creds
      key: password

# As volume mount
volumeMounts:
- name: db-creds
  mountPath: /etc/secrets
  readOnly: true
volumes:
- name: db-creds
  secret:
    secretName: db-creds
```

## External Secrets Operator (Production)

### Installation
```bash
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets \
  -n external-secrets-system --create-namespace
```

### SecretStore (Vault Example)
```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
  namespace: production
spec:
  provider:
    vault:
      server: "https://vault.company.com"
      path: "secret"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "task-api"
          serviceAccountRef:
            name: task-api-sa
```

### ClusterSecretStore (Cluster-Wide)
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: aws-secretsmanager
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
            namespace: external-secrets-system
```

### ExternalSecret
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: db-creds
    creationPolicy: Owner
  data:
  - secretKey: username
    remoteRef:
      key: production/task-api/db
      property: username
  - secretKey: password
    remoteRef:
      key: production/task-api/db
      property: password
```

## Sealed Secrets (GitOps Safe)

### Installation
```bash
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm install sealed-secrets sealed-secrets/sealed-secrets \
  -n kube-system
```

### Creating Sealed Secrets
```bash
# Install kubeseal CLI
brew install kubeseal

# Seal a secret
kubectl create secret generic db-creds \
  --from-literal=password=supersecret \
  --dry-run=client -o yaml | \
  kubeseal --format yaml > sealed-secret.yaml
```

### SealedSecret Resource
```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: db-creds
  namespace: production
spec:
  encryptedData:
    password: AgBy3i4OJSWK+PiTySYZZA9rO43cGDEq...
  template:
    type: Opaque
    metadata:
      name: db-creds
      namespace: production
```

**Key Point**: Encrypted with cluster's public key. Only the sealed-secrets controller (with private key) can decrypt.

## Secret Rotation

### Manual Rotation
```bash
# Update secret
kubectl create secret generic db-creds \
  --from-literal=password=newsecret \
  -n production --dry-run=client -o yaml | \
  kubectl apply -f -

# Restart pods to pick up new secret
kubectl rollout restart deployment/task-api -n production
```

### Automatic with ESO
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
spec:
  refreshInterval: 1h  # Check for updates every hour
  # ...
```

## Encryption at Rest

### Enable etcd Encryption
```yaml
# encryption-config.yaml
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
- resources:
  - secrets
  providers:
  - aescbc:
      keys:
      - name: key1
        secret: <base64-encoded-32-byte-key>
  - identity: {}
```

### Apply to API Server
```bash
# kube-apiserver flag
--encryption-provider-config=/etc/kubernetes/encryption-config.yaml
```

## Best Practices

1. **Never commit plain secrets to Git** - Use sealed-secrets or external refs
2. **Use External Secrets Operator** for production - Syncs from Vault/AWS/Azure
3. **Enable encryption at rest** - etcd stores secrets in plaintext by default
4. **Rotate regularly** - Automate rotation with ESO refresh intervals
5. **Audit access** - Enable Kubernetes audit logging for secrets access
6. **Limit RBAC** - Only grant secret access to workloads that need it
7. **Use specific secrets** - Don't bundle unrelated secrets together
8. **Prefer volume mounts over env vars** - env vars can leak in logs/crashes

## Verification

```bash
# Check secret exists
kubectl get secret db-creds -n production

# Check ExternalSecret sync status
kubectl get externalsecret db-credentials -n production

# Check SealedSecret status
kubectl get sealedsecret db-creds -n production

# View secret (base64)
kubectl get secret db-creds -n production -o jsonpath='{.data.password}' | base64 -d
```
