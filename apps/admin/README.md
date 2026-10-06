# GH Skeleton Admin

Dashboard for the GH Skeleton, a multi-tenant SaaS starting point. Vue 3, TypeScript, Vite, PrimeVue 4, Tailwind CSS 4, Pinia.

It covers sign-in and registration, merchants, users, roles, permissions, profile and account settings, and notifications. There is no business domain yet; add one as a new module.

## Setup

```bash
pnpm install                 # from the repo root
cp apps/admin/.env.sample apps/admin/.env
pnpm --filter gh-skeleton-app dev
```

`VITE_API_BASE_URL` points at the API (`http://localhost:3000` in the sample). The API must be running and seeded; see `apps/api/README.md`.

## Commands

Run from `apps/admin`, or from the root with `pnpm --filter gh-skeleton-app <script>`.

| Command | Purpose |
|---|---|
| `pnpm dev` | Vite dev server |
| `pnpm build` | `vue-tsc -b`, then the production build |
| `pnpm typecheck` | Type-check only |
| `pnpm lint` | ESLint, using the root `eslint.config.mjs` |
| `pnpm preview` | Serve the production build |
| `pnpm new-module` | Generate a feature module with Hygen |

There is no test runner.

## Structure

```
src/
├── core/         # Bootstrap: router, Pinia, PrimeVue, global components and styles
├── layouts/      # default.vue (sidebar + header), auth.vue (centered)
├── components/   # App-only components, registered globally
├── composables/
├── helpers/      # auth, utils, toast, loading, download, excel-export
├── plugins/      # axios.ts (shared HTTP client)
├── services/     # Sidebar menu builder, uploads
├── modules/      # Feature modules
└── types/
```

Modules: `auth`, `dashboard`, `landing`, `merchants`, `user`, `role`, `permission`, `profile`, `settings`, `notification`, `error`.

Each module holds its own `pages/`, `components/`, `router/`, `services/` (`api.ts`, `constants.ts`, `rbac.ts`, `menu.ts`), and `stores/`. Routes and sidebar entries are collected automatically from the modules; there is no central file to edit.

## Adding a module

```bash
pnpm new-module
```

Then set the permission codes in `services/rbac.ts` (they must match the codes the API seeds), define the routes with `meta.layout` and `meta.permission`, and fill in `services/menu.ts`. The `user` module is the reference for a CRUD screen.

## Rules

- Shared `Ui*` components and design tokens come from `@gh-skeleton/ui`. Read the root `DESIGN.md` before changing UI.
- PrimeVue and `Ui*` components are auto-imported in templates. Do not import a PrimeVue component by hand; ESLint rejects it.
- Permission checks in the app are for the interface only. The API enforces every permission itself.
- Types that describe an API response belong in `@gh-skeleton/shared-types`.

`CLAUDE.md` in this folder has the full conventions.

## Deployment

`Dockerfile` builds from the repo root context and serves `dist/` with nginx. `VITE_API_BASE_URL` is a build argument: Vite fixes it into the bundle at build time.

## Related documentation

- `docs/frontend/spec-summary.md`, `docs/frontend/user-flows.md`
- `docs/api/api-conventions.md`
- `docs/backend/domain-rules.md`
