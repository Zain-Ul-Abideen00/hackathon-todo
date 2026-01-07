# Dapr Workflows Reference (Chapter 59)

## Workflow Fundamentals

Dapr Workflows provide **durable orchestration** for long-running, fault-tolerant processes:
- **Stateful**: Progress is persisted, survives restarts
- **Fault-tolerant**: Automatically resumes from last checkpoint
- **Built on Actors**: Uses Dapr actor backend for state
- **Event-sourced**: Replay-based execution model

## Python SDK: dapr-ext-workflow

### Installation

```bash
pip install dapr-ext-workflow
```

### Workflow Definition

```python
import dapr.ext.workflow as wf
from dataclasses import dataclass
from datetime import timedelta

@dataclass
class TaskOrder:
    task_id: str
    title: str
    assignee: str

@dataclass
class TaskResult:
    task_id: str
    status: str
    completed_at: str

def task_processing_workflow(ctx: wf.DaprWorkflowContext, order: TaskOrder):
    """Orchestrate task processing with multiple activities."""

    # Step 1: Validate task
    validation = yield ctx.call_activity(validate_task, input=order)
    if not validation["valid"]:
        return TaskResult(order.task_id, "rejected", "")

    # Step 2: Assign task (with retry policy)
    assignment = yield ctx.call_activity(
        assign_task,
        input=order,
        retry_policy=wf.RetryPolicy(
            max_attempts=3,
            initial_interval=timedelta(seconds=1),
            backoff_coefficient=2.0
        )
    )

    # Step 3: Wait for completion (external event or timeout)
    completion_event = ctx.wait_for_external_event("task_completed")
    timeout_event = ctx.create_timer(timedelta(hours=24))
    winner = yield wf.when_any([completion_event, timeout_event])

    if winner == timeout_event:
        # Task timed out - run compensation
        yield ctx.call_activity(notify_timeout, input=order)
        return TaskResult(order.task_id, "timed_out", "")

    # Task completed successfully
    result = completion_event.get_result()
    yield ctx.call_activity(send_completion_notification, input=order)

    return TaskResult(order.task_id, "completed", result["completed_at"])
```

### Activity Definitions

```python
def validate_task(ctx, order: TaskOrder) -> dict:
    """Activities can call external services, databases, APIs."""
    print(f"Validating task: {order.task_id}")
    # Activities can be non-deterministic (unlike workflows)
    return {"valid": True, "validated_at": datetime.utcnow().isoformat()}

def assign_task(ctx, order: TaskOrder) -> dict:
    """Assign task to user."""
    print(f"Assigning task {order.task_id} to {order.assignee}")
    # Can call Dapr service invocation here
    return {"assigned": True, "assignee": order.assignee}

def notify_timeout(ctx, order: TaskOrder) -> None:
    """Send timeout notification."""
    print(f"Task {order.task_id} timed out")

def send_completion_notification(ctx, order: TaskOrder) -> None:
    """Send completion notification."""
    print(f"Task {order.task_id} completed")
```

### Workflow Runtime

```python
from dapr.ext.workflow import WorkflowRuntime, DaprWorkflowClient

# Create workflow runtime
workflow_runtime = WorkflowRuntime()

# Register workflows and activities
workflow_runtime.register_workflow(task_processing_workflow)
workflow_runtime.register_activity(validate_task)
workflow_runtime.register_activity(assign_task)
workflow_runtime.register_activity(notify_timeout)
workflow_runtime.register_activity(send_completion_notification)

# Start the runtime
await workflow_runtime.start()

# Create client for managing workflows
workflow_client = DaprWorkflowClient()

# Start a workflow instance
instance_id = await workflow_client.schedule_new_workflow(
    workflow=task_processing_workflow,
    input=TaskOrder("task-123", "Review PR", "alice@example.com"),
    instance_id="task-123-workflow"  # Optional custom ID
)

# Query workflow status
status = await workflow_client.get_workflow_state(instance_id)
print(f"Status: {status.runtime_status}")

# Raise external event
await workflow_client.raise_workflow_event(
    instance_id=instance_id,
    event_name="task_completed",
    data={"completed_at": datetime.utcnow().isoformat()}
)

# Terminate workflow
await workflow_client.terminate_workflow(instance_id)

# Purge workflow history
await workflow_client.purge_workflow(instance_id)
```

## Workflow Patterns

### 1. Task Chaining

Sequential execution with data passing:

```python
def chained_workflow(ctx: wf.DaprWorkflowContext, input_data: dict):
    result1 = yield ctx.call_activity(step1, input=input_data)
    result2 = yield ctx.call_activity(step2, input=result1)
    result3 = yield ctx.call_activity(step3, input=result2)
    return result3
```

### 2. Fan-Out/Fan-In

Parallel execution with aggregation:

```python
def fanout_workflow(ctx: wf.DaprWorkflowContext, items: list):
    # Fan-out: Schedule all tasks in parallel
    parallel_tasks = [
        ctx.call_activity(process_item, input=item)
        for item in items
    ]

    # Fan-in: Wait for all to complete
    results = yield wf.when_all(parallel_tasks)

    # Aggregate results
    total = sum(results)
    return total
```

### 3. Monitor Pattern (Eternal Workflow)

Long-running polling with continue-as-new:

