# Monorepo Runbook Commands

Run these from the repo root.

## Install dependencies

```bash
pnpm install
```

## Build every workspace

```bash
pnpm build
```

## Run the apps

```bash
pnpm dev                                  # all apps in parallel
pnpm --filter gh-skeleton-app dev         # admin (apps/admin)
pnpm --filter gh-skeleton-api dev         # API (apps/api)
pnpm --filter @gh-skeleton/landing dev    # landing (apps/landing)
```

## Check a change

```bash
pnpm lint
pnpm typecheck
pnpm --filter gh-skeleton-api test
```

## Selective CI rules (path-based)

The CI workflow (`.github/workflows/ci.yml`) uses a path filter to decide which jobs run.

### Impact matrix

- `apps/api/**` → runs **api** (build shared-types, then lint, test, and build the API).
- `apps/admin/**`, `apps/landing/**`, `packages/ui/**`, `packages/eslint-config/**`, `eslint.config.mjs` → runs **frontend** (build shared-types, then lint and typecheck the admin app, the landing site, and the UI package).
- `packages/shared-types/**` → runs **api** and **frontend**.
- `pnpm-lock.yaml`, `pnpm-workspace.yaml`, root `package.json`, `.github/workflows/**` → runs **api** and **frontend**.

### Jobs

- `prepare`: detects the changed paths and exposes outputs that gate the later jobs.
- `api`: runs only when the backend is affected (directly, through shared-types, or by a root change).
- `frontend`: runs only when a frontend workspace is affected (directly, through shared-types, or by a root change).
- `summary`: always runs and writes what ran, what was skipped, and why to `GITHUB_STEP_SUMMARY`.

### Quick check for a pull request

1. Change a file in `apps/api/**` → only `api` and `summary` run.
2. Change a file in `apps/admin/**`, `apps/landing/**`, or `packages/ui/**` → only `frontend` and `summary` run.
3. Change a file in `packages/shared-types/**` → `api` and `frontend` run.
4. Change the lockfile, a workflow, or the root `package.json` → `api` and `frontend` run.
