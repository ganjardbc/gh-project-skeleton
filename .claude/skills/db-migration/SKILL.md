---
name: db-migration
description: Change the schema of an existing table in apps/api (add, rename, or drop a column, index, or relation) and carry the change through the migration, seed, DTOs, shared types, and tests. Use when asked to add a field, alter a column, add an index, or when Prisma reports schema drift.
---

# Database migration

For a new table with its own module, use the `new-api-module` skill instead. This skill covers a change to a table that already exists.

| Read first | For |
|---|---|
| `apps/api/CLAUDE.md` → Database Conventions | Naming, key, timestamp, and index rules |
| `apps/api/prisma/schema.prisma` | The current model and its neighbours |
| `apps/api/prisma/migrations/` | What is already applied |

## Steps

1. **Schema.** Edit `apps/api/prisma/schema.prisma`:
   - snake_case field names that match the column
   - ids and foreign keys as `String @db.Char(36)`
   - a foreign key gets a relation and `@@index([<column>], map: "idx_<table>_<column>")`
   - a value unique per tenant is `@@unique([merchant_id, <field>])`, never `@unique` alone
   - a tenant-owned table keeps `merchant_id`; do not remove it or make it optional

2. **Existing rows.** Decide what happens to data already in the table before generating anything:
   - a new required column needs a `@default(...)`, or two migrations: add it nullable and backfill, then make it required
   - a rename shows up to Prisma as drop plus add and loses the data. Generate with `--create-only` and rewrite the SQL as `RENAME COLUMN`
   - dropping a column or table destroys data. Confirm with the user first

3. **Migrate.** From the repo root:

   ```bash
   pnpm db:migrate     # asks for a migration name; use snake_case, e.g. add_phone_to_users
   pnpm db:generate
   ```

   To edit the SQL before it is applied: `pnpm --filter gh-skeleton-api exec prisma migrate dev --create-only`, edit the new file under `prisma/migrations/`, then `pnpm db:migrate`.

   `prisma migrate dev` is interactive and refuses to run in a shell without a terminal, which includes Claude Code ("the environment is non-interactive"). When that happens, write the migration by hand: get the SQL with `pnpm --filter gh-skeleton-api exec prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`, save it as `prisma/migrations/<YYYYMMDDHHMMSS>_<name>/migration.sql`, read it critically (the generated script can drop a foreign key it does not need to), then apply it with `prisma migrate deploy` and confirm with the same `migrate diff` plus `--exit-code` that nothing differs.

   Never edit or delete a migration that has been applied. Add a new one. If `migrate dev` offers to reset the database, stop and ask the user: a reset deletes all local data.

4. **Follow the change through the code.**
   - `apps/api/prisma/seed.ts` if seeded rows need the new column
   - the module's DTOs, with validation decorators and `@ApiProperty`. `merchant_id` never goes in a DTO
   - the service: select, write, and strip the field as needed
   - `packages/shared-types` if the admin app reads the field, then `pnpm --filter @gh-skeleton/shared-types build`
   - the admin module's `services/types.ts`, forms, and tables that show the field
   - the service spec: update the row fixtures and add a case for the new behaviour

## Verify

```bash
pnpm --filter gh-skeleton-api typecheck
pnpm --filter gh-skeleton-api test
pnpm --filter gh-skeleton-api exec prisma migrate status
```

`migrate status` must report the database as up to date. If shared types changed, also run `pnpm --filter gh-skeleton-app typecheck`.
