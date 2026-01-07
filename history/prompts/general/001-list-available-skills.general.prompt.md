---
id: 001
title: List available skills
stage: general
date: 2026-01-06
surface: Claude Code
model: claude-opus-4-5-20251101
feature: none
branch: main
user: Zain Ul Abideen <zain.dev00@gmail.com>
command: user-prompt
labels: [claude-code, skills, cli]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - none
tests:
 - none
---

## Prompt

what skills are available?

## Response snapshot

Explained how to discover available Skills in Claude Code, including that Skills come from `.claude/skills/` (project), `~/.claude/skills/` (personal), and other sources. Recommended inspecting those directories and asking Claude to enumerate loaded skills.

## Outcome

- ✅ Impact: User can find which Skills are available in this environment and where they are defined.
- 🧪 Tests: none
- 📁 Files: none
- 🔁 Next prompts: Ask for a specific skill’s usage, or share the output of `ls .claude/skills` for a precise list.
- 🧠 Reflection: Skill availability is configuration-dependent; local directories provide the authoritative list.

## Evaluation notes (flywheel)

- Failure modes observed: PHR creation script referenced by command docs was missing at `.specify/scripts/bash/create-phr.sh`, so manual template filling was required.
- Graders run and results (PASS/FAIL): not run
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Verify the correct PHR script location in this repo (if any) and align routing with existing `.specify/history/prompts/` convention.
