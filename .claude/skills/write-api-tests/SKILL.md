---
name: write-api-tests
description: Write or extend Jest unit tests for an existing apps/api service, including the failing test that reproduces a bug before it is fixed. Use when asked to add tests, raise coverage, write a regression test, or fix a bug in the API.
---

# API tests

Tests are `*.spec.ts` files beside the code they cover, run by Jest with `ts-jest`. Services are tested as plain classes with a hand-built Prisma mock; there is no Nest testing module and no database.

| Read first | For |
|---|---|
| `apps/api/src/users/users.service.spec.ts` | The mock shape and the cases to mirror |
| The service under test | Which Prisma calls it makes and what it throws |
| `apps/api/CLAUDE.md` → Service Patterns | The behaviour the tests must pin down |

## Steps

1. **Mock only what the service calls.** Build `prisma` as an object with one `jest.fn()` per Prisma method used, typed like the `users` spec does. Mock `$transaction` to match the form the service uses:
   - array form: `jest.fn((queries) => Promise.all(queries))`
   - callback form: `jest.fn((fn) => fn(prisma))`

   Construct the service directly: `new XService(prisma as any, otherDeps as any)`. Rebuild the mocks in `beforeEach`.

2. **Use two merchants.** Define `MERCHANT_A` and `MERCHANT_B` and a row factory with `overrides`, as the `users` spec does.

3. **Cover tenant isolation first.** For a tenant-owned resource, at minimum:
   - the list and the count receive the same `where`, and it contains `merchant_id`
   - a single lookup passes `id` and `merchant_id` together
   - a lookup for another merchant throws `NotFoundException`
   - an update or delete for another merchant throws and never reaches `prisma.<model>.update` / `delete`
   - a create writes the caller's `merchant_id`, `created_by`, and `updated_by`

4. **Then the service's own rules.** One case per rule: uniqueness throws `ConflictException`, soft delete sets the flag instead of deleting, sensitive fields such as `password_hash` are absent from the result, a multi-step write uses `tx` inside the transaction.

5. **For a bug, write the failing test first.** Name it after the behaviour, not the ticket. Run it and confirm it fails for the reason the bug describes. Then fix the service and confirm it passes. Keep the test.

## Rules

- Assert on the arguments passed to Prisma and on what the service returns or throws. Do not assert on private methods.
- A test that passes without the code under test proves nothing. After writing a tenant-scoping test, check that removing `merchant_id` from the service makes it fail.
- If a test fails, fix the service. Change an assertion only when the assertion itself was wrong, and say so.
- Controllers hold no logic, so they do not need unit tests. Guards, pipes, and interceptors in `src/common` do.

## Verify

```bash
pnpm --filter gh-skeleton-api test -- <name>.service.spec
pnpm --filter gh-skeleton-api lint
pnpm --filter gh-skeleton-api typecheck
```
