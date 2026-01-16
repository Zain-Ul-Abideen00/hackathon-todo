# =============================================================================
# Hugging Face Spaces - Production Dockerfile
# =============================================================================
# Multi-stage build for FastAPI backend deployment on Hugging Face Spaces
# Port: 7860 (required by HF Spaces)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder - Install dependencies
# -----------------------------------------------------------------------------
FROM python:3.12-slim AS builder

WORKDIR /app

# Install uv for fast dependency management
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install production dependencies only (no dev dependencies)
RUN uv sync --frozen --no-dev

# -----------------------------------------------------------------------------
# Stage 2: Runtime - Minimal production image
# -----------------------------------------------------------------------------
FROM python:3.12-slim

# Create non-root user for security
RUN adduser --disabled-password --gecos "" --uid 1000 appuser

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY --chown=appuser:appuser . .

# Configure environment
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Switch to non-root user
USER appuser

# Expose Hugging Face Spaces required port
EXPOSE 7860

# Health check using existing endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:7860/api/health')" || exit 1

# Start FastAPI with uvicorn
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]
