---
name: add-shared-type
description: Add or change an API contract type in packages/shared-types (@gh-skeleton/shared-types) and use it from apps/api and apps/admin. Use when the API and the admin app need the same request or response shape, when a contract field is renamed or removed, or when an app reports that a type is missing from @gh-skeleton/shared-types.
---

# Shared type

Read `docs/architecture/shared-types-guidelines.md` first. `packages/shared-types/src/users/user.types.ts` is the reference.

The apps import the compiled `dist/`, not the source. A change is invisible to them until the package is rebuilt.

## What belongs here

Only a type that is part of the public API contract and is used by more than one workspace. Interfaces and type aliases only: no functions, no classes, no `enum`, and no imports from `@nestjs/*`, `vue`, or Prisma. A type used inside one app stays in that app.

## Steps

1. **Define it** in `packages/shared-types/src/<domain>/<domain>.types.ts`, with `<domain>` matching the API module (`users`, `auth`). Field names are snake_case, exactly as the API returns them. Leave out anything the API never sends, such as `password_hash`.

2. **Export it** from `packages/shared-types/src/index.ts`:

   ```ts
   export type { ProductSummary } from './products/product.types';
   ```

3. **Rebuild.**

   ```bash
   pnpm --filter @gh-skeleton/shared-types build
   ```

4. **Use it in both apps** with `import type { ... } from '@gh-skeleton/shared-types'`.
   - `apps/api`: type the service's return value or the response interface. DTO classes stay in the API, because validation decorators need a class.
   - `apps/admin`: use it in the module's `services/types.ts`, the store, and the pages. Remove the local copy it replaces.

5. **Changing or removing a field** breaks both apps. Update every use in `apps/api` and `apps/admin` in the same change, and put a short migration note in the PR description.

## Verify

```bash
pnpm --filter @gh-skeleton/shared-types build
pnpm --filter gh-skeleton-api typecheck
pnpm --filter gh-skeleton-app typecheck
```

Both apps must typecheck after the rebuild.
