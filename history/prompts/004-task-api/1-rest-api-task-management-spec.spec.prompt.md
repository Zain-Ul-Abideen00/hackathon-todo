---
id: 1
title: REST API Task Management Specification
stage: spec
date: 2026-01-08
surface: agent
model: Claude
feature: 004-task-api
branch: 004-task-api
user: Zain-Ul-Abideen
command: /sp-specify
labels: [task-api, rest-api, crud, module-3]
links:
  spec: specs/004-task-api/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-task-api/spec.md
  - specs/004-task-api/checklists/requirements.md
tests:
  - null
---

## Prompt

Feature: REST API for Task Management (Module 3)

User Stories:
1. As a user, I can create a new task via API.
2. As a user, I can view all my tasks with filtering.
3. As a user, I can update/delete my tasks.
4. As a user, I can toggle task completion.

API Endpoints:

1. GET /api/{user_id}/tasks
   - Query params: status (all|pending|completed), sort (created|title)
   - Returns: Array of Task objects
   - Auth: JWT required (validate user_id matches token)

2. POST /api/{user_id}/tasks
   - Body: { title: str, description?: str }
   - Returns: Created Task object (201)
   - Auth: JWT required

3. GET /api/{user_id}/tasks/{task_id}
   - Returns: Single Task object
   - Error: 404 if not found or wrong user
   - Auth: JWT required

4. PUT /api/{user_id}/tasks/{task_id}
   - Body: { title?: str, description?: str, completed?: bool }
   - Returns: Updated Task object
   - Auth: JWT required

5. DELETE /api/{user_id}/tasks/{task_id}
   - Returns: { message: "deleted", task_id: int }
   - Auth: JWT required

6. PATCH /api/{user_id}/tasks/{task_id}/complete
   - Toggles completion status
   - Returns: Updated Task object
   - Auth: JWT required

Validation Rules:
- title: 1-200 characters, required for create
- description: max 1000 characters, optional
- user_id in URL must match JWT user_id

Error Responses:
- 400: Validation error (Pydantic)
- 401: Unauthorized (missing/invalid JWT)
- 403: Forbidden (user_id mismatch)
- 404: Task not found
- 500: Server error

Acceptance Criteria:
- All endpoints respond correctly
- OpenAPI docs available at /docs
- Pydantic validation on all inputs
- Proper HTTP status codes
- Tests pass for all endpoints

## Response snapshot

Created comprehensive feature specification for REST API Task Management (Module 3):

**Branch**: `004-task-api`

**Specification Content**:
- 6 User Stories (P1-P3 priority) covering CRUD operations and toggle completion
- 13 Functional Requirements (FR-001 to FR-013)
- Edge cases for validation, authorization, and filtering
- 7 Measurable Success Criteria
- Assumptions documenting dependencies on Module 2 (Database) and Module 4 (Auth)

**Validation**:
- All 16 specification quality checklist items passed
- No [NEEDS CLARIFICATION] markers - all requirements are explicit

## Outcome

- ✅ Impact: Created complete API specification ready for planning phase
- 🧪 Tests: N/A - specification phase
- 📁 Files: Created spec.md and checklists/requirements.md
- 🔁 Next prompts: /sp.plan to create implementation plan
- 🧠 Reflection: User provided extremely detailed API requirements, minimal clarification needed

## Evaluation notes (flywheel)

- Failure modes observed: None - clear requirements from user
- Graders run and results (PASS/FAIL): PASS - all 16 checklist items validated
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider adding rate limiting requirements for API security
