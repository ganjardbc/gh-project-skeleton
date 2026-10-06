# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> For app-specific details, read the nested CLAUDE.md files first:
> - `apps/admin/CLAUDE.md` — Vue 3 frontend patterns, auth helpers, module conventions
> - `apps/api/CLAUDE.md` — NestJS backend layers, domain rules, API conventions
> - `apps/landing/CLAUDE.md` — Nuxt landing site rules (static generation, i18n, no PrimeVue)
> - `packages/ui/CLAUDE.md` — shared component and token rules

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

`docs/runbooks/monorepo-commands.md` mentions `pnpm dev:web` / `pnpm dev:api`; these are not defined in the root `package.json`. Use the `--filter` form.

`pnpm lint`, `pnpm test`, and `pnpm format` only reach `apps/api`; the frontends define none of those scripts.

Scaffold a frontend module from `apps/admin` (the Hygen templates live in `apps/admin/_templates`):

```bash
pnpm --filter gh-skeleton-app new-module
```

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
- `email` and `username` are unique **per merchant**, not globally.

### Data Model

```
merchants
  └── users                (merchant_id)
        ├── user_roles ──── roles ── role_permissions ── permissions
        └── notifications
uploads                    (referenced by merchants.logo_upload_id, users.avatar_upload_id)
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
