"""Common schemas for consistent API responses."""

from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """Detail about a specific validation error."""

    field: str
    message: str


class ErrorResponse(BaseModel):
    """Standardized error response format.

    Attributes:
        code: Error code for programmatic handling (e.g., VALIDATION_ERROR, NOT_FOUND)
        message: Human-readable error message
        details: Optional list of field-specific errors
    """

    code: str = Field(..., description="Error code (e.g., VALIDATION_ERROR, NOT_FOUND, FORBIDDEN)")
    message: str = Field(..., description="Human-readable error message")
    details: list[ErrorDetail] | None = Field(default=None, description="Field-specific errors")


class PaginationMeta(BaseModel):
    """Pagination metadata for list responses.

    Attributes:
        next_cursor: Cursor for the next page (base64 encoded task_id)
        has_more: Whether more items exist after this page
    """

    next_cursor: str | None = Field(default=None, description="Cursor for next page")
    has_more: bool = Field(..., description="Whether more items exist")
