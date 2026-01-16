# Data Model: Project Foundation Setup (Module 1)

**Branch**: `002-project-foundation` | **Date**: 2026-01-08

## Overview

Module 1 focuses on project foundation and does not introduce data models. Data models for the Task entity will be defined in Module 2 (Database & Models).

## Key Entities (Configuration)

This module defines configuration structures rather than database entities:

### 1. Environment Configuration

| File | Purpose | Location |
|------|---------|----------|
| `.env` / `.env.local` | Runtime configuration | `frontend/`, `backend/` |
| `.env.example` | Template for developers | `frontend/`, `backend/` |

### 2. Docker Configuration

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Service orchestration |
| `frontend/Dockerfile` | Frontend container image |
| `backend/Dockerfile` | Backend container image |

### 3. Linting Configuration

| File | Purpose | Location |
|------|---------|----------|
| `biome.json` | Biome linting/formatting | `frontend/` |
| `pyproject.toml` | Ruff configuration | `backend/` |

### 4. Context Files

| File | Purpose | Locations |
|------|---------|-----------|
| `CLAUDE.md` | Claude AI context | Root, `frontend/`, `backend/` |
| `GEMINI.md` | Gemini AI context | Root, `frontend/`, `backend/` |

## State Transitions

N/A - No stateful entities in this module.

## Validation Rules

N/A - Configuration validation is handled by each tool (Docker, Biome, Ruff).

---

## Next Module (M2: Database & Models)

Module 2 will define:
- **Task**: id, user_id, title, description, completed, created_at, updated_at
- **User Reference**: Managed by Better Auth
