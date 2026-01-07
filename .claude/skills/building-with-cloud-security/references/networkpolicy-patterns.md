# NetworkPolicy Patterns Reference

## Prerequisites

NetworkPolicy requires a CNI that supports it:
- **Calico**: Full support, most popular
- **Cilium**: eBPF-based, advanced features
- **Weave Net**: Supports basic policies

Docker Desktop default CNI does NOT support NetworkPolicy!

### Install Calico on Docker Desktop
```bash
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.1/manifests/calico.yaml
```

## Core Patterns

### Pattern 1: Default Deny All
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {}  # Matches all pods
  policyTypes:
  - Ingress
  - Egress
```

**Effect**: All traffic blocked. Pods can't talk to each other or external services.

### Pattern 2: Allow DNS (Required After Default Deny)
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns-egress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Egress
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: kube-system
    ports:
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 53
```

### Pattern 3: Allow Ingress from Specific Namespace
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-gateway-ingress
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: task-api
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: envoy-gateway-system
    ports:
    - protocol: TCP
      port: 8000
```

### Pattern 4: Allow Same-Namespace Communication
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-same-namespace
  namespace: production
spec:
  podSelector: {}
  ingress:
  - from:
    - podSelector: {}  # Same namespace only
  egress:
  - to:
    - podSelector: {}
```

### Pattern 5: Allow Database Access
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-db-egress
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: task-api
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
```

### Pattern 6: Allow External API (CIDR)
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-external-api
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: task-api
  policyTypes:
  - Egress
  egress:
  - to:
    - ipBlock:
        cidr: 0.0.0.0/0
        except:
        - 10.0.0.0/8
        - 172.16.0.0/12
        - 192.168.0.0/16
    ports:
    - protocol: TCP
      port: 443
```

## Complete Example: Task API Stack

```yaml
# 1. Default deny
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: task-api
spec:
  podSelector: {}
  policyTypes: [Ingress, Egress]
---
# 2. Allow DNS
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns
  namespace: task-api
spec:
  podSelector: {}
  policyTypes: [Egress]
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: kube-system
    ports:
    - protocol: UDP
      port: 53
---
# 3. Allow ingress from gateway
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-ingress
  namespace: task-api
spec:
  podSelector:
    matchLabels:
      app: task-api
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: envoy-gateway-system
    ports:
    - port: 8000
---
# 4. Allow egress to database
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-to-db
  namespace: task-api
spec:
  podSelector:
    matchLabels:
      app: task-api
  policyTypes: [Egress]
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - port: 5432
---
# 5. Allow Dapr sidecar communication
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dapr
  namespace: task-api
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

## Debugging NetworkPolicies

```bash
# List all policies
kubectl get networkpolicies -n production

# Describe policy
kubectl describe networkpolicy default-deny-all -n production

# Test connectivity (from inside a pod)
kubectl exec -it test-pod -n production -- wget -qO- http://task-api:8000/health --timeout=5

# Calico: Check policy status
kubectl get networkpolicies.crd.projectcalico.org -n production
```

## Common Issues

1. **DNS Blocked**: Always add DNS egress after default deny
2. **Dapr Blocked**: Need rules for dapr-system namespace
3. **Metrics Blocked**: Need rules for monitoring namespace (Prometheus scraping)
4. **Health Checks Blocked**: Kubelet needs access for probes
