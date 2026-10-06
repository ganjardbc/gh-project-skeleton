---
name: add-permission
description: Add or change an RBAC permission code end to end, from the API seed and guard to the admin route guard, sidebar, and buttons. Use when adding a permission, protecting an endpoint or page, or when a user gets 403 or a menu entry is missing.
---

# Add a permission code

A code such as `product.create` has to exist in five places. Missing one gives a 403 from the API or a hidden page in the admin app.

Codes are `<resource>.<action>`, lowercase. Check the existing list in `apps/api/prisma/seed.ts` and match the resource spelling already used (`user.*` is singular, `merchants.*` is plural).

## API

1. **Seed the code.** In `apps/api/prisma/seed.ts`, add `{ code, description }` to `permissionsData`.
2. **Grant it to roles.** In the same file: `admin` receives every code automatically. Add the code to `ownerPermIds` and, for read access, `viewerPermIds` when those roles should have it. Roles not listed lose the code on the next seed run, because the seed deletes assignments that are not in the list.
3. **Apply it.** `pnpm db:seed`. The seed is an upsert; it is safe to rerun.
4. **Guard the handler.** `@UseGuards(PermissionGuard)` on the controller class and `@RequirePermission('<code>')` on the handler. `PermissionGuard` is not global: a handler without `@RequirePermission` needs only a valid JWT.

## Admin

5. **Declare the constant.** In `apps/admin/src/modules/<feature>/services/rbac.ts`, export the code and add it to the `PERMISSIONS` array. The string must equal the seeded code exactly.
6. **Guard the route.** In `router/index.ts`, set `meta.permission: [CODE]`. Any one code in the array grants access.
7. **Sidebar.** `services/menu.ts` takes `permissions: PERMISSIONS`; the entry shows when the user holds any of them.
8. **Buttons and actions.** Hide them with `isHasPermission(CODE)` from `@/helpers/auth.ts`.

## Verify

- `pnpm --filter gh-skeleton-api test`
- `node .claude/hooks/check-permissions.mjs --all` lists every code the API guards or the admin app declares that is missing from the seed. The new code must not appear. The same check runs as a `Stop` hook and blocks on a code that is not in `.claude/hooks/permission-baseline.json`; do not add a new code to that file to silence it.
- Log out and back in. The admin app caches the permission list in localStorage (`APP_ACTIVE_PERMISSIONS`) at login, so a newly granted code does not appear until the next login.
- Log in as `viewer` and confirm a write action is rejected by the API with 403, not only hidden in the UI.

## Known limits

- The admin app reads permissions from the user's **first** role only; the API uses the union of all roles. A user with two roles can be allowed by the API and still not see the page.
- `isHasPermission()` always grants `dashboard.view`.
