---
name: new-landing-page
description: Add a page or home-page section to apps/landing (the static Nuxt marketing site) with copy in both languages. Use when asked for a new public page, a new landing section, or new marketing copy, or when a landing URL returns 404 in one language.
---

# New landing page

Read `apps/landing/CLAUDE.md` first. `apps/landing/app/pages/about.vue` is the reference page, and `app/components/sections/HeroSection.vue` the reference section.

This app is not `apps/admin`. No PrimeVue, no `@gh-skeleton/ui/prime`, no `pi pi-*` icons, no Pinia, no axios, and **no semicolons**.

## Steps for a page

Use `<name>` for the URL segment (`pricing`).

1. **Copy first.** Add a `<name>` block to `app/locales/id.ts`, then the same shape to `app/locales/en.ts`. `id.ts` defines the `Messages` type, so a key missing from `en.ts` fails typecheck. Long-form text goes in `content/id/<name>.md` and `content/en/<name>.md` instead.

2. **Page.** Create `app/pages/<name>.vue`:
   - start the template with `<PageHeader :title="..." :subtitle="..." />`; it clears the fixed header
   - read copy with `const t = useMessages()`; no hard-coded text, no `$t()`
   - call `useSeoMeta` with the title and description from the copy
   - build the body from `UiSection`, `UiSectionHeading`, `UiCard`, `UiButton`, imported from `@gh-skeleton/ui`
   - wrap `<ContentRenderer>` output in `class="prose-legal"`

3. **Generate both languages.** Add `'/<name>'` to the `pages` array at the top of `apps/landing/nuxt.config.ts`. Without it the page is missing from the static output.

4. **Link to it.** Add the link in `AppHeader.vue` or `AppFooter.vue` with `<NuxtLink :to="localePath('/<name>')">`, and its label to both locale files. Use `UiButton` with `href` only for links that leave the site.

## Steps for a home-page section

1. Add the copy to both locale files.
2. Create `app/components/sections/<Name>Section.vue`. Components are auto-imported by file name.
3. Place `<<Name>Section />` in `app/pages/index.vue`.

## Rules that break the build or the page

- The code runs on the server at build time. `window`, `document`, `localStorage`, and `navigator` are allowed only inside `onMounted`, an event handler, or `<ClientOnly>`.
- Anything only the browser knows must not change the first render, or server and client HTML differ.
- Tokens instead of hex values, and a `dark:` counterpart for every surface and text color.
- A new API call goes in `app/services/`, never in a component. Its types go in `app/types/`.

## Verify

```bash
pnpm --filter @gh-skeleton/landing lint
pnpm --filter @gh-skeleton/landing typecheck
pnpm --filter @gh-skeleton/landing build
```

After the build, both `apps/landing/.output/public/<name>/index.html` and `.output/public/en/<name>/index.html` must exist.
