# DigitalOcean Kubernetes (DOKS) Reference

## Overview

DigitalOcean Kubernetes (DOKS) is a managed Kubernetes service with free control plane, simple pricing, and excellent developer experience.

## Key Facts (December 2025)

- **Control Plane**: Free
- **HA Control Plane**: $40/month (optional, provides 99.95% SLA)
- **Minimum Node Cost**: $12/month (s-1vcpu-2gb)
- **New User Credit**: $200 for 60 days
- **Cluster Creation Time**: ~5 minutes
- **Max Nodes**: 1,000 with autoscaler
- **LoadBalancer Cost**: $12/month each

## doctl CLI Reference

### Installation

```bash
# macOS
brew install doctl

# Linux (snap)
sudo snap install doctl

# Linux (binary)
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.115.0/doctl-1.115.0-linux-amd64.tar.gz
tar xf doctl-1.115.0-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin
```

### Authentication

```bash
# Interactive authentication
doctl auth init

# Using token directly
doctl auth init -t YOUR_API_TOKEN

# Verify authentication
doctl account get
```

### Cluster Operations

```bash
# List available Kubernetes versions
doctl kubernetes options versions

# List available node sizes
doctl kubernetes options sizes

# List available regions
doctl kubernetes options regions

# Create cluster
doctl kubernetes cluster create CLUSTER_NAME \
  --region nyc1 \
  --version 1.31.4-do.0 \
  --size s-2vcpu-4gb \
  --count 3 \
  --auto-upgrade \
  --wait

# Create cluster with node pool config
doctl kubernetes cluster create CLUSTER_NAME \
  --region nyc1 \
  --node-pool "name=default;size=s-2vcpu-4gb;count=3;auto-scale=true;min-nodes=2;max-nodes=10"

# Get cluster info
doctl kubernetes cluster get CLUSTER_NAME

# List clusters
doctl kubernetes cluster list

# Get kubeconfig
doctl kubernetes cluster kubeconfig save CLUSTER_NAME

# Delete cluster
doctl kubernetes cluster delete CLUSTER_NAME -f
```

### Node Pool Operations

```bash
# List node pools
doctl kubernetes cluster node-pool list CLUSTER_ID

# Create node pool
doctl kubernetes cluster node-pool create CLUSTER_ID \
  --name high-memory \
  --size m-2vcpu-16gb \
  --count 2 \
  --auto-scale \
  --min-nodes 1 \
  --max-nodes 5

# Delete node pool
doctl kubernetes cluster node-pool delete CLUSTER_ID POOL_ID -f
```

## Node Sizes for Kubernetes

| Size | vCPUs | RAM | Price/mo | Use Case |
|------|-------|-----|----------|----------|
| s-1vcpu-2gb | 1 | 2GB | $12 | Testing only |
| s-2vcpu-4gb | 2 | 4GB | $24 | Development |
| s-4vcpu-8gb | 4 | 8GB | $48 | Production (light) |
| s-8vcpu-16gb | 8 | 16GB | $96 | Production |
| g-2vcpu-8gb | 2 | 8GB | $63 | General purpose |
| c-4 | 4 | 8GB | $84 | CPU-optimized |
| m-2vcpu-16gb | 2 | 16GB | $84 | Memory-optimized |

## Regions

| Code | Location | Notes |
|------|----------|-------|
| nyc1, nyc3 | New York | US East |
| sfo3 | San Francisco | US West |
| ams3 | Amsterdam | Europe |
| sgp1 | Singapore | Asia |
| lon1 | London | Europe |
| fra1 | Frankfurt | Europe |
| blr1 | Bangalore | India |
| tor1 | Toronto | Canada |
| syd1 | Sydney | Australia |

## LoadBalancer Annotations

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
  annotations:
    # Health check settings
    service.beta.kubernetes.io/do-loadbalancer-healthcheck-port: "8080"
    service.beta.kubernetes.io/do-loadbalancer-healthcheck-path: "/health"
    service.beta.kubernetes.io/do-loadbalancer-healthcheck-protocol: "http"

    # SSL/TLS settings
    service.beta.kubernetes.io/do-loadbalancer-tls-ports: "443"
    service.beta.kubernetes.io/do-loadbalancer-certificate-id: "cert-uuid"

    # Proxy protocol
    service.beta.kubernetes.io/do-loadbalancer-enable-proxy-protocol: "true"

    # Sticky sessions
    service.beta.kubernetes.io/do-loadbalancer-sticky-sessions-type: "cookies"
    service.beta.kubernetes.io/do-loadbalancer-sticky-sessions-cookie-name: "DO-LB"

    # Algorithm
    service.beta.kubernetes.io/do-loadbalancer-algorithm: "round_robin"

    # Size
    service.beta.kubernetes.io/do-loadbalancer-size-unit: "1"  # 1-100
spec:
  type: LoadBalancer
  ports:
  - port: 443
    targetPort: 8080
```

## Block Storage (Volumes)

```yaml
# Storage class (automatically available)
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: do-block-storage
provisioner: dobs.csi.digitalocean.com
parameters:
  fstype: ext4
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true
---
# PVC example
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: task-data
spec:
  storageClassName: do-block-storage
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
```

## Managed Databases Integration

DOKS works seamlessly with DigitalOcean Managed Databases:

```bash
# Create managed PostgreSQL
doctl databases create task-db \
  --engine pg \
  --version 16 \
  --region nyc1 \
  --size db-s-1vcpu-1gb \
  --num-nodes 1

# Get connection info
doctl databases connection task-db-uuid --format Host,Port,User,Password
```

## Common Patterns

### Enable Container Registry Integration

```bash
# Create container registry
doctl registry create my-registry

# Connect registry to cluster
doctl kubernetes cluster registry add CLUSTER_NAME
```

### Backup with Velero

```bash
# Install Velero with DO Spaces backend
velero install \
  --provider velero.io/aws \
  --bucket velero-backups \
  --secret-file ./credentials-velero \
  --backup-location-config \
    region=nyc3,s3ForcePathStyle=true,s3Url=https://nyc3.digitaloceanspaces.com \
  --snapshot-location-config region=nyc3
```

## Sources

- [DigitalOcean DOKS Documentation](https://docs.digitalocean.com/products/kubernetes/)
- [doctl CLI Reference](https://docs.digitalocean.com/reference/doctl/reference/kubernetes/)
- [DOKS Pricing](https://www.digitalocean.com/pricing/kubernetes)
