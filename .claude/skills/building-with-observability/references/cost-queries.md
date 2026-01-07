# Cost Engineering Queries and Patterns

## OpenCost PromQL Queries

### Cost by Namespace

```promql
# Daily cost by namespace (CPU + Memory)
sum(
  (
    sum(container_cpu_allocation{namespace!=""}) by (namespace)
    * on(node) group_left() node_cpu_hourly_cost
  ) +
  (
    sum(container_memory_allocation_bytes{namespace!=""}) by (namespace) / 1024 / 1024 / 1024
    * on(node) group_left() node_ram_hourly_cost
  )
) by (namespace) * 24
```

### Cost by Team (using labels)

```promql
# Assuming pods have team labels
sum(
  container_cpu_allocation * on(node) group_left() node_cpu_hourly_cost * 24
) by (label_team)
```

### Idle/Wasted Resources

```promql
# CPU waste (requested but unused)
sum(container_cpu_allocation - container_cpu_usage_seconds_total) by (namespace)

# Memory waste (requested but unused)
sum(container_memory_allocation_bytes - container_memory_usage_bytes) by (namespace)

# Waste percentage
(1 - (
  sum(container_cpu_usage_seconds_total) by (namespace) /
  sum(container_cpu_allocation) by (namespace)
)) * 100
```

### Right-Sizing Recommendations

```promql
# Pods where usage is < 50% of request (candidates for right-sizing)
(
  sum(rate(container_cpu_usage_seconds_total[7d])) by (namespace, pod) /
  sum(container_cpu_allocation) by (namespace, pod)
) < 0.5
```

## Grafana Dashboard for Cost Visibility

```json
{
  "title": "Kubernetes Cost Dashboard",
  "panels": [
    {
      "title": "Total Monthly Cost Estimate",
      "type": "stat",
      "targets": [{
        "expr": "sum(container_cpu_allocation * on(node) group_left() node_cpu_hourly_cost + container_memory_allocation_bytes / 1024 / 1024 / 1024 * on(node) group_left() node_ram_hourly_cost) * 24 * 30"
      }],
      "fieldConfig": {
        "defaults": {
          "unit": "currencyUSD"
        }
      }
    },
    {
      "title": "Cost by Namespace",
      "type": "piechart",
      "targets": [{
        "expr": "sum((container_cpu_allocation * on(node) group_left() node_cpu_hourly_cost + container_memory_allocation_bytes / 1024 / 1024 / 1024 * on(node) group_left() node_ram_hourly_cost) * 24) by (namespace)"
      }]
    },
    {
      "title": "Efficiency Score",
      "type": "gauge",
      "description": "CPU utilization vs allocation",
      "targets": [{
        "expr": "sum(rate(container_cpu_usage_seconds_total[1h])) / sum(container_cpu_allocation) * 100"
      }],
      "fieldConfig": {
        "defaults": {
          "unit": "percent",
          "thresholds": {
            "steps": [
              {"color": "red", "value": 0},
              {"color": "yellow", "value": 40},
              {"color": "green", "value": 70}
            ]
          }
        }
      }
    },
    {
      "title": "Waste by Namespace",
      "type": "bargauge",
      "targets": [{
        "expr": "sum((container_cpu_allocation - rate(container_cpu_usage_seconds_total[1h])) * on(node) group_left() node_cpu_hourly_cost * 24) by (namespace)",
        "legendFormat": "{{namespace}}"
      }],
      "fieldConfig": {
        "defaults": {
          "unit": "currencyUSD"
        }
      }
    }
  ]
}
```

## Cost Allocation Labels

### Kubernetes Resource Labels

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: task-api
  labels:
    # Cost allocation labels
    cost-center: "platform"
    team: "agents"
    product: "task-manager"
    environment: "production"
    business-unit: "engineering"
spec:
  template:
    metadata:
      labels:
        app: task-api
        # Inherit cost labels
        cost-center: "platform"
        team: "agents"
```

### Namespace-Level Cost Allocation

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: agents-prod
  labels:
    cost-center: "platform"
    team: "agents"
    environment: "production"
```

## Budget Alerts

### PrometheusRule for Cost Alerts

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: cost-alerts
  namespace: monitoring
spec:
  groups:
  - name: cost.alerts
    rules:
    # Daily cost threshold
    - alert: HighDailyCost
      expr: |
        sum(
          container_cpu_allocation * on(node) group_left() node_cpu_hourly_cost +
          container_memory_allocation_bytes / 1024 / 1024 / 1024 * on(node) group_left() node_ram_hourly_cost
        ) * 24 > 100
      for: 1h
      labels:
        severity: warning
      annotations:
        summary: "Daily cost exceeds $100"
        description: "Current daily cost estimate: ${{ $value | printf \"%.2f\" }}"

    # Cost spike detection
    - alert: CostSpike
      expr: |
        (
          sum(container_cpu_allocation * on(node) group_left() node_cpu_hourly_cost)
          /
          sum(container_cpu_allocation * on(node) group_left() node_cpu_hourly_cost offset 1d)
        ) > 1.5
      for: 30m
      labels:
        severity: warning
      annotations:
        summary: "Cost increased 50% vs yesterday"

    # Low efficiency alert
    - alert: LowResourceEfficiency
      expr: |
        sum(rate(container_cpu_usage_seconds_total[1h])) / sum(container_cpu_allocation) < 0.3
      for: 6h
      labels:
        severity: info
      annotations:
        summary: "Cluster CPU efficiency below 30%"
        description: "Consider right-sizing workloads"
```

## FinOps Best Practices

### 1. Schedule Non-Production

```yaml
# CronJob to scale down dev at night
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scale-down-dev
spec:
  schedule: "0 19 * * 1-5"  # 7 PM weekdays
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: kubectl
            image: bitnami/kubectl
            command:
            - kubectl
            - scale
            - deployment
            - --all
            - --replicas=0
            - -n
            - dev
          restartPolicy: OnFailure
---
# Scale up in morning
apiVersion: batch/v1
kind: CronJob
metadata:
  name: scale-up-dev
spec:
  schedule: "0 7 * * 1-5"  # 7 AM weekdays
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: kubectl
            image: bitnami/kubectl
            command:
            - kubectl
            - scale
            - deployment
            - --all
            - --replicas=1
            - -n
            - dev
          restartPolicy: OnFailure
```

### 2. Right-Sizing with VPA

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: task-api-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: task-api
  updatePolicy:
    updateMode: "Off"  # Only recommend, don't auto-update
  resourcePolicy:
    containerPolicies:
    - containerName: "*"
      minAllowed:
        cpu: 50m
        memory: 64Mi
      maxAllowed:
        cpu: 2
        memory: 4Gi
```

### 3. Cost Reports

```bash
# kubectl-cost plugin queries
kubectl cost namespace --show-efficiency
kubectl cost deployment -n default --show-all-resources
kubectl cost pod -n default --sort-by=cost
```
