# Cloud Kubernetes Provider Comparison

## Quick Reference (December 2025)

| Provider | Control Plane | Min 3-Node | Free Credits | Best For |
|----------|--------------|------------|--------------|----------|
| **Hetzner + K3s** | $0 | ~$18/mo | None | Learning, budget production |
| **Civo** | Free | ~$15/mo | $250 first month | Fast iteration, startups |
| **DigitalOcean DOKS** | Free | ~$36/mo | $200/60 days | Simplicity, startups |
| **Azure AKS** | Free | ~$45/mo | $200 | Microsoft ecosystem |
| **Google GKE** | Free* | ~$50/mo | $300 | Best autoscaling |
| **AWS EKS** | $73/mo | ~$150/mo | Varies | AWS ecosystem |

*GKE Autopilot has no separate control plane cost

## Detailed Pricing

### Control Plane Costs

| Provider | Standard | High Availability | Notes |
|----------|----------|-------------------|-------|
| Hetzner + K3s | $0 | $0 (3 masters) | Self-managed |
| Civo | $0 | N/A | K3s-based |
| DigitalOcean | $0 | $40/mo | 99.95% SLA with HA |
| Azure AKS | $0 | $0.10/hr | Uptime SLA tier |
| Google GKE | $0 | $0.10/hr | Zonal vs Regional |
| AWS EKS | $0.10/hr (~$73/mo) | Included | Always charged |

### Worker Node Costs (Comparable Sizes)

| Provider | 2 vCPU / 4GB | 4 vCPU / 8GB | 8 vCPU / 16GB |
|----------|--------------|--------------|---------------|
| Hetzner | €4.35/mo | €8.69/mo | €17.49/mo |
| Civo | $5/mo | $10/mo | $20/mo |
| DigitalOcean | $24/mo | $48/mo | $96/mo |
| Azure | ~$30/mo | ~$60/mo | ~$120/mo |
| GCP | ~$35/mo | ~$70/mo | ~$140/mo |
| AWS | ~$35/mo | ~$70/mo | ~$140/mo |

### Additional Costs

| Service | DOKS | AKS | GKE | EKS | Civo | Hetzner |
|---------|------|-----|-----|-----|------|---------|
| LoadBalancer | $12/mo | ~$18/mo | ~$18/mo | ~$18/mo | Free | €5.39/mo |
| Egress (first 1TB) | Free | $0.087/GB | $0.12/GB | $0.09/GB | Free | Free |
| Block Storage (/GB) | $0.10 | $0.12 | $0.10 | $0.10 | $0.10 | €0.044 |

## Feature Comparison

### Cluster Management

| Feature | DOKS | AKS | GKE | EKS | Civo | Hetzner |
|---------|------|-----|-----|-----|------|---------|
| Cluster creation time | 5 min | 10 min | 5-15 min | 15-20 min | 90 sec | 2-3 min |
| Auto-upgrades | Yes | Yes | Yes | Yes | Manual | With SUC |
| Node autoscaling | Yes | Yes | Yes | Yes | Yes | Yes |
| Multi-zone | Yes | Yes | Yes | Yes | No | Multi-location |
| Windows nodes | No | Yes | Yes | Yes | No | No |
| GPU nodes | H100 | Yes | Yes | Yes | No | No |
| Max nodes | 1,000 | 5,000 | 15,000 | Unlimited | 500 | 500+ |

### Networking

| Feature | DOKS | AKS | GKE | EKS | Civo | Hetzner |
|---------|------|-----|-----|-----|------|---------|
| Private cluster | Yes | Yes | Yes | Yes | No | Yes |
| Network policies | Cilium | Azure CNI | Yes | Calico | Cilium | Cilium |
| Service mesh | BYO | Azure SM | Anthos SM | App Mesh | BYO | BYO |
| Ingress | BYO | AGIC | GKE Ingress | ALB | Traefik | BYO |

### Security

