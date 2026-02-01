# Research: Helm Charts for Todo App

**Feature**: 011-helm-charts-kubernetes
**Date**: 2026-01-31
**Status**: Complete

## Research Summary

This document captures design decisions and best practices for Helm chart implementation based on constitution principles and skill references.

---

## Decision 1: Chart Structure

**Decision**: Separate Helm charts for backend and frontend in `k8s/local/` directory

**Rationale**:
- Constitution XVIII mandates "Separate charts for frontend and backend"
- Enables independent scaling and deployment lifecycle
- `k8s/local/` path follows Project_Structure_Guide.md for Phase 4 (Minikube) vs Phase 5 (cloud)

**Alternatives Considered**:
- Single umbrella chart with subcharts: Rejected - adds complexity, dependencies between services are simple
- Kustomize overlays: Rejected - Helm provides better templating for configurable values

---

## Decision 2: Service Type

**Decision**: NodePort services (backend: 30800, frontend: 30300)

**Rationale**:
- Constitution XIX recommends "NodePort for Minikube simplicity"
- Explicit port numbers prevent conflicts and are easier to document
- Works directly with `minikube service` command

**Alternatives Considered**:
- ClusterIP + port-forward: Requires manual port-forward setup each time
- LoadBalancer + minikube tunnel: Adds operational complexity
- Ingress controller: Requires nginx-ingress installation, overkill for local dev

---

## Decision 3: Probe Configuration

**Decision**: Standard probes with 10s initialDelay, 10s period, 3 failures

**Rationale**:
- Clarified during /sp.clarify session
- Balances responsiveness with startup time for both FastAPI and Next.js
- Constitution XIX specifies probe requirements

**Alternatives Considered**:
- Fast probes (5s): Risk of false positives during cold starts
- Slow probes (30s): Delays failure detection too much

---

## Decision 4: Image Pull Policy

**Decision**: `imagePullPolicy: Never` for Minikube local images

**Rationale**:
- Constitution XIX: "Set to `Never` when using locally-built images"
- Images built inside Minikube's Docker daemon don't need pulling
- Avoids "ImagePullBackOff" errors for local-only images

**Alternatives Considered**:
- `IfNotPresent`: Would try to pull from registry first, fail for local-only images
- `Always`: Would always fail for local images

---

## Decision 5: Secret Management

**Decision**: Helm Secret template with `stringData`, values passed via `--set`

**Rationale**:
- Constitution XX: "Use Kubernetes Secrets only" for sensitive data
- `stringData` is cleaner than base64-encoded `data`
- Pass via `--set` at install time to avoid committing real values

**Alternatives Considered**:
- Sealed Secrets: Adds complexity for local development
- External Secrets Operator: Overkill for Minikube
- Environment variables in values.yaml: Violates security principles

---

## Decision 6: External Database Connectivity

**Decision**: Standard egress to Neon PostgreSQL (no special NetworkPolicy)

**Rationale**:
- Clarified during /sp.clarify session
- Neon uses public HTTPS/TLS endpoints
- Minikube allows egress by default
- DATABASE_URL includes `sslmode=require`

**Alternatives Considered**:
- Explicit NetworkPolicy egress rules: Unnecessary complexity for local dev
- VPN tunnel to database: Neon is already secured via TLS

---

## Skill References Applied

### helm-chart-scaffolding
- Chart.yaml structure with apiVersion v2
- values.yaml hierarchical organization
- _helpers.tpl for name/label functions
- Go templating patterns (`{{ .Values.* }}`)

### k8s-manifest-generator
- Deployment with resource limits and probes
- Service with selector matching pod labels
- ConfigMap for non-sensitive environment vars
- Secret with stringData for credentials

---

## Outstanding Research

None - all clarifications resolved during /sp.clarify session.
