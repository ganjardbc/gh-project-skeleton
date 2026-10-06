# CLAUDE.md

Guidance for working in `packages/ui` (`@gh-skeleton/ui`): the design tokens and shared Vue components used by `apps/admin` and `apps/landing`.

Visual rules, the component catalog, and usage patterns are in the root [`DESIGN.md`](../../DESIGN.md). Read it before adding or changing a component, and update its catalog when you do.

## Commands

```bash
pnpm --filter @gh-skeleton/ui typecheck
```

There is no build step. The package is source-only: `package.json` exports `.ts`, `.vue`, and `.css` files directly, and each app's Vite compiles them. Verify a change by building the apps:

```bash
pnpm --filter gh-skeleton-app build
pnpm --filter @gh-skeleton/landing build   # also proves the code is server-safe
```

## Layout

```
packages/ui/
├── resolver.js         # GhUiResolver() for unplugin-vue-components (plain JS)
└── src/
    ├── index.ts        # Core entry: @gh-skeleton/ui
    ├── core/           # Components with no PrimeVue import
    ├── composables/    # useTheme, themeScript (no imports; loaded by build configs)
    ├── prime/          # PrimeVue entry: @gh-skeleton/ui/prime
    │   ├── index.ts
    │   ├── preset.ts   # uiPreset, uiPrimeVueTheme
    │   └── composables/  # useGlobalToast, useGlobalConfirm, useGlobalLoading
    └── styles/
        ├── index.css   # Entry: tokens + dark variant + @source
        ├── tokens.css  # @theme variables
        └── palettes/   # Optional brand overrides
```

## Rules

- **`core/` must not import PrimeVue**, directly or through another file. The landing app imports the core entry and does not install PrimeVue; one stray import breaks its build.
- **A new component needs three registrations:** the `.vue` file, an export in the matching `index.ts`, and its name in the matching list in `resolver.js`. Without the resolver entry, the admin's templates will not auto-import it.
- **Import PrimeVue components explicitly** inside `prime/` (`import Button from 'primevue/button'`). The admin's auto-import does not apply to this package.
- **Write Tailwind classes as complete literal strings.** Tailwind scans this folder as text (`@source` in `styles/index.css`); a class assembled by concatenation is never generated. Map variants through an object of full strings, as `UiButton` does.
- **No `@apply` and no `@import "tailwindcss"`** in component `<style>` blocks. Put utilities in the template.
- **Every color needs a dark counterpart** (`dark:`), unless it is a brand or semantic color that reads on both themes. Use the tokens (`dark:bg-dark-secondary`, `dark:border-dark-line`), not hex values.
- **Code must be safe to run on a server.** The landing site is rendered by Nuxt at build time. Do not touch `window`, `document`, `localStorage`, or `navigator` at module top level or during component setup; guard with `typeof window !== 'undefined'` or use `onMounted`. `useTheme.ts` shows the pattern.
- **Keep components free of app concerns.** No router, no Pinia store, no API calls. A component that needs those belongs in the app.
- **Code must pass both apps' compilers.** The admin uses TypeScript 5.8 and the landing 6.0, both with `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly` (no `enum`, no parameter properties). Use `export type` for type-only exports.

## Conventions

- File name `Ui<Name>.vue`, `<script setup lang="ts">`, typed `defineProps` with `withDefaults`.
- Two-space indentation, semicolons, single quotes.
- Comment a prop only when its meaning is not clear from its name and type.

## Tokens

- A `--color-*` variable in `styles/tokens.css` creates the matching utilities (`bg-*`, `text-*`, `border-*`).
- The PrimeVue preset reads `--color-primary-*`, `--color-secondary-*`, `--color-accent-*`, and `--color-tertiary-*`, shades `50`–`900`. Keep those names and shades when editing a palette, or PrimeVue components lose their color.
- A palette file in `styles/palettes/` overrides the brand scales only.

## Dark mode

`useTheme()` toggles `.dark` on `<html>`. The `dark` variant in `styles/index.css`, `darkModeSelector` in `prime/preset.ts`, and `themeInitScript` in `composables/themeScript.ts` all depend on that class name: change all four together.

`themeInitScript` must resolve the theme exactly as `useTheme()` does (stored choice, else OS preference), or a server-rendered page flashes the wrong theme.

## Consumers

- The admin sets `resolve.dedupe` in `vite.config.ts` so this package uses the app's copy of Vue and PrimeVue. A new peer dependency used here must be added to that list.
- The landing app (Nuxt) lists the package in `build.transpile` in `nuxt.config.ts`.
- Both Dockerfiles copy `package.json`, `resolver.js`, `resolver.d.ts`, and `src/` into the image. A new top-level file needed at build time must be added to those `COPY` lines.
