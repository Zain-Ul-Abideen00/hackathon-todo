# Hetzner + K3s Reference

## Overview

hetzner-k3s is a CLI tool by Vito Botta that creates production-ready Kubernetes clusters on Hetzner Cloud in 2-3 minutes. It's the most cost-effective way to run real cloud Kubernetes.

## Key Facts (December 2025)

- **Control Plane Cost**: $0 (self-managed)
- **Cheapest Node**: €4.35/mo (CX22: 2 vCPU, 4GB RAM)
- **Cluster Creation Time**: 2-3 minutes (3 nodes)
- **500+ Node Tested**: Stress-tested up to 500 nodes
- **No Third-Party Access**: Credentials stay local
- **Built-in Components**: CCM, CSI, Upgrade Controller, Autoscaler

## Installation

```bash
# macOS
brew install vitobotta/tap/hetzner_k3s

# Linux (amd64)
wget https://github.com/vitobotta/hetzner-k3s/releases/download/v2.4.4/hetzner-k3s-linux-amd64
chmod +x hetzner-k3s-linux-amd64
sudo mv hetzner-k3s-linux-amd64 /usr/local/bin/hetzner-k3s

# Linux (arm64)
wget https://github.com/vitobotta/hetzner-k3s/releases/download/v2.4.4/hetzner-k3s-linux-arm64
chmod +x hetzner-k3s-linux-arm64
sudo mv hetzner-k3s-linux-arm64 /usr/local/bin/hetzner-k3s

# Verify
hetzner-k3s version
```

## Prerequisites

1. **Hetzner Cloud Account**: https://console.hetzner.cloud
2. **API Token**: Project → Security → API Tokens → Generate (Read & Write)
3. **SSH Key Pair**: Must exist locally (ed25519 recommended)
4. **kubectl**: For cluster interaction
5. **Helm**: For component installation

## Cluster Configuration

### Minimal Learning Cluster (~€10/mo)

```yaml
# cluster-learning.yaml
hetzner_token: YOUR_HETZNER_API_TOKEN
cluster_name: learning-cluster
kubeconfig_path: "./kubeconfig"
k3s_version: v1.31.4+k3s1

networking:
  ssh:
    port: 22
    use_agent: false
    public_key_path: "~/.ssh/id_ed25519.pub"
    private_key_path: "~/.ssh/id_ed25519"
    allowed_networks:
      ssh:
        - 0.0.0.0/0
      api:
        - 0.0.0.0/0

masters_pool:
  instance_type: cx22
  instance_count: 1
  location: fsn1

worker_node_pools:
  - name: workers
    instance_type: cx22
    instance_count: 1
    location: fsn1
```

### Production HA Cluster (~€50-100/mo)

```yaml
# cluster-production.yaml
hetzner_token: YOUR_HETZNER_API_TOKEN
cluster_name: prod-cluster
kubeconfig_path: "./kubeconfig"
k3s_version: v1.31.4+k3s1

networking:
  ssh:
    port: 22
    use_agent: false
    public_key_path: "~/.ssh/id_ed25519.pub"
    private_key_path: "~/.ssh/id_ed25519"
    allowed_networks:
      ssh:
        - YOUR_IP/32  # Restrict to your IP
      api:
        - YOUR_IP/32

  cni:
    cilium:
      enabled: true  # Use Cilium instead of Flannel

masters_pool:
  instance_type: cx32
  instance_count: 3  # HA control plane
  locations:         # Multi-location for resilience
    - fsn1
    - nbg1
    - hel1

worker_node_pools:
  - name: general
    instance_type: cx42
    instance_count: 3
    location: fsn1
    autoscaling:
      enabled: true
      min_instances: 2
      max_instances: 10

  - name: memory-optimized
    instance_type: ccx13
    instance_count: 2
    location: fsn1
```

## CLI Commands

```bash
# Create cluster
hetzner-k3s create --config cluster.yaml

# Delete cluster
hetzner-k3s delete --config cluster.yaml

# Upgrade k3s version
hetzner-k3s upgrade --config cluster.yaml --new-k3s-version v1.32.0+k3s1

# Add workers
hetzner-k3s add-nodes --config cluster.yaml --worker-pool workers --count 2

# Remove workers
hetzner-k3s remove-nodes --config cluster.yaml --worker-pool workers --count 1
```

## Instance Types

### Shared vCPU (CX - Cost-Effective)

| Type | vCPU | RAM | Disk | Price/mo |
|------|------|-----|------|----------|
| cx22 | 2 | 4GB | 40GB | €4.35 |
| cx32 | 4 | 8GB | 80GB | €8.69 |
| cx42 | 8 | 16GB | 160GB | €17.49 |
| cx52 | 16 | 32GB | 320GB | €35.99 |

