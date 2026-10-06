---
name: new-api-module
description: Add a NestJS module to apps/api (controller, service, DTOs, Prisma model, permissions, tests). Use when asked to add a backend resource, endpoint group, or domain module such as products, outlets, or orders.
---

# New API module

`apps/api` has no generator. Copy the shape of the `users` module; it is the reference for every rule below.

| Read first | For |
|---|---|
| `apps/api/CLAUDE.md` | Layer rules, tenancy, service patterns |
| `apps/api/src/users/users.controller.ts` | Decorators, `@CurrentUser`, Swagger |
| `apps/api/src/users/users.service.ts` | Tenant scoping, pagination, uniqueness checks |
| `apps/api/src/users/dto/create-user.dto.ts` | DTO validation + `@ApiProperty` |
| `apps/api/src/users/users.service.spec.ts` | The tenant-scoping tests to mirror |

## Steps

Use `<name>` for the plural resource (`products`) and `<res>` for the singular permission prefix (`product`).

1. **Schema.** Add the model to `apps/api/prisma/schema.prisma`:
   - snake_case plural model name, snake_case fields
   - `id String @id @default(dbgenerated("(uuid())")) @db.Char(36)`
   - `merchant_id String @db.Char(36)` with a relation to `merchants` and `@@index([merchant_id], map: "idx_<name>_merchant")`, unless the table is global like `roles`
   - `created_at`, `updated_at` as `@default(now()) @db.Timestamp(0)`; `created_by`, `updated_by` as `String? @db.Char(36)`
   - `@@unique([merchant_id, <field>])` for anything unique per tenant

   Run `pnpm db:migrate` (asks for a migration name), then `pnpm db:generate`.

2. **Files.** Create `apps/api/src/<name>/` with `<name>.module.ts`, `<name>.controller.ts`, `<name>.service.ts`, and `dto/create-<res>.dto.ts`, `dto/update-<res>.dto.ts`. The module imports `DatabaseModule`. Register it in `apps/api/src/app.module.ts`.

3. **Controller.** `@ApiTags`, `@ApiBearerAuth`, `@Controller('<name>')`, `@UseGuards(PermissionGuard)` on the class; `@RequirePermission('<res>.<action>')` on each handler. Take the tenant from `@CurrentUser('merchant_id')` and the actor from `@CurrentUser('id')`. No Prisma and no business logic here. Return what the service returns: `TransformInterceptor` adds `{ success, data }`.

4. **Service.** Inject `PrismaService`. Every query on the new table carries `merchant_id`:
   - list: `findMany` + `count` in one `$transaction([...])` with the same `where`; return `{ data, meta: PaginationDto.calculateMeta(total, page, limit) }`
   - one record: `findFirst({ where: { id, merchant_id } })`, then `NotFoundException`
   - update and delete: call the scoped lookup first, then write
   - uniqueness: scoped lookup, then `ConflictException`
   - set `created_by` / `updated_by` from the actor

   A DTO must not contain `merchant_id`.

5. **Permissions.** Follow the `add-permission` skill for `<res>.create`, `<res>.read`, `<res>.update`, `<res>.delete`.

6. **Shared types.** If the admin app will read this resource, add the response type to `packages/shared-types/src/<name>/` and export it from `src/index.ts`, then `pnpm --filter @gh-skeleton/shared-types build`.

7. **Tests.** Add `<name>.service.spec.ts` beside the service, modelled on `users.service.spec.ts`. At minimum: the list and the count filter by `merchant_id`; a lookup for another merchant throws `NotFoundException`; an update or delete for another merchant never reaches `prisma.<name>.update` / `delete`.

## Verify

```bash
pnpm --filter gh-skeleton-api lint
pnpm --filter gh-skeleton-api typecheck
pnpm --filter gh-skeleton-api test
```

Then start the API (`pnpm --filter gh-skeleton-api dev`), open `/docs`, and call the new endpoints with a seeded user's token.
