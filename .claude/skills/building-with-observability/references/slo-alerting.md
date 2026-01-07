# SRE Alerting Patterns for SLOs

## Core Concepts

### SLI, SLO, SLA

| Term | Definition | Example |
|------|------------|---------|
| **SLI** | Service Level Indicator (measured) | 99.95% requests succeeded |
| **SLO** | Service Level Objective (target) | 99.9% success rate goal |
| **SLA** | Service Level Agreement (contract) | 99.9% or 10% credit |

### Error Budget

```
Error Budget = 100% - SLO

For 99.9% SLO:
  Error Budget = 0.1%
  Monthly budget = 43.2 minutes of downtime

For 99.5% SLO:
  Error Budget = 0.5%
  Monthly budget = 3.6 hours of downtime
```

## Multi-Burn-Rate Alerting

Google's recommended approach from the SRE Workbook.

### Why Burn Rate?

Direct threshold alerting (`error_rate > 0.1%`) has problems:
- Too noisy for brief spikes
- Too slow for sustained issues
- Doesn't account for error budget

Burn rate asks: "How fast are we consuming our error budget?"

### Burn Rate Formula

```
Burn Rate = Error Rate / Error Budget

For 99.9% SLO (0.1% error budget):
  1x burn = 0.1% errors (normal)
  14.4x burn = 1.44% errors (burn 2% budget in 1 hour)
  6x burn = 0.6% errors (burn 5% budget in 6 hours)
```

### Multi-Window, Multi-Burn-Rate Rules

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: task-api-slo-alerts
  namespace: monitoring
spec:
  groups:
  - name: task-api.slo.rules
    rules:
    # Recording rules for clean queries
    - record: task_api:requests:rate5m
      expr: sum(rate(http_requests_total{service="task-api"}[5m]))

    - record: task_api:errors:rate5m
      expr: sum(rate(http_requests_total{service="task-api",status=~"5.."}[5m]))

    - record: task_api:error_ratio:rate5m
      expr: task_api:errors:rate5m / task_api:requests:rate5m

  - name: task-api.slo.alerts
    rules:
    # Page: 2% budget burn in 1 hour (14.4x burn rate)
    - alert: TaskAPIHighErrorBudgetBurn
      expr: |
        (
          task_api:error_ratio:rate5m > (14.4 * 0.001)  # 5m window
          and
          task_api:error_ratio:rate1h > (14.4 * 0.001)  # 1h window for confirmation
        )
      for: 2m
      labels:
        severity: critical
        slo: availability
      annotations:
        summary: "Task API burning error budget rapidly"
        description: "Error rate {{ $value | humanizePercentage }} exceeds 14.4x burn rate. Will exhaust monthly budget in {{ printf \"%.0f\" (30 / 14.4) }} days at this rate."
        runbook_url: "https://runbooks.example.com/task-api-high-error-rate"

    # Ticket: 5% budget burn in 6 hours (6x burn rate)
    - alert: TaskAPIElevatedErrorRate
      expr: |
        (
          task_api:error_ratio:rate30m > (6 * 0.001)
          and
          task_api:error_ratio:rate6h > (6 * 0.001)
        )
      for: 5m
      labels:
        severity: warning
        slo: availability
      annotations:
        summary: "Task API error rate elevated"
        description: "Error rate {{ $value | humanizePercentage }} exceeds 6x burn rate."

    # P95 Latency SLO (200ms target)
    - alert: TaskAPIHighLatency
      expr: |
        histogram_quantile(0.95,
          sum(rate(http_request_duration_seconds_bucket{service="task-api"}[5m])) by (le)
        ) > 0.2
      for: 5m
      labels:
        severity: warning
        slo: latency
      annotations:
        summary: "Task API P95 latency above SLO"
        description: "P95 latency is {{ $value | humanizeDuration }}, exceeds 200ms SLO"
```

## Error Budget Dashboard

```json
{
  "title": "Task API SLO Dashboard",
  "panels": [
    {
      "title": "Availability (SLO: 99.9%)",
      "type": "stat",
      "targets": [{
        "expr": "1 - (sum(rate(http_requests_total{service=\"task-api\",status=~\"5..\"}[30d])) / sum(rate(http_requests_total{service=\"task-api\"}[30d])))"
      }],
      "fieldConfig": {
        "defaults": {
          "unit": "percentunit",
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {"color": "red", "value": 0.995},
              {"color": "yellow", "value": 0.999},
              {"color": "green", "value": 0.9995}
            ]
          }
        }
      }
    },
    {
      "title": "Error Budget Remaining",
      "type": "gauge",
      "targets": [{
        "expr": "1 - ((sum(rate(http_requests_total{service=\"task-api\",status=~\"5..\"}[30d])) / sum(rate(http_requests_total{service=\"task-api\"}[30d]))) / 0.001)"
      }],
      "fieldConfig": {
        "defaults": {
          "unit": "percentunit",
          "min": 0,
          "max": 1,
          "thresholds": {
            "steps": [
              {"color": "red", "value": 0},
              {"color": "yellow", "value": 0.25},
              {"color": "green", "value": 0.5}
            ]
          }
        }
      }
    },
    {
      "title": "Error Budget Burn Rate",
      "type": "timeseries",
      "targets": [{
        "expr": "(sum(rate(http_requests_total{service=\"task-api\",status=~\"5..\"}[1h])) / sum(rate(http_requests_total{service=\"task-api\"}[1h]))) / 0.001",
        "legendFormat": "Burn Rate"
      }],
      "fieldConfig": {
        "defaults": {
          "custom": {
            "thresholdsStyle": {
              "mode": "line"
            }
          },
          "thresholds": {
            "steps": [
              {"color": "green", "value": 0},
              {"color": "yellow", "value": 1},
              {"color": "red", "value": 6}
            ]
          }
        }
      }
    }
  ]
}
```

## Alertmanager Configuration

```yaml
# alertmanager.yaml
route:
  receiver: default
  routes:
  - match:
      severity: critical
      slo: availability
    receiver: pagerduty
    group_wait: 30s
    group_interval: 5m
    repeat_interval: 1h
  - match:
      severity: warning
    receiver: slack
    group_wait: 5m
    repeat_interval: 4h

receivers:
- name: default
  email_configs:
  - to: team@example.com

- name: pagerduty
  pagerduty_configs:
  - service_key: <key>
    severity: critical

- name: slack
  slack_configs:
  - api_url: https://hooks.slack.com/services/xxx
    channel: '#alerts'
    title: '{{ .GroupLabels.alertname }}'
    text: '{{ .CommonAnnotations.description }}'
```
