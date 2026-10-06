# Shared Types Guidelines (`@gh-skeleton/shared-types`)

This package is the single source of the type contract between the frontend (`apps/admin`) and the backend (`apps/api`).

## What goes into shared-types

Add a type to this package when it:

- represents a public API request or response contract,
- is used across workspaces (`apps/admin` and `apps/api`),
- is purely type-level (an interface or type alias), with no runtime logic.

Examples:

- `ApiResponse<T>`
- `PaginationMeta`
- `AuthUser`
- `UserSummary`

## What should NOT go into shared-types

Do not add:

- business logic, helper functions, or service classes,
- types that are specific to the internal implementation of one app,
- framework-specific dependencies (`@nestjs/*`, `vue`, and so on).

## Contribution rules

1. **Contract-first**: model a field that the public API uses in `shared-types` first.
2. **Backward compatibility**: avoid a breaking change without a migration.
3. **Breaking change notes are required**: when you rename or remove a contract field, add a short migration note to the PR.
4. **Domain-based structure**: place each type under its domain (`auth`, `users`, `common`).

Rebuild after a change: `pnpm --filter @gh-skeleton/shared-types build`.

## Package layout

```txt
packages/shared-types/
└─ src/
   ├─ common/
   ├─ auth/
   └─ users/
```
