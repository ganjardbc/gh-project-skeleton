# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | Build for production (`vue-tsc -b` + Vite) |
| `pnpm typecheck` | `vue-tsc -b --noEmit` |
| `pnpm preview` | Preview production build |
| `pnpm new-module` | Generate a new feature module via Hygen (`npx hygen module new`) |

From the repo root, prefix with `pnpm --filter gh-skeleton-app`. There are no test or lint scripts.

## Tech Stack

- **Framework:** Vue 3 (Composition API) + TypeScript + Vite
- **State:** Pinia with `pinia-plugin-persistedstate` (localStorage)
- **Routing:** Vue Router with per-module route registration
- **UI:** PrimeVue 4 (Aura preset, auto-imported) + Tailwind CSS 4 + `tailwindcss-primeui`
- **HTTP:** Axios with interceptors for auth tokens & 401 handling
- **Validation:** Zod
- **Charts:** Chart.js
- **Tools:** Day.js, XLSX. `html2canvas` and `qrcode` are installed but not imported anywhere yet

## Architecture

```
src/
├── core/         # Bootstrap: initiate.ts, global-routes.ts, global-components.ts, global-styles.ts
├── layouts/      # default.vue (sidebar + header), auth.vue (centered)
├── components/   # App-only components (UiSidebar*). Shared Ui* live in @gh-skeleton/ui
├── composables/  # useFileUpload. Theme and global toast/confirm/loading come from @gh-skeleton/ui
├── helpers/      # auth.ts, utils.ts, toast.ts, loading.ts, download.ts, excel-export.ts
├── plugins/      # axios.ts (shared HTTP client)
├── services/     # menus.ts + menu-groups.ts (sidebar), uploads.ts
├── modules/      # Feature modules
└── types/
```

Current modules: `auth`, `dashboard`, `landing`, `merchants`, `user`, `role`, `permission`, `profile`, `settings`, `notification`, `error`.

**Feature module structure:**
```
src/modules/[feature]/
├── pages/          # Routable page components
├── components/     # Feature-specific components
├── router/         # index.ts — default-exports an array of routes
├── services/
│   ├── api.ts        # API calls via @/plugins/axios.ts
│   ├── constants.ts  # FEATURE_NAME, PREFIX_ROUTE_PATH, PREFIX_ROUTE_NAME
│   ├── rbac.ts       # Permission code constants + PERMISSIONS array
│   ├── menu.ts       # Sidebar entries: group, order, permissions (optional)
│   └── types.ts      # Form/entity types (optional)
├── stores/         # state.ts, getters.ts, actions.ts, index.ts
├── helpers/        # Composables & utilities (optional)
└── styles/         # Module-specific styles (optional)
```

**Key patterns:**
- `main.ts` only imports `core/*`; app setup (router, Pinia, PrimeVue theme, toast, confirm) lives in `core/initiate.ts`.
- Routes are auto-registered via `import.meta.glob('../modules/**/router/index.ts')` in `core/global-routes.ts`. No central route file to edit.
- Every `src/components/*.vue` is registered globally under its filename. Only app-specific components belong there.
- Shared `Ui*` components, design tokens, `useTheme`, and the PrimeVue preset come from `@gh-skeleton/ui` (`packages/ui`). They are auto-imported in templates by `GhUiResolver()` in `vite.config.ts`; in `<script>` import from `@gh-skeleton/ui` (core) or `@gh-skeleton/ui/prime`. Read the root `DESIGN.md` before changing UI.
- Dark mode is `useTheme()` from `@gh-skeleton/ui`, which toggles `.dark` on `<html>`. Do not add a second theme mechanism.
- Tailwind v4 is configured in CSS (`src/assets/styles/tailwind.css`); there is no `tailwind.config.ts`. In an SFC `<style>` block that uses `@apply`, write `@reference "@/assets/styles/tailwind.css";`, not `@import "tailwindcss"`.
- Validated form fields use `UiFormField`; see the form pattern in `DESIGN.md`.
- PrimeVue components are auto-imported by `unplugin-vue-components`; do not import them manually.
- Stores use the split-file pattern: `state.ts`, `getters.ts`, `actions.ts` composed in `index.ts`.
- API calls go in `modules/<feature>/services/api.ts` and use full paths such as `/api/v1/users`.
- Import alias `@` → `src`.

## Routing & Layouts

Route meta shape:

```ts
meta: {
  title: 'User',
  layout: 'default',          // 'default' | 'auth'
  permission: [READ],         // any one of these codes grants access
  breadcrumbs: [{ label, route, isActive }],
}
```

