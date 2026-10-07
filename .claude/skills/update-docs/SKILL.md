---
name: update-docs
description: Bring the documentation back in line with the code after a change, covering the CLAUDE.md files, README files, docs/, DESIGN.md, and the Postman collection. Use when asked to document a feature, update or write docs, when a change adds an endpoint, table, permission, environment variable, component, or command, or when a doc is found to disagree with the code.
---

# Update the docs

The code is the source of truth, then the `CLAUDE.md` files, then everything under `docs/`. When two of them disagree, fix the lower one. Never change code to match a doc.

`CLAUDE.md` files are what Claude reads on every task, so a stale line there produces wrong code. Update them in the same change as the code, not later.

## What to update

Find the rows that match the change. Update each listed file, or confirm it needs nothing.

| The change | Files |
|---|---|
| New or changed endpoint | Swagger decorators on the controller and DTOs; `apps/api/GH-Skeleton.postman_collection.json`; `apps/api/README.md` if it lists the module |
| New API module | `apps/api/CLAUDE.md` (module list, any new pattern); root `CLAUDE.md` "What This Is" and Data Model; `docs/backend/architecture.md` |
| New table or column | `docs/database/db-notes.md` (Tables, Uniqueness, Indexes, Delete behavior, Audit fields); root `CLAUDE.md` Data Model |
| New business rule | `apps/api/CLAUDE.md` Domain Rules; `docs/backend/domain-rules.md` |
| New permission code | Nothing in docs: the seed is the list. Root `CLAUDE.md` RBAC only if a role is added or the model changes |
| New environment variable | The app's `.env.example` or `.env.sample`; root `CLAUDE.md` Environment Setup; `docs/runbooks/api-env-guide.md`; `README.md` Environment |
| New admin module | `apps/admin/CLAUDE.md` "Current modules"; `docs/frontend/user-flows.md` if it adds a user flow |
| New or changed `Ui*` component, token, or page pattern | `DESIGN.md` (catalog in section 8, patterns in section 9) |
| New landing page | `apps/landing/CLAUDE.md` "Pages and URLs" table |
| New shared type | Root `CLAUDE.md` Shared Packages list |
| New root script, CI job, hook, skill, or agent | Root `CLAUDE.md` (Monorepo Commands, Claude Code Setup); `docs/runbooks/monorepo-commands.md`; `README.md` Commands |
| New gotcha found while working | The Gotchas section of that app's `CLAUDE.md` |

## Rules

- **State what is true now.** No history ("previously", "we changed"), no plans ("will support"). Git holds the history.
- **Verify every claim against the code before writing it:** a path exists, a command runs, a default has that value. Do not copy a claim from another doc.
- **One home per fact.** Put it in the most specific file and link to it from elsewhere. A fact written twice goes stale in one of the places.
- **`CLAUDE.md` holds rules and non-obvious facts,** not a description of what the code plainly shows. Keep each file short enough to read in full.
- **Match the file you are editing:** its language (English), heading style, and table shapes.
- **Remove what is no longer true.** A deleted feature leaves no doc behind.

## Postman collection

`apps/api/GH-Skeleton.postman_collection.json` is maintained by hand. For a new endpoint, copy a neighbouring request in the same folder and change the method, path, body, and description. Keep the `{{base_url}}` and `{{token}}` variables; never paste a real token or password.

## Verify

- Every path and command you wrote exists: open the file, run the command.
- `git diff --stat` shows the doc files next to the code they describe.
- Search for the old name or value across the docs to catch the copies you missed:

  ```bash
  git grep -n "<old name or value>" -- '*.md'
  ```
