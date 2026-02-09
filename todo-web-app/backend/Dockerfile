# =============================================================================
# Production Dockerfile - FastAPI Backend
# =============================================================================
# Multi-stage build for FastAPI backend deployment
# Port: Configurable via PORT env var (default 8000 for K8s, HF sets 7860)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder - Install dependencies
# -----------------------------------------------------------------------------
FROM python:3.12-slim AS builder

WORKDIR /app

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

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

# Configurable port (default 8000 for K8s, HF Spaces auto-sets to 7860)
ENV PORT=8000

# Switch to non-root user
USER appuser

# Expose port (documentation only, actual port from $PORT)
EXPOSE 8000

# Health check using dynamic port
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen(f'http://localhost:{os.environ.get(\"PORT\", 8000)}/api/health')" || exit 1

# Start FastAPI with uvicorn using PORT env var
CMD sh -c "uvicorn src.main:app --host 0.0.0.0 --port ${PORT}"
