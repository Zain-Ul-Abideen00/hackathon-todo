# Dapr Actors Reference (Chapter 59)

## Actor Model Fundamentals

The Actor Model (Hewitt, 1973) is a mathematical model for concurrent computation where:
- **Actors** are the fundamental unit of computation
- Each actor has private **state**, **behavior**, and a **mailbox**
- Actors communicate only via **asynchronous messages**
- No shared state = no locks, no race conditions

### Dapr Virtual Actors

Dapr implements the **Virtual Actor** pattern (Microsoft Orleans):
- Actors are **activated on-demand** when first invoked
- Actors are **garbage-collected** when idle
- Actor state is **persisted** in configured state store
- Actors are **distributed** across cluster nodes automatically

## Python SDK: dapr-ext-fastapi

### Installation

```bash
pip install dapr-ext-fastapi
```

### Actor Interface Definition

```python
from dapr.actor import ActorInterface, actormethod

class TaskActorInterface(ActorInterface):
    @actormethod(name="get_task")
    async def get_task(self) -> dict: ...

    @actormethod(name="update_status")
    async def update_status(self, status: str) -> None: ...

    @actormethod(name="set_reminder")
    async def set_reminder(self, reminder_name: str, due_time: str) -> None: ...
```

### Actor Implementation

```python
from dapr.actor import Actor
from dapr.actor.runtime.context import ActorRuntimeContext

class TaskActor(Actor, TaskActorInterface):
    def __init__(self, ctx: ActorRuntimeContext, actor_id: str):
        super().__init__(ctx, actor_id)
        self._state_manager = ctx.state_manager

    async def _on_activate(self) -> None:
        """Called when actor is activated."""
        print(f"TaskActor {self.id} activated")
        # Load initial state
        has_state = await self._state_manager.try_get_state("task_data")
        if not has_state[0]:
            await self._state_manager.set_state("task_data", {
                "status": "pending",
                "created_at": datetime.utcnow().isoformat()
            })

    async def _on_deactivate(self) -> None:
        """Called when actor is deactivated (garbage collected)."""
        print(f"TaskActor {self.id} deactivated")

    async def get_task(self) -> dict:
        """Get current task state."""
        state = await self._state_manager.get_state("task_data")
        return {"id": self.id.id, **state}

    async def update_status(self, status: str) -> None:
        """Update task status with turn-based concurrency."""
        state = await self._state_manager.get_state("task_data")
        state["status"] = status
        state["updated_at"] = datetime.utcnow().isoformat()
        await self._state_manager.set_state("task_data", state)

    async def set_reminder(self, reminder_name: str, due_time: str) -> None:
        """Register a durable reminder that survives restarts."""
        await self.register_reminder(
            reminder_name=reminder_name,
            state=b'reminder_payload',
            due_time=timedelta(seconds=int(due_time)),
            period=timedelta(seconds=0)  # One-time reminder
        )

    async def receive_reminder(self, name: str, state: bytes,
                               due_time: timedelta, period: timedelta) -> None:
        """Callback when reminder fires."""
        print(f"Reminder {name} fired for actor {self.id}")
        if name == "deadline_reminder":
            await self.update_status("overdue")
```

### FastAPI Integration

```python
from fastapi import FastAPI
from dapr.ext.fastapi import DaprActor
from dapr.actor.runtime.config import ActorRuntimeConfig
from dapr.actor.runtime.runtime import ActorRuntime

app = FastAPI()
dapr_actor = DaprActor(app)

# Configure actor runtime
config = ActorRuntimeConfig()
config.update_actor_idle_timeout(timedelta(minutes=10))
config.update_drain_ongoing_call_timeout(timedelta(seconds=30))

ActorRuntime.set_actor_config(config)

# Register actor types
@app.on_event("startup")
async def startup():
    await dapr_actor.register_actor(TaskActor)

# Actor invocation endpoint (handled by Dapr)
# Dapr calls: POST /actors/{actorType}/{actorId}/method/{methodName}
```

### Client Invocation

```python
from dapr.clients import DaprClient
from dapr.actor import ActorProxy, ActorId

# Using ActorProxy (type-safe)
proxy = ActorProxy.create("TaskActor", ActorId("task-123"), TaskActorInterface)
task = await proxy.get_task()
await proxy.update_status("in_progress")

# Using DaprClient (HTTP)
with DaprClient() as client:
    result = client.invoke_actor(
        actor_type="TaskActor",
        actor_id="task-123",
        method="get_task"
    )
```

## Timers vs Reminders

| Feature | Timer | Reminder |
|---------|-------|----------|
| Persistence | Lost on deactivation | Survives restarts |
| Storage | In-memory only | State store |
| Use case | Lightweight, short-lived | Durable, long-lived |
| Resource cost | Low | Higher |

### Timer Example

```python
# Timers are NOT persisted - lost when actor deactivates
async def start_timer(self):
    await self.register_timer(
        timer_name="check_timer",
        callback="on_timer",
        state=b'timer_state',
        due_time=timedelta(seconds=5),
        period=timedelta(seconds=10)
    )

async def on_timer(self, state: bytes) -> None:
    print("Timer fired!")
```

### Reminder Example

```python
# Reminders ARE persisted - survive actor deactivation and restarts
async def start_reminder(self):
    await self.register_reminder(
        reminder_name="daily_check",
        state=b'reminder_state',
        due_time=timedelta(hours=24),
        period=timedelta(hours=24)  # Repeat daily
    )

async def receive_reminder(self, name: str, state: bytes,
                           due_time: timedelta, period: timedelta) -> None:
    if name == "daily_check":
        await self.perform_daily_check()
```

## Turn-Based Concurrency

Dapr actors process **one message at a time** (single-threaded per actor):

```
Actor: task-123
    ↓
┌─────────────┐
│  Message 1  │ ← Processing
├─────────────┤
│  Message 2  │ ← Waiting in queue
├─────────────┤
│  Message 3  │ ← Waiting in queue
└─────────────┘
```

**Benefits:**
- No locks needed
- State is always consistent
- Predictable behavior

**Reentrancy** (disabled by default):
```python
# Enable reentrancy for actor type
config = ActorRuntimeConfig()
config.update_reentrancy(ActorReentrancyConfig(enabled=True))
```

## Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: task-actor-service
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "task-actor-service"
        dapr.io/app-port: "8000"
        # Actor-specific annotations
        dapr.io/enable-actors: "true"
    spec:
      containers:
        - name: task-actor
          image: task-actor:latest
```

## Actor Placement Service

The `dapr-placement` service manages actor distribution:

```
┌─────────────────────────────────────────────────────────┐
│                 Dapr Placement Service                   │
│                                                          │
│  Actor Type: TaskActor                                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Partition Table                                  │   │
│  │  task-123 → node-1                               │   │
│  │  task-456 → node-2                               │   │
│  │  task-789 → node-1                               │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `ACTOR_TYPE_NOT_FOUND` | Actor type not registered | Register actor on startup |
| `ACTOR_INSTANCE_NOT_FOUND` | Actor not activated | Check actor ID format |
| `ACTOR_METHOD_NOT_FOUND` | Method not in interface | Verify `@actormethod` decorator |
| `REMINDER_NOT_FOUND` | Reminder doesn't exist | Check reminder was registered |
