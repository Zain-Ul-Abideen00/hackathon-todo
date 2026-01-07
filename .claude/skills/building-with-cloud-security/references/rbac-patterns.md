# RBAC Patterns Reference

## Core Resources

### Role vs ClusterRole
- **Role**: Namespace-scoped, grants permissions within a single namespace
- **ClusterRole**: Cluster-scoped, can be used cluster-wide or bound to namespaces

### RoleBinding vs ClusterRoleBinding
- **RoleBinding**: Binds Role OR ClusterRole to subjects in a specific namespace
- **ClusterRoleBinding**: Binds ClusterRole to subjects cluster-wide

## Common Patterns

### Pattern 1: Application Read-Only Access
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: app-reader
  namespace: production
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: app-reader-binding
  namespace: production
subjects:
- kind: ServiceAccount
  name: my-app
  namespace: production
roleRef:
  kind: Role
  name: app-reader
  apiGroup: rbac.authorization.k8s.io
```

### Pattern 2: CI/CD Deployer (Multi-Namespace)
```yaml
# ClusterRole defines permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: deployer
rules:
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: [""]
  resources: ["services", "configmaps"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
---
# Bind to specific namespaces (not cluster-wide)
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: deployer-staging
  namespace: staging
subjects:
- kind: ServiceAccount
  name: github-actions
  namespace: ci-cd
roleRef:
  kind: ClusterRole
  name: deployer
  apiGroup: rbac.authorization.k8s.io
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: deployer-production
  namespace: production
subjects:
- kind: ServiceAccount
  name: github-actions
  namespace: ci-cd
roleRef:
  kind: ClusterRole
  name: deployer
  apiGroup: rbac.authorization.k8s.io
```

### Pattern 3: Monitoring Read-All
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: monitoring-reader
rules:
- apiGroups: [""]
  resources: ["pods", "nodes", "services", "endpoints"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets", "statefulsets", "daemonsets"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: prometheus-monitoring
subjects:
- kind: ServiceAccount
  name: prometheus
  namespace: monitoring
roleRef:
  kind: ClusterRole
  name: monitoring-reader
  apiGroup: rbac.authorization.k8s.io
```

## ServiceAccount Best Practices

### Dedicated ServiceAccount
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: task-api
  namespace: task-api
automountServiceAccountToken: false  # Don't mount unless needed
```

### Pod with Explicit ServiceAccount
```yaml
spec:
  serviceAccountName: task-api
  automountServiceAccountToken: false  # Override if SA has token mounted
```

## Verification Commands

```bash
# Check what a ServiceAccount can do
kubectl auth can-i --list --as=system:serviceaccount:production:my-app

# Test specific permission
kubectl auth can-i create deployments --as=system:serviceaccount:production:my-app -n production

# View all bindings for a ServiceAccount
kubectl get rolebindings,clusterrolebindings -A -o json | \
  jq '.items[] | select(.subjects[]?.name=="my-app")'
```

## Anti-Patterns to Avoid

1. **Wildcard Resources**: `resources: ["*"]` - Too broad
2. **Wildcard Verbs**: `verbs: ["*"]` - Grants delete, create everything
3. **Default ServiceAccount**: Always create dedicated SAs
4. **ClusterRoleBinding for Apps**: Use RoleBinding unless truly cluster-wide
5. **No Regular Audits**: RBAC should be reviewed periodically
