# GH Skeleton API

Backend for the GH Skeleton, a multi-tenant SaaS starting point: auth, merchants (tenants), users, flat RBAC, file uploads, notifications, and settings. NestJS 11, Prisma 7 (MariaDB driver adapter), MySQL.

There is no business domain here yet. Add one as a new module; `src/users` is the reference to copy.

## Setup

```bash
pnpm install                 # from the repo root
cp apps/api/.env.example apps/api/.env
pnpm db:migrate              # prisma migrate dev
pnpm db:seed                 # roles, permissions, demo merchant and users
pnpm --filter gh-skeleton-api dev
```

The API listens on `PORT` (3030 when unset) under the prefix `/api/v1`. Swagger UI is at `/docs`.

Set `JWT_SECRET` and, with `STORAGE_DRIVER=local`, set `APP_URL` to the API's public origin. `docs/runbooks/api-env-guide.md` lists every variable.

## Commands

Run from `apps/api`, or from the root with `pnpm --filter gh-skeleton-api <script>`.

| Command | Purpose |
|---|---|
| `pnpm dev` | Dev server with reload |
| `pnpm build` / `pnpm start:prod` | Build, then run `dist/src/main.js` |
| `pnpm lint` | ESLint with `--fix` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` / `pnpm test:e2e` | Jest unit and e2e tests |
| `pnpm db:migrate` / `db:seed` / `db:generate` / `db:studio` | Prisma |

## Structure

```
src/
├── auth/           # Login, register, profile; JWT strategy
├── merchants/      # Merchant (tenant) CRUD + logo
├── users/          # User CRUD + avatar, merchant-scoped
├── rbac/           # Roles, permissions, assignments
├── settings/       # Profile, password, email, account
├── uploads/        # Local and S3 storage drivers
├── notifications/  # Per-user notifications
├── database/       # PrismaService
└── common/         # Decorators, guards, pipes, interceptors, filters, DTOs
prisma/
├── schema.prisma
├── migrations/
└── seed.ts
```

## Rules

- **Tenancy.** The tenant is the merchant. Every query on a tenant-owned table filters by `merchant_id`, taken from `@CurrentUser('merchant_id')`, never from client input.
- **Auth.** `JwtAuthGuard` is global; mark anonymous routes with `@Public()`.
- **Permissions.** Flat RBAC by code (`user.create`). Add `@UseGuards(PermissionGuard)` to the controller and `@RequirePermission('<code>')` to the handler. Codes are seeded in `prisma/seed.ts`.
- **Layers.** Controllers validate and delegate. Services hold logic and all Prisma access, through the injected `PrismaService`.
- **Responses.** `{ "success": true, "data": ... }`; errors are `{ "success": false, "message", "code" }`. Paginated lists return `{ data, meta }` inside `data`.

`CLAUDE.md` in this folder has the full conventions.

## Seeded accounts

`pnpm db:seed` creates the roles `admin`, `owner`, and `viewer`, a demo merchant, and one user per role. See `prisma/seed.ts` for the credentials. With `NODE_ENV=production` only the roles and permissions are created; `SEED_DEMO_DATA=true` overrides that.

## Deployment

`deploy.sh` deploys with Docker Compose or PM2:

```bash
./apps/api/deploy.sh                 # asks for the mode
./apps/api/deploy.sh --mode docker
./apps/api/deploy.sh --mode pm2
```

Run `./apps/api/deploy.sh --help` for the options (`--skip-tests`, `--skip-migrations`, and others). The root `docker-compose.yml` defines the `gh-skeleton-db` and `gh-skeleton-api` services it uses; replace the credentials, `JWT_SECRET`, and `CORS_ORIGIN` there before deploying.

## Related documentation

- `docs/backend/project-context.md`, `docs/backend/architecture.md`, `docs/backend/domain-rules.md`
- `docs/api/api-conventions.md`
- `docs/database/db-notes.md`
