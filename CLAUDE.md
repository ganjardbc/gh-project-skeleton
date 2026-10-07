# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> For app-specific details, read the nested CLAUDE.md files first:
> - `apps/admin/CLAUDE.md` — Vue 3 frontend patterns, auth helpers, module conventions
> - `apps/api/CLAUDE.md` — NestJS backend layers, domain rules, API conventions
> - `apps/landing/CLAUDE.md` — Nuxt landing site rules (static generation, i18n, no PrimeVue)
> - `packages/ui/CLAUDE.md` — shared component and token rules
>
> If anything under `docs/` disagrees with the code or with a CLAUDE.md file, the code and CLAUDE.md are right.

## What This Is

A **multi-tenant SaaS skeleton**: auth, merchants (tenants), users, flat RBAC, file uploads, notifications, and settings. It is the starting point for business apps — there are no domain modules (no outlets, products, transactions, or stock) in the codebase yet. Add them as new modules following the conventions below.

## Monorepo Commands

This is a **pnpm + Turbo** monorepo. Run from the repo root:

```bash
pnpm dev           # Start all dev servers in parallel (web + api + landing)
pnpm build         # Build all workspaces (respects dependency order)
pnpm test          # Run all tests
pnpm lint          # Lint all workspaces
pnpm typecheck     # TypeScript check across all workspaces

pnpm db:migrate    # prisma migrate dev   (proxies to gh-skeleton-api)
pnpm db:seed       # prisma db seed
pnpm db:studio     # prisma studio
pnpm db:generate   # prisma generate
```

Target a single workspace:

```bash
pnpm --filter gh-skeleton-app <script>        # Frontend (apps/admin)
pnpm --filter gh-skeleton-api <script>        # Backend (apps/api)
pnpm --filter @gh-skeleton/landing <script>   # Landing (apps/landing)
pnpm --filter @gh-skeleton/shared-types build
```

`pnpm lint` covers every workspace: `apps/api` uses `apps/api/eslint.config.mjs` (with `--fix`), and `apps/admin`, `apps/landing`, and `packages/ui` use the root `eslint.config.mjs`, which builds on `packages/eslint-config/vue.mjs` and holds the import boundaries between the packages. `pnpm test` reaches `apps/api` (Jest), `apps/admin`, and `packages/ui` (both Vitest); `apps/landing` has no tests. `pnpm format` only reaches `apps/api`.

Scaffold a frontend module from `apps/admin` (the Hygen templates live in `apps/admin/_templates`):

```bash
pnpm --filter gh-skeleton-app new-module
```

## Claude Code Setup

`.claude/` is checked in:

- `settings.json` — hooks that feed their errors back to Claude, plus a `deny` list for force pushes and Prisma resets:
  - `PreToolUse`: `hooks/protect-files.mjs` refuses edits to `.env` files and to committed migrations; `hooks/guard-git.mjs` refuses force pushes (`--force-with-lease` is allowed).
  - `PostToolUse`: `hooks/lint-file.mjs` lints each edited file.
  - `Stop`: `hooks/typecheck-changed.mjs` typechecks the workspaces with uncommitted changes; `hooks/test-changed.mjs` runs the tests related to changed `apps/api` (Jest), `apps/admin`, and `packages/ui` (Vitest) files; `hooks/check-permissions.mjs` fails on a permission code that the API or the admin app uses but the seed lacks.
- `skills/` — `new-api-module`, `new-admin-module`, `new-landing-page`, `new-ui-component`, `add-permission`, `add-shared-type`, `db-migration`, `write-api-tests`, `update-docs`, `rename-project`. Use them for those tasks.
- `.githooks/` (outside `.claude/`) holds the Git hooks for commits made by hand: `pre-commit` lints the staged files and checks permission codes, `pre-push` typechecks and tests the changed workspaces. `pnpm install` enables them through the root `prepare` script.
- `agents/convention-reviewer.md` — reviews a diff against the rules in the CLAUDE.md files. Run it with `/convention-review [branch | range | files]`, which starts the agent in its own context.

## Workflow

Every change goes through plan, implement, verify.

- **Plan.** For a new feature, a schema change, or a change that spans workspaces, write the plan and wait for approval before editing. A clear single-file change needs no plan.
- **Implement.** Use the matching skill. Copy the reference implementation named in the app's CLAUDE.md rather than inventing a new shape. Leave files outside the task alone.
- **Bug fix.** Reproduce the bug with a failing test first, then fix it: always in `apps/api` and `packages/ui`, and in `apps/admin` when the bug is in a helper, store, or service. The test stays as the regression test.
- **Verify.** Run lint, typecheck, and (everywhere but `apps/landing`) test in each workspace you touched, always as `pnpm --filter <workspace> <script>`. Do not run `pnpm lint` at the root: the `apps/api` lint script uses `--fix` and rewrites files the task did not touch.
- **Stop after three tries.** If verification fails three times on the same problem, stop and report what you tried and the last error. Never skip a test, loosen an assertion, or disable a lint rule to get a pass.
- **Document.** When a change adds an endpoint, table, environment variable, component, or command, update the docs in the same change (`update-docs` skill).
- **Review.** Before committing a change that touches tenant data, permissions, or `packages/`, run `/convention-review`.

