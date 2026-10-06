---
name: convention-review
description: Review the current changes against this repository's rules (tenant scoping, RBAC, layer boundaries, UI package boundaries) in a separate context, using the convention-reviewer agent. Use before committing or opening a PR, or when asked to review a change, a branch, or specific files for convention violations.
argument-hint: "[branch | commit range | files]"
context: fork
agent: convention-reviewer
---

Review this target: $ARGUMENTS

If no target is given above, review the uncommitted changes (`git diff HEAD` plus new files from `git status --short`).

Follow your procedure and output format exactly. Report findings only; do not edit files.
