# PromQL Patterns for Kubernetes Observability

## Basic Selectors

```promql
# Select metric by name
http_requests_total

# Filter by label
http_requests_total{status="200"}

# Regex match
http_requests_total{status=~"2.."}

# Negative match
http_requests_total{status!="500"}
```

## Rate and Aggregation

```promql
# Request rate over 5 minutes
rate(http_requests_total[5m])

# Sum by label
sum(rate(http_requests_total[5m])) by (service)

# Average across instances
avg(rate(http_requests_total[5m])) by (service)
```

## Histogram Percentiles

```promql
# P50 (median) latency
histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# P95 latency
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))

# P99 latency
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))
```

## Kubernetes-Specific Queries

### Pod CPU/Memory

```promql
# CPU usage by pod
sum(rate(container_cpu_usage_seconds_total{namespace="default"}[5m])) by (pod)

# Memory usage by pod (bytes)
sum(container_memory_usage_bytes{namespace="default"}) by (pod)

# Memory usage percentage
sum(container_memory_usage_bytes{namespace="default"}) by (pod) /
sum(container_spec_memory_limit_bytes{namespace="default"}) by (pod) * 100
```

### Node Resources

```promql
# Node CPU utilization
100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Node memory available
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100
```

### Kubernetes State

```promql
# Pods not ready
sum(kube_pod_status_ready{condition="false"}) by (namespace)

# Deployment replicas mismatch
kube_deployment_spec_replicas - kube_deployment_status_replicas_available

# Node readiness
sum(kube_node_status_condition{condition="Ready", status="true"})
```

## Error Rate Calculations

```promql
# Error rate as percentage
sum(rate(http_requests_total{status=~"5.."}[5m])) /
sum(rate(http_requests_total[5m])) * 100

# Availability (success rate)
1 - (sum(rate(http_requests_total{status=~"5.."}[5m])) /
     sum(rate(http_requests_total[5m])))
```

## SLO Burn Rate

```promql
# Error budget burn rate (for 99.9% SLO)
# Burns 1x budget = 0.1% errors
# Burns 14.4x budget in 1h = critical
(
  1 - (
    sum(rate(http_requests_total{status!~"5.."}[1h]))
    /
    sum(rate(http_requests_total[1h]))
  )
) / 0.001  # 0.001 = 1 - 0.999 = error budget for 99.9% SLO
```

## Dapr-Specific Metrics

```promql
# Dapr sidecar CPU usage
rate(container_cpu_usage_seconds_total{container="daprd"}[5m])

# Dapr HTTP request rate
rate(dapr_http_server_request_count[5m])

# Dapr latency
rate(dapr_http_server_request_duration_seconds_sum[5m]) /
rate(dapr_http_server_request_duration_seconds_count[5m])
```
