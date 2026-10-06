# GH Project Skeleton

A multi-tenant SaaS starter: authentication, merchants (tenants), users, flat RBAC, file uploads, notifications, and settings. It ships no business domain (no products, orders, or stock); add those as new modules on top of it.

It is a **pnpm + Turbo** monorepo with three apps and a set of shared packages.

## Structure

```
gh-project-skeleton/
├── apps/
│   ├── admin/          # Dashboard — Vue 3, Vite, PrimeVue 4, Tailwind 4, Pinia
│   ├── api/            # Backend — NestJS 11, Prisma 7, MySQL
│   └── landing/        # Marketing site — Nuxt 4, statically generated, id/en
├── packages/
│   ├── ui/             # @gh-skeleton/ui — design tokens and shared Vue components
│   ├── shared-types/   # @gh-skeleton/shared-types — API contract types
│   ├── shared-utils/   # @gh-skeleton/shared-utils — placeholder, empty
│   └── eslint-config/  # @gh-skeleton/eslint-config — ESLint base for the Vue workspaces
├── docs/               # Architecture, API, backend, database, frontend, runbooks
├── DESIGN.md           # Visual rules and component catalog
└── docker-compose.yml  # MySQL + API containers (deployment)
```

| Workspace | Package name | Dev URL |
|---|---|---|
| `apps/admin` | `gh-skeleton-app` | http://localhost:5173 |
| `apps/api` | `gh-skeleton-api` | http://localhost:3000/api/v1 |
| `apps/landing` | `@gh-skeleton/landing` | http://localhost:5174 |

## Requirements

- Node.js 22.19 or newer
- pnpm 9 (the repo pins `pnpm@9.15.9`)
- MySQL 8

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Create the environment files
cp apps/api/.env.example apps/api/.env
cp apps/admin/.env.sample apps/admin/.env
cp apps/landing/.env.sample apps/landing/.env

# 3. Create the database schema and load the seed data
pnpm db:migrate
pnpm db:seed

# 4. Start all three apps
pnpm dev
```

Before step 3, edit `apps/api/.env`: point `DATABASE_URL` at an existing MySQL database, set `JWT_SECRET`, and set `STORAGE_DRIVER=local` unless you have S3 credentials.

### Seeded accounts

All three use the password `password123`.

| Email | Role | Merchant |
|---|---|---|
| `admin@demo.com` | `admin` | System Admin |
| `owner@demo.com` | `owner` | Demo Company |
| `viewer@demo.com` | `viewer` | Demo Company |

The seed also creates the permission codes, the role assignments, and 12 sample notifications per account. It is safe to run again: existing rows are kept. It does reset the permissions of the three seeded roles to the definitions in `apps/api/prisma/seed.ts`.

## Environment

**API** — `apps/api/.env` (template: `.env.example`, which lists every variable)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `PORT` | HTTP port. `3000` in the template; `3030` when unset |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Token signing key and lifetime |
| `CORS_ORIGIN` | Comma-separated allowed origins |
| `STORAGE_DRIVER` | `local` or `s3` |
| `APP_URL` | Public origin of the API, the base of local upload URLs. Not in the template; falls back to `http://localhost:3030` |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` | Required when `STORAGE_DRIVER=s3` |

**Admin** — `apps/admin/.env` (template: `.env.sample`)

| Variable | Purpose |
|---|---|
| `VITE_APP_VERSION` | App version label. Not read by the code yet |
| `VITE_API_BASE_URL` | API origin, for example `http://localhost:3000` |

**Landing** — `apps/landing/.env` (template: `.env.sample`). Values are read at build time.

| Variable | Purpose |
|---|---|
| `NUXT_PUBLIC_WEB_BASE_URL` | Admin app URL, used by the login and register links |
| `NUXT_PUBLIC_API_BASE_URL` | API origin, used by the registration form |
| `NUXT_PUBLIC_SITE_URL` | Public URL of the site, used for canonical and hreflang links |

## Commands

Run from the repository root.

```bash
pnpm dev          # Start every app in watch mode
pnpm build        # Build every workspace, in dependency order
pnpm typecheck    # Type-check every workspace
pnpm lint         # Lint every workspace
pnpm test         # Test (only the API defines a test script)
pnpm format       # Format (only the API defines a format script)

pnpm db:migrate   # prisma migrate dev
pnpm db:seed      # prisma db seed
pnpm db:studio    # prisma studio
pnpm db:generate  # prisma generate
```

Target one workspace with `--filter`:

```bash
pnpm --filter gh-skeleton-app <script>
pnpm --filter gh-skeleton-api <script>
pnpm --filter @gh-skeleton/landing <script>
pnpm --filter @gh-skeleton/shared-types build
```

`@gh-skeleton/shared-types` must be built before the apps. `pnpm build` and `pnpm dev` through Turbo handle that; when running a single app with `--filter` for the first time, build it yourself.

Scaffold a new admin module (the Hygen templates live in `apps/admin/_templates`):

```bash
pnpm --filter gh-skeleton-app new-module
```

## What is included

**API** (`/api/v1`, Swagger UI at `/docs`)

- `auth` — login, registration, JWT
- `merchants` — tenants
- `users`
- `rbac` — roles and permissions
- `uploads` — local disk or S3
- `notifications`
- `settings`

Every successful response is wrapped as `{ success, data }`. Paginated lists return `{ data, meta }` inside it, with `meta` holding `total`, `page`, `limit`, and `totalPages`.

**Admin** modules: `auth`, `dashboard`, `landing`, `merchants`, `user`, `role`, `permission`, `profile`, `settings`, `notification`, `error`. Routes and sidebar entries are collected from each module automatically; there is no central registry to edit.

**Landing** pages: home, about, FAQ, and terms, in Indonesian (default) and English.

## Core concepts

- **Multi-tenancy.** The tenant is the merchant, and every user belongs to exactly one. Every tenant-owned query in the API is scoped by the authenticated user's `merchant_id`, never by client input. `email` and `username` are unique per merchant.
- **RBAC.** Permissions are codes in `<resource>.<action>` form, such as `user.create`. Roles and permissions are global. The API checks them on every request with `@RequirePermission('code')`; the admin app checks them only to hide or disable UI. A new code must be added to `apps/api/prisma/seed.ts` or through the RBAC API before a role can use it.
- **Design system.** `@gh-skeleton/ui` holds the tokens and `Ui*` components used by both frontends. It has no build step. Dark mode is a `.dark` class on `<html>`.

## Deployment

- Each app has its own `Dockerfile`.
- `docker-compose.yml` runs MySQL and the API on a shared Docker network without publishing host ports; it expects a reverse proxy in front. Replace the credentials, `JWT_SECRET`, and `CORS_ORIGIN` in it before use.
- `.github/workflows/ci.yml` lints, tests, and builds the API when `apps/api`, `packages/shared-types`, or root config changes. A second job lints and type-checks `apps/admin`, `apps/landing`, and `packages/ui` when they change.

## Documentation

- [`DESIGN.md`](DESIGN.md) — visual rules, component catalog, form and page patterns
- [`docs/architecture`](docs/architecture) — monorepo structure, tech stack, shared types
- [`docs/api`](docs/api) — API conventions
- [`docs/backend`](docs/backend) — architecture, project context, domain rules
- [`docs/database`](docs/database) — database configuration and notes
- [`docs/frontend`](docs/frontend) — spec summary and user flows
- [`docs/runbooks`](docs/runbooks) — environment and command guides
- `CLAUDE.md` in the root, each app, and `packages/ui` — conventions for working in that part of the codebase
