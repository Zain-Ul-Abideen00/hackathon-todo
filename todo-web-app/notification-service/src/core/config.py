"""Core Configuration for Notification Service.

Environment configuration for the notification service.
Uses Dapr secrets store when DAPR_SECRETS_ENABLED is true.
"""

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings from environment variables."""

    # Service configuration
    app_name: str = "notification-service"
    app_port: int = 8001
    environment: str = "development"
    log_level: str = "INFO"

    # Dapr configuration
    dapr_http_port: int = 3500
    dapr_grpc_port: int = 50001
    dapr_secrets_enabled: bool = False
    dapr_secret_store: str = "kubernetes-secrets"

    # Optional: Email provider (for future use)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""

    # Optional: Push notification (for future use)
    push_enabled: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()


def get_dapr_url() -> str:
    """Get Dapr sidecar URL."""
    return f"http://localhost:{settings.dapr_http_port}"
