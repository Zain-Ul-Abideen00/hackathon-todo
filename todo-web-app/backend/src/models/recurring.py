from datetime import UTC, datetime
from sqlmodel import Field, SQLModel, Relationship

def utc_now() -> datetime:
    """Return current UTC datetime as naive datetime for PostgreSQL compatibility."""
    return datetime.now(UTC).replace(tzinfo=None)

class RecurringPattern(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="task.id", unique=True)
    pattern: str = Field(index=True) # daily, weekly, monthly
    interval: int = Field(default=1)
    end_date: datetime | None = None
    last_generated: datetime | None = None
    created_at: datetime = Field(default_factory=utc_now)

    task: "Task" = Relationship(back_populates="recurring_pattern")

class RecurringCreate(SQLModel):
    pattern: str
    interval: int = 1
    end_date: datetime | None = None

class RecurringUpdate(SQLModel):
    pattern: str | None = None
    interval: int | None = None
    end_date: datetime | None = None