| Feature | DOKS | AKS | GKE | EKS | Civo | Hetzner |
|---------|------|-----|-----|-----|------|---------|
| RBAC | Yes | Yes | Yes | Yes | Yes | Yes |
| Secrets encryption | Yes | Azure KV | Cloud KMS | KMS | Yes | Manual |
| Pod security | PSA | PSA | PSA | PSA | PSA | PSA |
| Compliance certs | SOC 2 | Many | Many | Many | SOC 2 | ISO 27001 |

### Observability

| Feature | DOKS | AKS | GKE | EKS | Civo | Hetzner |
|---------|------|-----|-----|-----|------|---------|
| Built-in monitoring | Basic | Azure Monitor | Cloud Ops | CloudWatch | Prometheus | BYO |
| Logging | Yes | Yes | Yes | Yes | Basic | BYO |
| Cost visibility | Basic | Cost Mgmt | Billing | Cost Explorer | Dashboard | Manual |

## CLI Comparison

### Cluster Creation

```bash
# DigitalOcean
doctl kubernetes cluster create my-cluster --size s-2vcpu-4gb --count 3

# Azure
az aks create -g my-rg -n my-cluster --node-count 3 --node-vm-size Standard_B2s

# Google
gcloud container clusters create-auto my-cluster --location us-central1

# AWS
eksctl create cluster --name my-cluster --node-type t3.medium --nodes 3

# Civo
civo kubernetes create my-cluster --size g4s.kube.medium --nodes 3 --wait

# Hetzner
hetzner-k3s create --config cluster.yaml
```

### Get Credentials

```bash
# DigitalOcean
doctl kubernetes cluster kubeconfig save my-cluster

# Azure
az aks get-credentials -g my-rg -n my-cluster

# Google
gcloud container clusters get-credentials my-cluster --location us-central1

# AWS
# Automatic with eksctl

# Civo
civo kubernetes config my-cluster > kubeconfig

# Hetzner
# Specified in cluster.yaml as kubeconfig_path
```

### Delete Cluster

```bash
# DigitalOcean
doctl kubernetes cluster delete my-cluster -f

# Azure
az aks delete -g my-rg -n my-cluster --yes

# Google
gcloud container clusters delete my-cluster --location us-central1 -q

# AWS
eksctl delete cluster --name my-cluster

# Civo
civo kubernetes remove my-cluster -y

# Hetzner
hetzner-k3s delete --config cluster.yaml
```

## Decision Framework

### Choose Hetzner + K3s if:
- Budget is primary concern
- Comfortable with self-management
- Need full control
- Learning Kubernetes

### Choose Civo if:
- Need fast cluster creation
- Budget-conscious but want managed
- Prefer K3s simplicity
- Developer-focused workflows

### Choose DigitalOcean if:
- Want simple managed experience
- Moderate budget
- Need good developer experience
- Don't need enterprise features

### Choose Azure AKS if:
- Already using Azure services
- Need Windows containers
- Enterprise compliance requirements
- Microsoft-centric organization

### Choose Google GKE if:
- Need best-in-class autoscaling
- Heavy AI/ML workloads
- Global traffic management
- Advanced networking needs

### Choose AWS EKS if:
- Already using AWS services
- Need extensive AWS integrations
- Enterprise-scale requirements
- Complex networking needs

## Migration Considerations

### Low Friction (Standard K8s)
- Hetzner K3s ↔ Any (just kubeconfig change)
- Civo ↔ Any (K3s compatible with K8s)
- DOKS ↔ Any (standard K8s)

### Medium Friction (Provider Features)
- AKS with Azure CNI → Requires CNI change
- GKE with GKE Ingress → Requires ingress change
- EKS with ALB Controller → Requires ingress change

### High Friction (Deep Integration)
- Using provider-specific service mesh
- Using provider-specific secrets management
- Using provider-specific CI/CD integration

## Sources

- [DigitalOcean Kubernetes](https://www.digitalocean.com/products/kubernetes)
- [Azure AKS](https://azure.microsoft.com/en-us/products/kubernetes-service)
- [Google GKE](https://cloud.google.com/kubernetes-engine)
- [AWS EKS](https://aws.amazon.com/eks/)
- [Civo Kubernetes](https://www.civo.com/kubernetes)
- [hetzner-k3s](https://github.com/vitobotta/hetzner-k3s)
