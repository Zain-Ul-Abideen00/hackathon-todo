from datetime import UTC, datetime
from sqlmodel import Field, SQLModel, Relationship

def utc_now() -> datetime:
    """Return current UTC datetime as naive datetime for PostgreSQL compatibility."""
    return datetime.now(UTC).replace(tzinfo=None)

class Reminder(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="task.id", index=True)
    user_id: str = Field(index=True)
    remind_at: datetime
    triggered: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now)

    task: "Task" = Relationship(
        back_populates="reminders",
        sa_relationship_kwargs={"lazy": "selectin"}
    )

class ReminderCreate(SQLModel):
    remind_at: datetime

class ReminderUpdate(SQLModel):
    remind_at: datetime | None = None
    triggered: bool | None = None