```python
@dataclass
class MonitorState:
    job_id: str
    is_healthy: bool = True
    check_count: int = 0

def monitor_workflow(ctx: wf.DaprWorkflowContext, state: MonitorState):
    # Check status
    status = yield ctx.call_activity(check_status, input=state.job_id)

    if status == "healthy":
        state.is_healthy = True
        sleep_interval = timedelta(minutes=60)  # Check less often
    else:
        if state.is_healthy:
            state.is_healthy = False
            yield ctx.call_activity(send_alert, input=state.job_id)
        sleep_interval = timedelta(minutes=5)  # Check more often

    # Sleep
    yield ctx.create_timer(sleep_interval)

    # Restart workflow with new state (keeps history small)
    state.check_count += 1
    ctx.continue_as_new(state)
```

### 4. Human Interaction (Approval)

Wait for external event with timeout:

```python
def approval_workflow(ctx: wf.DaprWorkflowContext, order: dict):
    if order["amount"] > 1000:
        # Request approval
        yield ctx.call_activity(request_approval, input=order)

        # Wait for approval or timeout
        approval_event = ctx.wait_for_external_event("approval_received")
        timeout = ctx.create_timer(timedelta(days=3))

        winner = yield wf.when_any([approval_event, timeout])

        if winner == timeout:
            return {"status": "rejected", "reason": "approval_timeout"}

        approval = approval_event.get_result()
        if not approval["approved"]:
            return {"status": "rejected", "reason": approval.get("reason")}

    # Process order
    yield ctx.call_activity(process_order, input=order)
    return {"status": "completed"}
```

### 5. Saga Pattern (Compensation)

Rollback on failure:

```python
def order_saga_workflow(ctx: wf.DaprWorkflowContext, order: dict):
    compensations = []

    try:
        # Step 1: Reserve inventory
        yield ctx.call_activity(reserve_inventory, input=order)
        compensations.append(("release_inventory", order))

        # Step 2: Process payment
        yield ctx.call_activity(process_payment, input=order)
        compensations.append(("refund_payment", order))

        # Step 3: Ship order
        yield ctx.call_activity(ship_order, input=order)
        compensations.append(("cancel_shipment", order))

        return {"status": "success"}

    except Exception as e:
        # Compensate in reverse order
        for compensation_name, data in reversed(compensations):
            try:
                yield ctx.call_activity(compensation_name, input=data)
            except Exception:
                pass  # Log but continue compensating

        return {"status": "failed", "error": str(e)}
```

### 6. Child Workflows

Break large workflows into smaller pieces:

```python
def parent_workflow(ctx: wf.DaprWorkflowContext, orders: list):
    # Process each order in a child workflow
    child_tasks = [
        ctx.call_child_workflow(
            order_processing_workflow,
            input=order,
            instance_id=f"order-{order['id']}"
        )
        for order in orders
    ]

    results = yield wf.when_all(child_tasks)
    return {"processed": len(results), "results": results}
```

## Workflow Determinism Rules

**Workflows MUST be deterministic** for replay to work correctly.

### DO NOT:
```python
# DON'T use random
import random
value = random.randint(1, 100)  # NON-DETERMINISTIC

# DON'T use current time
from datetime import datetime
now = datetime.utcnow()  # NON-DETERMINISTIC

# DON'T call external services directly
import httpx
response = httpx.get("https://api.example.com")  # NON-DETERMINISTIC

# DON'T use environment variables
import os
config = os.getenv("MY_CONFIG")  # NON-DETERMINISTIC
```

### DO:
```python
# DO use workflow context for time
now = ctx.current_utc_datetime

# DO use activities for external calls
response = yield ctx.call_activity(make_api_call, input=url)

# DO pass configuration as workflow input
def my_workflow(ctx, input_data):
    config = input_data["config"]  # DETERMINISTIC
```

## Workflow Management CLI

```bash
# Start workflow
dapr workflow run TaskProcessingWorkflow \
  --app-id task-service \
  --input '{"task_id": "123", "title": "Review PR"}'

# List workflows
dapr workflow list --app-id task-service --filter-status RUNNING

# Get workflow status
dapr workflow get <instance-id> --app-id task-service

# View history
dapr workflow history <instance-id> --app-id task-service

# Raise event
dapr workflow raise-event <instance-id>/task_completed \
  --app-id task-service \
  --input '{"completed_at": "2025-01-15T10:00:00Z"}'

# Suspend/Resume
dapr workflow suspend <instance-id> --app-id task-service
dapr workflow resume <instance-id> --app-id task-service

# Terminate
dapr workflow terminate <instance-id> --app-id task-service

# Purge (clean up completed)
dapr workflow purge --app-id task-service --all-older-than 720h
```

## Workflow vs Actors: When to Use

| Use Case | Actors | Workflows |
|----------|--------|-----------|
| Stateful entity with identity | ✅ | |
| Long-running orchestration | | ✅ |
| Turn-based concurrency | ✅ | |
| Multi-step business process | | ✅ |
| Timers/Reminders on entity | ✅ | |
| Compensation/Rollback | | ✅ |
| Parallel task execution | | ✅ |
| Chat sessions | ✅ | |
| Order processing | | ✅ |

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `WORKFLOW_NOT_FOUND` | Instance doesn't exist | Check instance ID |
| `WORKFLOW_ALREADY_EXISTS` | Duplicate instance ID | Use unique ID or reuse |
| `ACTIVITY_EXECUTION_FAILED` | Activity threw exception | Check activity logs |
| `NON_DETERMINISTIC` | Workflow code changed | Don't modify running workflows |
| `WORKFLOW_TIMEOUT` | Timer expired | Handle timeout case |