- `App.vue` picks the layout from `meta.layout`: `auth` → `AuthLayout`, anything else → `DefaultLayout`.
- Global `beforeEach`: a logged-in user on an `auth` route is sent to `/landing`; a logged-out user on a `default` route is sent to `/` (login).
- Routes with `meta.permission` get a `beforeEnter` guard that redirects to the `403` route when the user has none of the listed codes.
- Unknown paths fall through to the `404` route.

## Sidebar Menu

The sidebar is a three-level tree: **group → menu → submenu**. Nothing is registered centrally; `src/services/menus.ts` collects every `src/modules/*/services/menu.ts` with `import.meta.glob` and builds the tree.

- **Groups** are defined in `src/services/menu-groups.ts` (`key`, `label`, `order`). A module refers to a group by key; an unknown key fails typecheck. Add a group there before using it.
- **A module's `services/menu.ts`** default-exports an array typed `ModuleMenuEntry[]` (`src/types/menu.ts`). A menu entry has `key`, `group`, `order`, `icon`, `label`, `route`, `permissions`, and optional `featureFlag`.
- **Submenus** come from `children` on a menu (same module), or from an entry with `parent: '<menu key>'` instead of `group` (another module's menu). A menu with submenus acts as a toggle, so leave out its `route`.
- **Visibility:** a menu or submenu shows when the user has any of its `permissions` and `featureFlag` is not `false`. A menu with submenus shows only when at least one submenu does. Empty groups are hidden.

A module without `services/menu.ts` does not appear in the sidebar. `pnpm new-module` generates one in the `main` group.

## Authentication & Permissions

All helpers are in `src/helpers/auth.ts`.

- **Storage keys:** `APP_TOKEN`, `APP_BEARER` (token type), `APP_USER`, `APP_MERCHANT`, `APP_ROLES`, `APP_ACTIVE_ROLE`, `APP_ACTIVE_PERMISSIONS`, `APP_IS_LOGIN`
- **Helpers:** `setAuth()`, `removeAuth()`, `isLogin()`, `getToken()`, `getUser()`, `getMerchant()`, `getRolesList()`, `getRole()`, `getPermissions()`, `isHasPermission()`, `isUserNotAdmin()`, `getPersonalInformation()`
- **Permission model:** flat RBAC. `setAuth()` takes the login response's `rbac` array, stores all roles in `APP_ROLES`, and uses the **first** role as the active role and the source of `APP_ACTIVE_PERMISSIONS`.
- `isHasPermission()` always grants `dashboard.view`.
- `isUserNotAdmin()` is true unless the active role name is `admin` or `superadmin`.

The frontend check is for UX only; the API enforces permissions independently.

## API Integration

- **Client:** `src/plugins/axios.ts` — default export `api`, plus `get` / `post` / `put` / `del` helpers
- **Base URL:** `VITE_API_BASE_URL`
- **Auth header:** request interceptor adds `Authorization: Bearer <APP_TOKEN>`
- **401 while logged in:** `window.confirm` → `removeAuth()` → redirect to the login route
- **Response shape:** `{ success, data }`. Paginated lists nest inside it: `{ success, data: { data: [...], meta } }`, so read `response.data.data.data` and `response.data.data.meta` (`total`, `page`, `limit`, `totalPages`)
- **Uploads:** use `src/services/uploads.ts` and `useFileUpload`

## Module Development

1. Run `pnpm new-module` (templates in `_templates/module/new`).
2. Set permission codes in `services/rbac.ts`; they must match codes the API seeds and checks.
3. Define routes in `router/index.ts` with `meta.layout` and `meta.permission`.
4. Set `group`, `order`, `icon`, and `label` in `services/menu.ts`, or delete the file if the module needs no sidebar entry.
5. Put shared contract types in `@gh-skeleton/shared-types`, not in the module.

The generator also writes `components/HelloWorld.vue`, a `message` field in the store, and a template `README.md`. Replace or delete them once the module has real content.

## Environment

`apps/admin/.env` (template: `.env.sample`):

```env
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=http://localhost:3000
```

`VITE_APP_VERSION` is not read by the code yet. Vite fixes these values into the bundle at build time.

## Deployment

`Dockerfile` builds from the repo root context: it builds `@gh-skeleton/shared-types`, copies it and `packages/ui` into `vendor/`, rewrites the two workspace dependencies to point there, then serves `dist/` with nginx (`default.conf`). A new workspace dependency needs the same treatment. `VITE_API_BASE_URL` is a Docker build argument.

`apps/admin/docker-compose.yml` still carries the service, container, and network names of another project (`sikeci-*`); rename them before using it.

## Gotchas

- `src/modules/dashboard/services/__tests__/` holds test files, but no test runner is installed and `tsconfig.app.json` excludes the folder. They are neither run nor type-checked.
- `components.d.ts` is generated by `unplugin-vue-components`. Do not edit it by hand.