## Architecture Overview

```
gh-project-skeleton/
├── apps/admin/        # Vue 3 + Vite + PrimeVue dashboard
├── apps/api/          # NestJS + Prisma + MySQL backend
├── apps/landing/      # Nuxt 4 marketing site (static, id/en)
├── packages/
│   ├── shared-types/  # @gh-skeleton/shared-types — API contract types
│   ├── shared-utils/  # @gh-skeleton/shared-utils (currently empty)
│   ├── ui/            # @gh-skeleton/ui — design tokens + shared Vue components
│   └── eslint-config/ # Shared ESLint config
├── docs/              # Architecture, API, backend, database, frontend docs + runbooks
├── DESIGN.md          # Visual rules and component catalog
└── docker-compose.yml # MySQL + API containers
```

**`shared-types` must be built before apps.** Turbo handles this via `"dependsOn": ["^build"]`.

## Multi-Tenancy

The tenant boundary is the **merchant**. Every user belongs to exactly one merchant (`users.merchant_id`).

- Every tenant-owned query in the API must scope by `merchant_id`, taken from the authenticated user (`@CurrentUser('merchant_id')`) — never from client input.
- `username` is unique **per merchant**. `email` is unique **across all merchants**, because login identifies an account by email alone.

### Data Model

```
merchants
  └── users                (merchant_id)
        ├── user_roles ──── roles ── role_permissions ── permissions
        └── notifications
  └── uploads              (merchant_id; referenced by merchants.logo_upload_id, users.avatar_upload_id)
```

Conventions: UUID `CHAR(36)` primary keys, snake_case tables and columns, Prisma models named after the tables (DB-first).

## Auth Flow (End-to-End)

1. Frontend POSTs to `POST /api/v1/auth/login`
2. API returns `{ access_token, token_type, user: { ..., merchant }, rbac: [{ role: { ..., permissions } }] }`
3. Frontend `setAuth()` stores it in localStorage under: `APP_TOKEN`, `APP_BEARER`, `APP_USER`, `APP_MERCHANT`, `APP_ROLES`, `APP_ACTIVE_ROLE`, `APP_ACTIVE_PERMISSIONS`, `APP_IS_LOGIN`
4. Axios interceptor attaches `Authorization: Bearer <token>` to all requests
5. On 401, the interceptor shows a confirm dialog, then calls `removeAuth()` and redirects to login
6. Route guards check `meta.permission[]` against `isHasPermission()` before navigation

## RBAC

Permissions are **codes** in `<resource>.<action>` form (e.g. `user.create`), not role names. The model is **flat**: roles and permissions are global tables, and `user_roles` links a user to a role with no outlet or merchant scope.

- Server: `PermissionGuard` + `@RequirePermission('code')`, resolved from the database on each request across all of the user's roles.
- Client: `isHasPermission(code)`, which reads only the **first** role's permissions from localStorage.

Seeded roles: `admin`, `owner`, `viewer`. New registrations get `owner`. Permission codes are seeded in `apps/api/prisma/seed.ts`; a new code must be added there (or via the RBAC API) before any role can use it.

## Shared Packages

`@gh-skeleton/ui` holds the design tokens and shared `Ui*` Vue components used by `apps/admin` and `apps/landing`. It is source-only (no build step). Read `DESIGN.md` before adding or changing UI; import core components from `@gh-skeleton/ui` and PrimeVue-based ones from `@gh-skeleton/ui/prime`.

`@gh-skeleton/shared-types` exports:
- `common/pagination.ts` — `ApiResponse<T>`, `PaginationMeta`
- `auth/auth.types.ts` — `AuthUser`, `AuthMerchant`
- `users/user.types.ts` — `UserSummary`
- `ServiceHealth`, `HealthStatus`

Import in either app as `@gh-skeleton/shared-types`. Rebuild after changing types (`pnpm --filter @gh-skeleton/shared-types build`). See `docs/architecture/shared-types-guidelines.md`.

## Environment Setup

**Frontend** (`apps/admin/.env`, template `.env.sample`):
```env
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:3000
```

**Backend** (`apps/api/.env`, see `.env.example` for the full list):
```env
DATABASE_URL=mysql://user:pass@localhost:3306/db_gh_skeleton
JWT_SECRET=your-secret
JWT_EXPIRES_IN=7d
PORT=3000
CORS_ORIGIN=http://localhost:5173
STORAGE_DRIVER=local
```

`PORT` falls back to **3030** when unset. With `STORAGE_DRIVER=local`, set `APP_URL` to the API's public origin: it is the base of every upload URL and also falls back to `http://localhost:3030`. S3 uploads need `STORAGE_DRIVER=s3` plus `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`.

**Landing** (`apps/landing/.env`, template `.env.sample`): `NUXT_PUBLIC_WEB_BASE_URL`, `NUXT_PUBLIC_API_BASE_URL`, `NUXT_PUBLIC_SITE_URL`. Read at build time.
