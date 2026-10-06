# CLAUDE.md

Guidance for working in `apps/landing` (`@gh-skeleton/landing`): the public marketing site.

Visual rules and the shared component catalog are in the root [`DESIGN.md`](../../DESIGN.md).

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Nuxt dev server on port 5174 |
| `pnpm build` | `nuxt generate`: static site in `.output/public` |
| `pnpm preview` | Serve the generated site |
| `pnpm start` | Same, bound to `0.0.0.0` on `$PORT` (default 4173) |
| `pnpm typecheck` | `nuxt typecheck` |

From the repo root, prefix with `pnpm --filter @gh-skeleton/landing`. `pnpm lint` runs ESLint with the root `eslint.config.mjs`, which rejects PrimeVue and `@gh-skeleton/ui/prime` imports here. There is no test script.

Nuxt is pinned to `~4.5`. Nuxt 4.6 requires Node 22.22.3 or newer; raise the pin only together with the Node version.

## Stack

Nuxt 4 (static generation) + TypeScript + Tailwind CSS v4, `@nuxtjs/i18n` for language routing, `@nuxt/content` for Markdown pages, and `@gh-skeleton/ui` for components and tokens. No Pinia, no axios.

## Structure

Layered: files are grouped by kind, not by feature.

```
apps/landing/
├── nuxt.config.ts
├── content.config.ts        # Markdown collections
├── content/<locale>/*.md    # Long-form text (terms)
├── public/                  # Static files served from /
└── app/
    ├── app.vue
    ├── assets/css/main.css  # Tailwind + @gh-skeleton/ui tokens + .prose-legal
    ├── layouts/default.vue  # Header, footer, <html lang>, hreflang
    ├── pages/               # One file per URL
    ├── components/
    │   ├── layout/          # AppHeader, AppFooter, PageHeader
    │   ├── sections/        # Blocks of the home page (*Section.vue)
    │   └── faq/
    ├── composables/         # useMessages, useWebLinks
    ├── services/            # API calls
    ├── locales/             # id.ts, en.ts
    └── types/
```

Allowed import direction: `pages` → `components` → `composables` / `services` → `types`. A service never imports a component.

## Pages and URLs

| File | Indonesian (default) | English |
|---|---|---|
| `pages/index.vue` | `/` | `/en` |
| `pages/about.vue` | `/about` | `/en/about` |
| `pages/faq.vue` | `/faq` | `/en/faq` |
| `pages/terms.vue` | `/terms` | `/en/terms` |

To add a page:

1. Create `app/pages/<name>.vue`. Start it with `<PageHeader>` (it clears the fixed header) and call `useSeoMeta` for the title and description.
2. Add its copy to both locale files.
3. Add `'/<name>'` to the `pages` list in `nuxt.config.ts` so both language versions are generated.
4. Link to it with `localePath('/<name>')` in `AppHeader` or `AppFooter`.

## This app differs from `apps/admin`

Do not copy admin patterns here.

- **No PrimeVue.** Import only from `@gh-skeleton/ui` (the core entry). Never import `@gh-skeleton/ui/prime`.
- **No icon font.** PrimeIcons classes (`pi pi-*`) render nothing. Use text glyphs or inline SVG.
- **Code style:** no semicolons, single quotes, two-space indentation.
- **Auto-imports:** Vue and Nuxt APIs (`ref`, `computed`, `useHead`, …), everything in `composables/`, and components under `components/` (by file name, no folder prefix). `@gh-skeleton/ui` components, `services/`, and `types/` are imported explicitly.

## Rules

- **The code runs on the server at build time.** Do not touch `window`, `document`, `localStorage`, or `navigator` at the top level of a module or of `<script setup>`. Use them inside `onMounted`, an event handler, or `<ClientOnly>`.
- **Anything only the browser knows must not change the first render.** The theme is the existing example: `AppHeader` wraps the theme icon in `<ClientOnly>` so server and client HTML match.
- **No hard-coded copy.** Text comes from `app/locales`, read with `useMessages()`. Add each key to both `id.ts` and `en.ts`; `id.ts` defines the `Messages` type and `en.ts` must satisfy it.
- **Long-form text goes in `content/<locale>/<name>.md`,** not in the locale files. Wrap `<ContentRenderer>` output in `class="prose-legal"`.
- **Internal links use `<NuxtLink>` with `localePath()`,** so the language is kept. `UiButton` with `href` renders a plain `<a>` and does a full page load: use it for links to the admin app or for the language switch.
- **Use tokens, not hex values,** and give every surface a `dark:` counterpart.
- **Theme:** `useTheme()` from `@gh-skeleton/ui`. The `.dark` class is set before first paint by `themeInitScript`, injected in `nuxt.config.ts`.

## Internationalization

- `@nuxtjs/i18n` owns the routes and the current locale: strategy `prefix_except_default`, default `id`, browser-language detection off (a static site cannot redirect per visitor).
- The module is not given message files. Copy lives in typed objects (`app/locales`), so arrays and nested items keep their types. Use `useMessages()`, not `$t()`.
- To add a language: add it to `i18n.locales` and the `locales` list in `nuxt.config.ts`, add `app/locales/<code>.ts`, register it in `useMessages.ts`, and add `content/<code>/`.

## API

`services/auth.ts` is the only API call: `POST {apiBaseUrl}/api/v1/auth/register`, used by `RegisterSection.vue`. It creates a merchant and its owner user.

## Environment

`apps/landing/.env` (template: `.env.sample`):

| Variable | Purpose | Fallback |
|---|---|---|
| `NUXT_PUBLIC_WEB_BASE_URL` | Admin app URL for the Login and Register links | `http://localhost:5173` |
| `NUXT_PUBLIC_API_BASE_URL` | API base URL for the registration form | `http://localhost:3000` |
| `NUXT_PUBLIC_SITE_URL` | Public URL of this site, for canonical and hreflang links | `http://localhost:5174` |

The site is generated statically, so these are read at **build** time and fixed into the output. Changing one requires a rebuild.

## Deployment

`Dockerfile` runs `pnpm build` and serves `.output/public` with nginx (`default.conf`). It builds from the repo root context and copies `packages/ui` into `vendor/ui`; a new workspace dependency needs the same treatment. The three variables above are Docker build arguments.

`@nuxt/content` uses Node's built-in `node:sqlite` at build time (`content.experimental.sqliteConnector: 'native'`), so the build needs Node 22.5 or newer and no native module.
