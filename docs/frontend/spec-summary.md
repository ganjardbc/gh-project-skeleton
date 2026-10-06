# Admin App — Specification Summary

What `apps/admin` (package `gh-skeleton-app`) does today. Step-by-step behavior is in [user-flows.md](user-flows.md).

## Scope

The admin is the dashboard for a multi-tenant SaaS skeleton. It covers account access, tenant and user administration, and access control. It contains no business domain features: add those as new modules.

## Stack

Vue 3, Vite, TypeScript, Pinia, Vue Router, PrimeVue 4, Tailwind CSS v4, and the shared `@gh-skeleton/ui` package. Visual rules are in [`DESIGN.md`](../../DESIGN.md).

## Modules

| Module | Route | Pages | Purpose |
|---|---|---|---|
| `auth` | `/`, `/register` | Login, register | Sign in; create a merchant and its owner account |
| `landing` | `/landing` | Index | Page shown after login |
| `dashboard` | `/dashboard` | Index | Placeholder dashboard page |
| `merchants` | `/merchants` | List, create, edit, detail | Manage merchants and their logos |
| `user` | `/user` | List, create, edit, detail | Manage users, avatars, and role assignment |
| `role` | `/role` | List, create, edit, detail | Manage roles and their permissions |
| `permission` | `/permission` | List, create | Manage permission codes |
| `notification` | `/notification` | Index | Read notifications and mark them as read |
| `profile` | `/profile` | Index | View the signed-in user's profile |
| `settings` | `/settings` | Menu, edit profile, change password, change email, deactivate account, site settings | Self-service account settings |
| `error` | `/403`, `/404` | 403, 404 | Forbidden and not-found pages |

Each module lives in `src/modules/<name>/` with `pages/`, `router/`, `services/`, and `stores/`. Routes are collected automatically from every module's `router/index.ts`.

## Layouts

| Layout | Used by | Description |
|---|---|---|
| `default` | Every signed-in page | Collapsible sidebar, header with breadcrumb, notifications, and profile menu |
| `auth` | Login, register | Full-height brand background with one centered card |

## Cross-cutting behavior

**Authentication.** Login stores the token, user, merchant, roles, and permissions in `localStorage` through `setAuth()`. Axios attaches `Authorization: Bearer <token>` to every request. A 401 response shows a confirmation dialog, then clears the session and returns to login.

**Authorization.** Each route lists permission codes in `meta.permission`. The route guard redirects to `/403` when the user has none of them. Sidebar items are hidden the same way. Buttons for create, update, and delete are shown only with the matching permission.

Client-side checks read only the **first** role's permissions. The API checks all roles on every request and is the authority.

**Feedback.** `showToast()` for results, `showConfirm()` before destructive actions, `showLoading()` / `hideLoading()` for blocking work.

**Forms.** `@primevue/forms` with a Zod resolver; fields use `UiFormField`.

**Theme.** Light and dark, following the operating system. The manual toggle exists in both layouts but is switched off by the `ENABLE_DARKMODE_TOGGLE` flag.

## Known gaps

- The search box on list pages updates its value but does not filter: the handler only logs.
- `dashboard` and `landing` are placeholder pages.

## Related documents

- [user-flows.md](user-flows.md) — flows and acceptance criteria
- [../api/api-conventions.md](../api/api-conventions.md) — API request and response conventions
- [../backend/domain-rules.md](../backend/domain-rules.md) — tenancy and RBAC rules
