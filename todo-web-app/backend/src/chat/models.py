"""
LiteLLM Model Configuration.

Centralized model creation for all agents in the chat module.
Supports multiple providers (Gemini, Groq) with user selection from frontend.

Reference: .agent/skills/building-with-openai-agents/SKILL.md
"""

import os

from agents.extensions.models.litellm_model import LitellmModel


# =============================================================================
# Model Registry
# Maps frontend model IDs to (LiteLLM model string, API key env variable)
# =============================================================================

TASK_MODELS: dict[str, tuple[str, str]] = {
    # Gemini models (primary)
    "gemini-2.5-flash": ("gemini/gemini-2.5-flash", "GEMINI_API_KEY"),
    # Groq models (alternative/fallback)
    "groq-llama-3.3-70b": ("groq/llama-3.3-70b-versatile", "GROQ_API_KEY"),
    "groq-kimi-k2": ("groq/moonshotai/kimi-k2-instruct-0905", "GROQ_API_KEY"),
}

TITLE_MODELS: dict[str, tuple[str, str]] = {
    # Gemini models (primary)
    "gemini-2.5-flash-lite": ("gemini/gemini-2.5-flash-lite", "GEMINI_API_KEY"),
    # Groq models (alternative/fallback)
    "groq-llama-3.1-8b": ("groq/llama-3.1-8b-instant", "GROQ_API_KEY"),
}

# Default model IDs
DEFAULT_TASK_MODEL = "groq-llama-3.3-70b"
DEFAULT_TITLE_MODEL = "groq-llama-3.1-8b"


# =============================================================================
# Model Factory Functions
# =============================================================================


def _get_api_key(env_var: str) -> str:
    """Get API key from environment variable."""
    api_key = os.getenv(env_var)
    if not api_key:
        raise ValueError(f"{env_var} environment variable is required")
    return api_key


def get_task_model(model_id: str | None = None) -> LitellmModel:
    """Create model for the main Todo Assistant agent.

    Args:
        model_id: Frontend model ID (e.g., "gemini-2.5-flash", "groq-llama-3.3-70b").
                  If None or invalid, uses default Gemini model.

    Returns:
        LitellmModel configured for the specified provider.
    """
    # Use default if not specified or invalid
    if not model_id or model_id not in TASK_MODELS:
        model_id = DEFAULT_TASK_MODEL
        print(f"[MODELS] Using default task model: {model_id}")
    else:
        print(f"[MODELS] Using selected task model: {model_id}")

    model_str, api_key_env = TASK_MODELS[model_id]
    return LitellmModel(
        model=model_str,
        api_key=_get_api_key(api_key_env),
    )


def get_title_model(model_id: str | None = None) -> LitellmModel:
    """Create model for the TitleGenerator agent.

    Uses a lighter/faster model since title generation is simple.

    Args:
        model_id: Frontend model ID. If None or invalid, uses default.

    Returns:
        LitellmModel configured for title generation.
    """
    # Use default if not specified or invalid
    if not model_id or model_id not in TITLE_MODELS:
        model_id = DEFAULT_TITLE_MODEL

    model_str, api_key_env = TITLE_MODELS[model_id]
    return LitellmModel(
        model=model_str,
        api_key=_get_api_key(api_key_env),
    )


# Legacy aliases for backward compatibility
def create_task_model() -> LitellmModel:
    """Legacy: Create default task model."""
    return get_task_model(DEFAULT_TASK_MODEL)


def create_title_model() -> LitellmModel:
    """Legacy: Create default title model."""
    return get_title_model(DEFAULT_TITLE_MODEL)


__all__ = [
    "TASK_MODELS",
    "TITLE_MODELS",
    "DEFAULT_TASK_MODEL",
    "DEFAULT_TITLE_MODEL",
    "get_task_model",
    "get_title_model",
    "create_task_model",
    "create_title_model",
]