### Dedicated vCPU (CCX - Production)

| Type | vCPU | RAM | Disk | Price/mo |
|------|------|-----|------|----------|
| ccx13 | 2 | 8GB | 80GB | €14.49 |
| ccx23 | 4 | 16GB | 160GB | €28.99 |
| ccx33 | 8 | 32GB | 240GB | €57.99 |
| ccx43 | 16 | 64GB | 360GB | €115.99 |

### ARM (CAX - Budget-Friendly)

| Type | vCPU | RAM | Disk | Price/mo |
|------|------|-----|------|----------|
| cax11 | 2 | 4GB | 40GB | €3.79 |
| cax21 | 4 | 8GB | 80GB | €6.89 |
| cax31 | 8 | 16GB | 160GB | €13.29 |
| cax41 | 16 | 32GB | 320GB | €26.39 |

## Locations

| Code | City | Country |
|------|------|---------|
| fsn1 | Falkenstein | Germany |
| nbg1 | Nuremberg | Germany |
| hel1 | Helsinki | Finland |
| ash | Ashburn | USA |
| hil | Hillsboro | USA |

## Built-in Components

hetzner-k3s automatically installs:

1. **Hetzner Cloud Controller Manager**: Provisions LoadBalancers
2. **Hetzner CSI Driver**: Provisions persistent volumes
3. **System Upgrade Controller**: Zero-downtime K3s upgrades
4. **Cluster Autoscaler**: Scales nodes based on demand

## LoadBalancer Configuration

```yaml
# The CCM handles LoadBalancer provisioning
apiVersion: v1
kind: Service
metadata:
  name: my-service
  annotations:
    load-balancer.hetzner.cloud/name: "my-lb"
    load-balancer.hetzner.cloud/location: "fsn1"
    load-balancer.hetzner.cloud/type: "lb11"  # lb11, lb21, lb31
    load-balancer.hetzner.cloud/algorithm-type: "round_robin"
    load-balancer.hetzner.cloud/health-check-interval: "15s"
    load-balancer.hetzner.cloud/health-check-timeout: "10s"
    load-balancer.hetzner.cloud/health-check-retries: "3"
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8000
```

### LoadBalancer Pricing

| Type | Connections/s | Bandwidth | Price/mo |
|------|--------------|-----------|----------|
| lb11 | 10,000 | 50 TB | €5.39 |
| lb21 | 25,000 | 100 TB | €10.99 |
| lb31 | 100,000 | 200 TB | €16.59 |

## Persistent Volumes

```yaml
# PVC with Hetzner CSI
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: task-data
spec:
  storageClassName: hcloud-volumes
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi  # €0.0440/GB/month = €0.44/mo
```

## Networking Options

### Flannel (Default - Simple)
- Easy to set up
- Works out of the box
- Limited features

### Cilium (Advanced)
```yaml
networking:
  cni:
    cilium:
      enabled: true
```
- eBPF-based
- Network policies
- Service mesh capabilities
- Better observability

## Scaling Beyond 100 Nodes

Hetzner private networks support up to 100 nodes. For larger clusters:

```yaml
# Use public networking for large clusters
networking:
  private_network:
    enabled: false
```

## Common Issues & Solutions

### SSH Connection Refused
- Verify SSH key paths in config
- Check `allowed_networks.ssh` includes your IP
- Try: `ssh -i ~/.ssh/id_ed25519 root@NODE_IP`

### Cluster Creation Stuck
- Check Hetzner API token permissions
- Verify sufficient Hetzner project quotas
- Check location availability

### LoadBalancer Pending
- Verify CCM is running: `kubectl get pods -n kube-system | grep cloud-controller`
- Check annotations on Service
- Verify Hetzner API token has write permissions

## Comparison with Managed K8s

| Aspect | Hetzner + K3s | DOKS/AKS/GKE |
|--------|---------------|---------------|
| Control plane | Self-managed | Managed |
| Cost (3-node) | ~€18/mo | ~$36-50/mo |
| Setup time | 2-3 min | 5-15 min |
| Upgrades | Manual (with SUC) | Automatic |
| Support | Community | Vendor support |
| SLA | None | 99.5-99.95% |

## Sources

- [hetzner-k3s GitHub](https://github.com/vitobotta/hetzner-k3s)
- [hetzner-k3s Documentation](https://vitobotta.github.io/hetzner-k3s/)
- [hetzner-k3s.com](https://hetzner-k3s.com/)
- [Hetzner Cloud Pricing](https://www.hetzner.com/cloud)
