---
id: 006
title: Phase 5 Cloud Deployment Constitution
stage: constitution
date: 2026-02-02
surface: agent
model: gemini-2.5-flash
feature: phase5-advanced-cloud
branch: main
user: Zain-Ul-Abideen00
command: /sp.constitution
labels: [phase5, cloud, dapr, kafka, oke, ci-cd]
links:
  spec: learning/02-The Evolution of Todo/phase5_spec_guide.md
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution update)
---

## Prompt

Update the constitution for Phase 5: Advanced Features & Cloud Deployment.

## Project Overview
Enhance the Phase 4 Todo Chatbot with:
- Part A: Advanced task features (recurring, reminders, tags, search)
- Part B: Dapr building blocks for cloud-native patterns
- Part C: Cloud Kubernetes deployment with CI/CD

## Project Structure Extensions
Location: `todo-web-app/` directory (existing Phase 4 structure)

New directories to create:
- `todo-web-app/k8s/cloud/` - Cloud K8s configurations
- `todo-web-app/dapr/` - Dapr component definitions (at app root)
- `todo-web-app/notification-service/` - Kafka consumer service
- `hackathon-todo/.github/workflows/` - CI/CD pipelines (at repo root)

## Response snapshot

Updated constitution from v4.0.0 to v5.0.0 with:

1. **New Principles (XXI-XXIV)**:
   - XXI. Event-Driven Architecture (Kafka pub/sub patterns)
   - XXII. Dapr Building Blocks (Sidecar patterns)
   - XXIII. CI/CD Pipeline (GitHub Actions)
   - XXIV. Cloud Deployment (Oracle OKE)

2. **Updated Sections**:
   - Agentic Development (XII): Added Phase 5 agents and skills
   - Tooling & Environment (XI): Added Dapr CLI, OCI CLI
   - Infrastructure/Deployment: Added cloud stack (OKE, Kafka, Dapr)
   - Project Structure: Added cloud/, dapr/, notification-service/, .github/
   - Deliverables: Added Phase 5 checklist

## Outcome

- ✅ Impact: Constitution extended for Phase 5 cloud-native patterns
- 🧪 Tests: N/A (documentation)
- 📁 Files: constitution.md (v4.0.0 → v5.0.0)
- 🔁 Next prompts: /sp.specify for Module 1 (Advanced Features)
- 🧠 Reflection: Aligned directory structure with Project_Structure_Guide.md

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
