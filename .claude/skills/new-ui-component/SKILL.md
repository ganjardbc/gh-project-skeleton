---
name: new-ui-component
description: Add or change a shared Ui* Vue component in packages/ui (@gh-skeleton/ui), including its export, resolver entry, and DESIGN.md catalog row. Use when asked for a reusable component, when the same markup is needed in both apps/admin and apps/landing, or when an admin template reports an unresolved Ui* component.
---

# New UI component

Read `packages/ui/CLAUDE.md` and the root `DESIGN.md` first. `packages/ui/src/core/UiButton.vue` is the reference: typed props with defaults, and variants mapped through objects of complete class strings.

A component used by one app only does not belong here. Put it in that app (`apps/admin/src/components`, or `apps/landing/app/components`).

## Steps

1. **Choose the entry.** This decides the folder and both registration lists.

   | The component | Folder | Export in | List in `resolver.js` |
   |---|---|---|---|
   | imports nothing from PrimeVue, directly or through another file | `src/core/` | `src/index.ts` | `core` |
   | wraps or uses a PrimeVue component | `src/prime/` | `src/prime/index.ts` | `prime` |

   Prefer `core`: the landing app can use only core components.

2. **Write `Ui<Name>.vue`.**
   - `<script setup lang="ts">`, typed `defineProps` with `withDefaults`
   - two-space indentation, semicolons, single quotes
   - Tailwind classes as complete literal strings; map a variant prop through an object of full strings, never by concatenation
   - tokens instead of hex values, and a `dark:` counterpart for every color
   - no `@apply` and no `@import "tailwindcss"` in `<style>`
   - no `window`, `document`, `localStorage`, or `navigator` at the top level or during setup; use `onMounted`
   - no router, store, or API calls
   - no `enum` and no parameter properties; `export type` for type-only exports
   - in `prime/`, import each PrimeVue component explicitly (`import Button from 'primevue/button'`)

3. **Register it in three places.** Keep each list alphabetical.
   - the `.vue` file from step 2
   - `export { default as Ui<Name> } from './core/Ui<Name>.vue';` in `src/index.ts`, or the `prime` equivalent in `src/prime/index.ts`
   - `'Ui<Name>'` in the `core` or `prime` array in `packages/ui/resolver.js`

   Without the resolver entry, admin templates do not auto-import the component.

4. **Test.** For a component with variants, conditional rendering, or accessibility attributes, add `src/<entry>/__tests__/Ui<Name>.spec.ts`, modelled on `src/core/__tests__/UiButton.spec.ts`.

5. **Catalog.** Add a row to the matching table in `DESIGN.md` section 8 (Core or PrimeVue).

6. **New dependency.** A new peer dependency goes in `packages/ui/package.json` and in `resolve.dedupe` in `apps/admin/vite.config.ts`. A new top-level file needed at build time goes in the `COPY` lines of both Dockerfiles.

## Verify

```bash
pnpm --filter @gh-skeleton/ui lint
pnpm --filter @gh-skeleton/ui typecheck
pnpm --filter @gh-skeleton/ui test
pnpm --filter gh-skeleton-app build
pnpm --filter @gh-skeleton/landing build
```

The package has no build of its own, so the two app builds are the real check. The landing build also proves a core component is server-safe and free of PrimeVue.
