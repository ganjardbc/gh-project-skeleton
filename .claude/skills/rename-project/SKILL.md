---
name: rename-project
description: Rename the skeleton to a new project name across package names, workspace filters, Docker services, the database name, docs, and the Claude Code hooks and skills. Use right after cloning this repository to start a new project, or when asked to rename, rebrand, or change the gh-skeleton name.
argument-hint: "<kebab-case-name> [display title]"
---

# Rename the project

The name `gh-skeleton` appears in more than a hundred tracked files: workspace package names (`gh-skeleton-api`, `@gh-skeleton/ui`), `--filter` arguments in CI and in `.claude/hooks`, Docker service and database names, and the docs. `scripts/rename-project.mjs` replaces all of them in one pass. Do not rename by hand.

## Steps

1. **Agree on the name.** A kebab-case name (`acme-pos`) and a display title (`Acme POS`). The script derives the rest:

   | Old | New |
   |---|---|
   | `gh-skeleton`, `gh-project-skeleton` | `acme-pos` |
   | `@gh-skeleton/ui`, `gh-skeleton-api`, `gh-skeleton-app` | `@acme-pos/ui`, `acme-pos-api`, `acme-pos-app` |
   | `gh_skeleton`, `db_gh_skeleton`, `db_project_skeleton` | `acme_pos`, `db_acme_pos` |
   | `GH Skeleton`, `GH Project Skeleton` | `Acme POS` |

2. **Start clean.** `git status` must show no uncommitted changes, so the rename is one reviewable diff.

3. **Preview, then run.**

   ```bash
   node scripts/rename-project.mjs acme-pos --title "Acme POS" --dry-run
   node scripts/rename-project.mjs acme-pos --title "Acme POS"
   ```

4. **Reinstall.** `pnpm install` rewrites `pnpm-lock.yaml` and relinks the renamed workspaces.

5. **Fix what the script cannot know.**
   - `apps/*/.env` are not tracked, so they keep the old database name. Ask the user to update `DATABASE_URL`, or to create the new database.
   - `LICENSE` keeps the original copyright holder. Ask the user whether to change it.
   - `README.md`: the description and the seeded demo data still describe the skeleton.
   - The Git remote still points at the skeleton repository: `git remote -v`.
   - `GhUiResolver` in `packages/ui` keeps its name on purpose. It is an internal identifier.

6. **Remove the tool.** After a successful rename, delete `scripts/rename-project.mjs` and this skill: their search patterns no longer match anything.

## Verify

```bash
pnpm --filter <name>-api typecheck && pnpm --filter <name>-api test
pnpm --filter <name>-app typecheck
pnpm --filter @<name>/landing typecheck
git grep -il "gh-skeleton\|gh_skeleton\|gh skeleton" -- . ':!pnpm-lock.yaml' ':!scripts/rename-project.mjs' ':!.claude/skills/rename-project'
```

The last command must print nothing.
