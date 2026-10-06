---
name: new-admin-module
description: Add a feature module to apps/admin (pages, routes, store, API service, sidebar entry) with the Hygen generator. Use when asked to add an admin page, screen, CRUD UI, or dashboard section.
---

# New admin module

Read `apps/admin/CLAUDE.md` and the root `DESIGN.md` first. The `user` module (`apps/admin/src/modules/user`) is the reference for a CRUD module.

## Steps

1. **Generate.** The generator prompts for the feature name, so pass it as an argument:

   ```bash
   cd apps/admin && npx hygen module new --name <feature>
   ```

   It writes `src/modules/<feature>/` with `pages`, `components`, `router`, `services`, `stores`.

2. **Remove the placeholders.** Delete `components/HelloWorld.vue`, the `message` field in the store, and the generated `README.md` once the module has real content.

3. **Permissions.** Set the codes in `services/rbac.ts`. They must already be seeded and checked by the API; follow the `add-permission` skill.

4. **Routes.** `router/index.ts` default-exports the route array. Each route needs `meta.title`, `meta.layout` (`'default'` or `'auth'`), `meta.permission`, and `meta.breadcrumbs`. Routes are picked up automatically; there is no central route file.

5. **Sidebar.** Set `group`, `order`, `icon`, `label` in `services/menu.ts`. The group key must exist in `src/services/menu-groups.ts`; add it there first. Delete `menu.ts` when the module needs no sidebar entry.

6. **API calls.** Put them in `services/api.ts` using `get` / `post` / `put` / `del` from `@/plugins/axios.ts`, with full paths (`/api/v1/<name>`). A paginated list is at `response.data.data.data`, its meta at `response.data.data.meta`.

7. **Store.** Keep the split files: `state.ts`, `getters.ts`, `actions.ts`, composed in `index.ts`.

8. **UI.**
   - PrimeVue components and `Ui*` components are auto-imported in templates. Do not import a PrimeVue component in `<script>`; ESLint rejects it.
   - In `<script>`, import shared pieces from `@gh-skeleton/ui` or `@gh-skeleton/ui/prime`.
   - Validated fields use `UiFormField` with a Zod schema; see the form pattern in `DESIGN.md`.
   - Every colour needs its `dark:` counterpart, using the tokens.
   - A `<style>` block that uses `@apply` starts with `@reference "@/assets/styles/tailwind.css";`.

9. **Types.** Types that describe an API response belong in `@gh-skeleton/shared-types`, not in the module.

## Verify

```bash
pnpm --filter gh-skeleton-app lint
pnpm --filter gh-skeleton-app build     # vue-tsc + Vite; also regenerates components.d.ts
```

Then run `pnpm --filter gh-skeleton-app dev`, log in, and check: the sidebar entry appears, the page loads, the breadcrumb is right, dark mode looks correct, and a user without the permission is sent to the 403 page.
