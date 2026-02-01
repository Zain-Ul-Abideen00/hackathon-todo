# Kubernetes Deployment

This directory contains Kubernetes deployment configurations for the **Todo Chatbot** application. The configurations are organized by deployment environment, supporting both local development and cloud production deployments.

## 📁 Directory Structure

```
k8s/
├── README.md           # This file - Root documentation
├── local/              # Local Minikube deployment (development)
│   ├── README.md       # Detailed local deployment guide
│   ├── backend/        # Backend Helm chart
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   └── frontend/       # Frontend Helm chart
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
└── cloud/              # Cloud deployment (coming soon)
    ├── production/     # Production environment
    └── staging/        # Staging environment
```

## 🚀 Deployment Environments

### Local Development (`local/`)

**Status**: ✅ Available

Deploy the Todo Chatbot to a local Minikube cluster for development and testing. This environment provides:

- Single-node Kubernetes cluster
- NodePort services for easy access
- Secrets loaded from local `.env` files
- Automated deployment via PowerShell script

**Quick Start:**
```powershell
cd todo-web-app
.\deploy.ps1
```

📖 [View Full Local Deployment Guide](./local/README.md)

---

### Cloud Production (`cloud/`)

**Status**: 🚧 Coming Soon (Phase 5)

Production-ready deployment for cloud Kubernetes providers. Planned features:

| Feature | Description |
|---------|-------------|
| **Multi-cloud Support** | Azure AKS, AWS EKS, Google GKE, DigitalOcean DOKS |
| **High Availability** | Multi-replica deployments with auto-scaling |
| **Ingress Controller** | NGINX/Traefik with TLS termination |
| **External Secrets** | Integration with cloud secret managers |
| **Observability** | Prometheus, Grafana, Loki stack |
| **GitOps Ready** | ArgoCD/Flux compatible manifests |

#### Planned Environments

| Environment | Purpose | Namespace |
|-------------|---------|-----------|
| **Staging** | Pre-production testing | `todo-staging` |
| **Production** | Live user traffic | `todo-production` |

---

## 📦 Application Components

The Todo Chatbot consists of two main services:

| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| **Backend** | FastAPI + Python | 8000 | REST API, ChatKit, AI Agent |
| **Frontend** | Next.js 16 | 3000 | React UI with Better Auth |

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐       ┌──────────────────┐            │
│  │  todo-frontend   │       │  todo-backend    │            │
│  │  ───────────────│       │  ───────────────│            │
│  │  Next.js 16     │──────▶│  FastAPI         │            │
│  │  Port: 3000     │       │  Port: 8000      │            │
│  │  NodePort: 30300│       │  NodePort: 30800 │            │
│  └──────────────────┘       └────────┬─────────┘            │
│                                      │                       │
│                                      ▼                       │
│                            ┌──────────────────┐             │
│                            │  External APIs   │             │
│                            │  ───────────────│             │
│                            │  • Neon DB      │             │
│                            │  • Gemini AI    │             │
│                            │  • Groq AI      │             │
│                            └──────────────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Secrets Management

### Local Development

Secrets are loaded from `.env` files via the `deploy.ps1` script:

| Source File | Secrets |
|-------------|---------|
| `backend/.env` | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GEMINI_API_KEY`, `GROQ_API_KEY` |
| `frontend/.env` | `DATABASE_URL`, `BETTER_AUTH_SECRET` |

### Cloud Production (Planned)

| Provider | Integration |
|----------|-------------|
| AWS | Secrets Manager + External Secrets Operator |
| Azure | Key Vault + CSI Driver |
| GCP | Secret Manager + Workload Identity |
| Generic | HashiCorp Vault |

---

## 🛠️ Prerequisites

### All Environments

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 20.10+ | Container runtime |
| kubectl | 1.28+ | Kubernetes CLI |
| Helm | 3.12+ | Package manager |

### Local Development

| Tool | Version | Purpose |
|------|---------|---------|
| Minikube | 1.32+ | Local K8s cluster |
| PowerShell | 5.1+ | Automation scripts |

### Cloud Production

| Tool | Version | Purpose |
|------|---------|---------|
| Cloud CLI | Latest | AWS/Azure/GCP CLI |
| Terraform | 1.6+ | Infrastructure as Code |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Local Deployment Guide](./local/README.md) | Step-by-step Minikube setup |
| [Specification](../specs/012-minikube-deployment/spec.md) | Feature requirements |
| [Implementation Plan](../specs/012-minikube-deployment/plan.md) | Technical architecture |
| [Quick Start](../specs/012-minikube-deployment/quickstart.md) | 5-minute deployment |

---

## 🆘 Support

### Common Issues

| Issue | Solution |
|-------|----------|
| Pods in CrashLoopBackOff | Check database connectivity, increase probe delays |
| ImagePullBackOff | Use `imagePullPolicy: Never` for Minikube |
| CORS errors | Verify `CORS_ORIGINS` includes frontend URL |
| Auth errors | Ensure `BETTER_AUTH_URL` matches access URL |

### Getting Help

1. Check the [troubleshooting guide](./local/README.md#troubleshooting)
2. Review pod logs: `kubectl logs deployment/<name> -n todo-app`
3. Describe pods: `kubectl describe pod -l app.kubernetes.io/name=<name> -n todo-app`

---

## 📝 License

This project is part of the GIAIC Quarter 4 Hackathon.

**Made with ❤️ by Zain Ul Abideen**
