# Pod Security Standards Reference

## Overview

Pod Security Standards (PSS) replaced Pod Security Policies (PSP) in Kubernetes 1.25+.
Enforced by Pod Security Admission (PSA) controller built into Kubernetes.

## Three Security Levels

### Privileged
- No restrictions
- Use for: CNI plugins, storage drivers, system daemons
- **Never use for application workloads**

### Baseline
Prevents known privilege escalations:
- Blocks `hostNetwork`, `hostPID`, `hostIPC`
- Blocks `privileged` containers
- Blocks `hostPath` volumes
- Restricts `hostPorts`
- Restricts `capabilities.add`

Use for: Development, staging, non-sensitive production

### Restricted
Maximum security (Baseline + more):
- Requires `runAsNonRoot: true`
- Requires `allowPrivilegeEscalation: false`
- Requires `seccompProfile: RuntimeDefault`
- Drops ALL capabilities
- Restricts volume types to safe list

Use for: Production workloads, sensitive data

## Applying PSS to Namespaces

### Via Labels
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    # Enforcement level
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest

    # Warn but don't block (for testing)
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/warn-version: latest

    # Audit log violations
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/audit-version: latest
```

### Via kubectl
```bash
# Apply restricted to namespace
kubectl label ns production \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/warn=restricted \
  pod-security.kubernetes.io/audit=restricted

# Check current labels
kubectl get ns production -o jsonpath='{.metadata.labels}' | jq
```

## Compliant Pod Spec (Restricted)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: myapp:v1
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
    volumeMounts:
    - name: tmp
      mountPath: /tmp
  volumes:
  - name: tmp
    emptyDir: {}
```

## Restricted Violations & Fixes

| Violation | Fix |
|-----------|-----|
| `runAsNonRoot must be true` | Add `securityContext.runAsNonRoot: true` |
| `runAsUser must be non-zero` | Add `securityContext.runAsUser: 1000` |
| `allowPrivilegeEscalation must be false` | Add `securityContext.allowPrivilegeEscalation: false` |
| `capabilities must drop ALL` | Add `securityContext.capabilities.drop: ["ALL"]` |
| `seccompProfile must be set` | Add `securityContext.seccompProfile.type: RuntimeDefault` |
| `hostPath volumes not allowed` | Use emptyDir, configMap, secret, persistentVolumeClaim |

## Migration Strategy

### Phase 1: Audit Only
```bash
kubectl label ns production \
  pod-security.kubernetes.io/audit=restricted
```
Check audit logs for violations without blocking.

### Phase 2: Warn
```bash
kubectl label ns production \
  pod-security.kubernetes.io/warn=restricted
```
Users see warnings but pods still run.

### Phase 3: Enforce
```bash
kubectl label ns production \
  pod-security.kubernetes.io/enforce=restricted
```
Non-compliant pods are rejected.

## System Namespaces

**Never apply PSS to:**
- `kube-system` - Contains privileged system components
- `kube-public` - Cluster info
- `kube-node-lease` - Node heartbeats

These require privileged access by design.

## Exemptions

For specific workloads needing elevated privileges in a restricted namespace:

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingAdmissionPolicy
metadata:
  name: exempt-storage-driver
spec:
  matchConstraints:
    resourceRules:
    - apiGroups: [""]
      apiVersions: ["v1"]
      resources: ["pods"]
      operations: ["CREATE", "UPDATE"]
  matchConditions:
  - name: "exclude-storage-driver"
    expression: "!object.metadata.labels.exists(k, k == 'exempt-pss')"
```

## Verification

```bash
# Test if pod would be admitted
kubectl run test --image=nginx --dry-run=server -n production

# Check what level a pod requires
kubectl label pod my-pod -n production --dry-run=server \
  pod-security.kubernetes.io/enforce=restricted

# List namespace security labels
kubectl get ns -L pod-security.kubernetes.io/enforce
```
