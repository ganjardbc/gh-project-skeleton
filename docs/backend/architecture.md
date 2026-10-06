# Backend Architecture — NestJS Modular Monolith

Each area of the system is a NestJS module under `apps/api/src`. Modules are registered in `app.module.ts`.

## Module map

| Module | Route prefix | Responsibility |
|---|---|---|
| `auth` | `/auth` | Login, registration, current profile, JWT strategy |
| `merchants` | `/merchants` | Merchant (tenant) CRUD and logo |
| `users` | `/users` | User CRUD and avatar, scoped to the caller's merchant |
| `rbac` | `/rbac` | Roles, permissions, role-permission and user-role links |
| `settings` | `/settings` | Own profile, password, email, account deactivation, site settings |
| `uploads` | `/uploads` | File upload, metadata, signed URLs; local and S3 drivers |
| `notifications` | `/notification` | Per-user notifications and read state |
| `database` | — | Global `PrismaService` |
| `common` | — | Decorators, guards, pipes, interceptors, filters, shared DTOs |

All routes sit under the global prefix `/api/v1`. Swagger UI is served at `/docs`.

## Module layout

```
src/<name>/
├── dto/
├── <name>.module.ts
├── <name>.controller.ts
└── <name>.service.ts
```

## Layer rules

**Controller**
- Accepts DTOs, applies decorators, calls a service, returns the result
- No database access, no business logic

**Service**
- Business rules, Prisma queries, transactions, tenant scoping

**Prisma**
- Used only inside services, always through the injected `PrismaService`
- Never `new PrismaClient()`

## Request pipeline

Configured in `src/main.ts`:

1. Static files: `/uploads/local` serves the local `uploads/` directory
2. CORS from `CORS_ORIGIN`
3. Global `ValidationPipe`
4. Global `HttpExceptionFilter`
5. Global `TransformInterceptor`

## Guards and decorators

| Item | Scope | Behavior |
|---|---|---|
| `JwtAuthGuard` | Global (`APP_GUARD`) | Every route needs a valid JWT unless marked `@Public()` |
| `PermissionGuard` | Per controller | Add `@UseGuards(PermissionGuard)`, then `@RequirePermission('resource.action')` per handler |
| `@Public()` | Handler | Skips JWT authentication |
| `@CurrentUser()` | Parameter | The authenticated user, or one field: `@CurrentUser('merchant_id')` |

A handler without `@RequirePermission` only requires a valid JWT.

`JwtStrategy.validate()` loads the user from the database on every request and sets `request.user` to:

```ts
{ id, email, name, merchant_id, merchant: { id, name, slug }, is_active }
```

## Multi-tenant enforcement

- `merchant_id` comes from `@CurrentUser('merchant_id')`, never from the body, query, or route params.
- Every tenant-owned query filters by `merchant_id`.

## Transactions

Use a Prisma transaction when one operation writes more than one table and must be atomic. Registration is the existing example: it creates the merchant and the user and assigns the `owner` role in one transaction.

## Adding a module

1. Create `src/<name>/` with the layout above.
2. Register it in `app.module.ts`.
3. Add its permission codes to `prisma/seed.ts` and attach them to roles.
4. Scope every query by `merchant_id` if the data is tenant-owned.
