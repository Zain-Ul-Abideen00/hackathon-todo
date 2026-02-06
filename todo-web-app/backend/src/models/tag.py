from datetime import UTC, datetime
from sqlmodel import Field, SQLModel, Relationship
from .task_tag import TaskTag

def utc_now() -> datetime:
    """Return current UTC datetime as naive datetime for PostgreSQL compatibility."""
    return datetime.now(UTC).replace(tzinfo=None)

class Tag(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    name: str = Field(max_length=50)
    color: str = Field(default="3B82F6", max_length=7)
    created_at: datetime = Field(default_factory=utc_now)

    tasks: list["Task"] = Relationship(
        back_populates="tags",
        link_model=TaskTag,
        sa_relationship_kwargs={"lazy": "selectin"}
    )

class TagCreate(SQLModel):
    name: str = Field(max_length=50)
    color: str = Field(default="3B82F6", max_length=7)

class TagUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=50)
    color: str | None = Field(default=None, max_length=7)
