# OpenTelemetry FastAPI Integration

## Installation

```bash
pip install opentelemetry-api \
            opentelemetry-sdk \
            opentelemetry-instrumentation-fastapi \
            opentelemetry-exporter-otlp \
            opentelemetry-instrumentation-httpx \
            opentelemetry-instrumentation-sqlalchemy
```

## Auto-Instrumentation (Recommended for Quick Start)

```bash
# Install auto-instrumentation
pip install opentelemetry-distro opentelemetry-exporter-otlp

# Bootstrap - auto-detect and install instrumentations
opentelemetry-bootstrap -a install

# Run with auto-instrumentation
OTEL_SERVICE_NAME=task-api \
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4317 \
opentelemetry-instrument uvicorn main:app --host 0.0.0.0 --port 8000
```

**Note**: Auto-instrumentation does NOT work with `uvicorn --reload` or `--workers`. Use gunicorn for multi-worker.

## Programmatic Instrumentation

```python
from fastapi import FastAPI
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.sdk.resources import Resource, SERVICE_NAME

# Configure resource (service metadata)
resource = Resource.create({SERVICE_NAME: "task-api"})

# Configure tracer provider
provider = TracerProvider(resource=resource)
trace.set_tracer_provider(provider)

# Configure exporter
otlp_exporter = OTLPSpanExporter(
    endpoint="jaeger-collector:4317",
    insecure=True  # Use False with TLS
)

# Add batch processor for efficient export
provider.add_span_processor(BatchSpanProcessor(otlp_exporter))

# Create FastAPI app
app = FastAPI(title="Task API")

# Instrument the app
FastAPIInstrumentor.instrument_app(app)

# Your endpoints
@app.get("/tasks")
async def list_tasks():
    return {"tasks": []}
```

## Custom Spans

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

@app.post("/tasks")
async def create_task(task: TaskCreate):
    with tracer.start_as_current_span("create_task") as span:
        span.set_attribute("task.title", task.title)

        with tracer.start_as_current_span("validate_task"):
            # Validation logic
            pass

        with tracer.start_as_current_span("save_to_db"):
            # Database save
            pass

        span.set_attribute("task.id", new_task.id)
        return new_task
```

## Environment Variables

```bash
# Required
OTEL_SERVICE_NAME=task-api
OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4317

# Optional
OTEL_EXPORTER_OTLP_PROTOCOL=grpc  # or http/protobuf
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1  # 10% sampling

# Exclude health checks from tracing
OTEL_PYTHON_FASTAPI_EXCLUDED_URLS=health,readiness,metrics
```

## Request/Response Hooks

```python
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

def server_request_hook(span, scope):
    """Called when request span is created"""
    if scope.get("type") == "http":
        span.set_attribute("http.user_agent",
                          dict(scope.get("headers", [])).get(b"user-agent", b"").decode())

def server_response_hook(span, scope, response_headers):
    """Called before span is closed"""
    pass

FastAPIInstrumentor.instrument_app(
    app,
    server_request_hook=server_request_hook,
    server_response_hook=server_response_hook,
)
```

## Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: task-api
spec:
  template:
    spec:
      containers:
      - name: task-api
        image: task-api:latest
        env:
        - name: OTEL_SERVICE_NAME
          value: "task-api"
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: "http://jaeger-collector.monitoring.svc:4317"
        - name: OTEL_TRACES_SAMPLER
          value: "parentbased_traceidratio"
        - name: OTEL_TRACES_SAMPLER_ARG
          value: "0.1"  # 10% in production
        - name: OTEL_PYTHON_FASTAPI_EXCLUDED_URLS
          value: "health,metrics,readiness"
```
