"""Tag-related Pydantic schemas for API request/response validation."""

from pydantic import BaseModel, Field


class TagResponse(BaseModel):
    """Schema for tag API responses."""

    id: int = Field(..., description="Unique tag identifier")
    name: str = Field(..., description="Tag name")
    color: str = Field(..., description="Tag color hex code")
    user_id: str = Field(..., description="Owner's user ID")

    model_config = {"from_attributes": True}
