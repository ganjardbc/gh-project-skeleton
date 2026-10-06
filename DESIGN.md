# Design System

The single source of truth for how `apps/admin` and `apps/landing` look and how their UI is built. The tokens and components described here live in [`packages/ui`](packages/ui) (`@gh-skeleton/ui`).

If this document and the code disagree, the code in `packages/ui` wins: fix the document.

## Contents

1. [Principles](#1-principles)
2. [Stack and setup](#2-stack-and-setup)
3. [Color](#3-color)
4. [Dark mode](#4-dark-mode)
5. [Typography](#5-typography)
6. [Spacing, radius, shadow](#6-spacing-radius-shadow)
7. [Icons](#7-icons)
8. [Components](#8-components)
9. [Page patterns](#9-page-patterns)
10. [Accessibility](#10-accessibility)
11. [Extending the system](#11-extending-the-system)

---

## 1. Principles

- **Tokens before values.** Use a token utility (`bg-primary`, `text-navy`, `dark:bg-dark-secondary`). Do not write hex values or arbitrary colors such as `bg-[#27272a]` in app code.
- **One component per job.** Before writing markup for a card, field, button, or empty state, check the catalog in section 8. Duplicated class strings are a sign that a component is missing.
- **PrimeVue for app controls, `Ui*` for structure.** In the admin, inputs, tables, dialogs, and buttons are PrimeVue. `Ui*` components provide layout, composition, and the PrimeVue-free primitives the landing page needs.
- **Every surface works in light and dark.** A new class that sets a background, border, or text color needs its `dark:` counterpart unless it is a brand or semantic color that reads on both.

## 2. Stack and setup

| Layer | Choice |
|---|---|
| Utilities | Tailwind CSS v4 (CSS-first config, no `tailwind.config.*`) |
| Tokens | `@theme` variables in `packages/ui/src/styles/tokens.css` |
| App controls (admin) | PrimeVue 4, Aura preset, themed by `uiPreset` |
| Icons (admin) | PrimeIcons |
| Shared components | `@gh-skeleton/ui` |
| Landing framework | Nuxt 4, statically generated |

`@gh-skeleton/ui` is a source-only package: there is no build step, and each app's Vite compiles it. It has two entry points.

| Import | Contains | Requires PrimeVue |
|---|---|---|
| `@gh-skeleton/ui` | Core components, `useTheme` | No |
| `@gh-skeleton/ui/prime` | PrimeVue-based components, global toast/confirm/loading, `uiPreset` | Yes |
| `@gh-skeleton/ui/styles.css` | Tokens, the `dark` variant, Tailwind source registration | No |
| `@gh-skeleton/ui/palettes/<name>.css` | Optional brand palettes: `teal`, `blue`, `green`, `red` | No |
| `@gh-skeleton/ui/resolver` | `GhUiResolver()` for `unplugin-vue-components` | No |
| `@gh-skeleton/ui/theme-script` | `themeInitScript` and `THEME_STORAGE_KEY`, for server-rendered apps | No |

### Wiring an app

```css
/* main stylesheet */
@import "tailwindcss";
@import "@gh-skeleton/ui/styles.css";
```

```ts
// vite.config.ts
resolve: {
  dedupe: ['vue', 'primevue', '@primeuix/themes'], // list only what the app installs
}
```

```ts
// PrimeVue apps only
import { uiPrimeVueTheme } from '@gh-skeleton/ui/prime';
app.use(PrimeVue, { theme: uiPrimeVueTheme });
```

A Nuxt app lists the package in `build.transpile` and injects `themeInitScript` in `app.head`; see `apps/landing/nuxt.config.ts`.

In the admin, `Ui*` components from the package are auto-imported in templates through `GhUiResolver()`. In `<script>` and in the landing app, import them by name:

```ts
import { UiCard } from '@gh-skeleton/ui';
import { UiFormGroup } from '@gh-skeleton/ui/prime';
```

### `@apply` inside a Vue `<style>` block

Reference the app's Tailwind entry. Do not `@import "tailwindcss"` in a component: it emits a second copy of the framework.

```vue
<style scoped>
@reference "@/assets/styles/tailwind.css";

.my-block {
  @apply rounded-lg bg-primary-50 dark:bg-dark;
}
</style>
```

## 3. Color

Every token below is a Tailwind color, so `bg-*`, `text-*`, `border-*`, `ring-*`, and opacity modifiers (`shadow-primary/25`) all work.

### Brand

The default palette is orange. Each scale has shades `25, 50, 100 … 900` plus an unsuffixed alias for the base (`bg-primary` equals `bg-primary-500`).

| Scale | Base | Role |
|---|---|---|
| `primary` | `#FE7A36` | Main actions, active navigation, links, focus rings, brand highlights |
| `secondary` | `#3652AD` | Supporting accents. Available to PrimeVue as a palette |
| `accent` | `#280274` | Rare emphasis |
| `tertiary` | `#E9F6FF` | Tinted backgrounds. `bg-tertiary-25` is the admin page background |

Shade usage for `primary`:

| Shade | Use |
|---|---|
| `25`, `50` | Tinted backgrounds: active sidebar item, icon tiles |
| `100`–`300` | Borders and decorative fills on tinted backgrounds |
| `400` | Brand text on dark surfaces |
| `500` | Default fill and brand text on light surfaces |
| `600` | Hover state of a `500` fill |
| `700`–`900` | Pressed states, gradients |

To change the brand, import a palette after the entry stylesheet. PrimeVue follows automatically because `uiPreset` reads the same variables.

```css
@import "@gh-skeleton/ui/styles.css";
@import "@gh-skeleton/ui/palettes/blue.css";
```

### Neutral

Tailwind's `gray` scale. Common roles:

| Role | Light | Dark |
|---|---|---|
| Primary text | `text-gray-900` | `dark:text-white` / `dark:text-gray-100` |
| Secondary text, labels | `text-gray-500` | `dark:text-gray-400` |
| Hints, placeholders | `text-gray-400` | `dark:text-gray-500` |
| Borders, dividers | `border-gray-200` | `dark:border-dark-line` |
| Input borders | `border-gray-300` | `dark:border-gray-700` |

### Surfaces

| Token | Value | Use |
|---|---|---|
| `white` | `#FFFFFF` | Cards and page background in light mode |
| `cream` | `#FDF7F2` | Alternating marketing bands (`UiSection tone="muted"`) |
| `navy` | `#293342` | Marketing headings in light mode |
| `dark` | `#0E0E0F` | Page background in dark mode; inset wells such as inputs |
| `dark-secondary` | `#18181B` | Raised surfaces in dark mode: cards, sidebar, header, muted bands |
| `dark-line` | `#27272A` | Borders, dividers, and subtle fills in dark mode |

### Semantic

Use Tailwind's built-in scales, and PrimeVue `severity` on PrimeVue components.

| Meaning | Tailwind scale | PrimeVue severity |
|---|---|---|
| Success | `green` | `success` |
| Information | `blue` | `info` |
| Warning | `orange` | `warn` |
| Error, destructive | `red` | `danger` (`error` on `Message`) |
| Neutral action | `gray` | `secondary` |

Tinted semantic blocks pair shade `50` for the background with `500`–`700` for text (`bg-red-50 text-red-500`).

## 4. Dark mode

Dark mode is class-based: `.dark` on `<html>`. Tailwind's `dark:` variant and PrimeVue (`darkModeSelector: '.dark'`) both key off that class, so they can never disagree.

`useTheme()` owns the class.

```ts
import { useTheme } from '@gh-skeleton/ui';

const { theme, isDark, setTheme, toggleTheme } = useTheme();
```

- State is shared: every caller sees the same value.
- With no saved choice, the theme follows the operating system and updates live when it changes.
- `setTheme` / `toggleTheme` save the choice to `localStorage` under `ui-theme`.
- In the browser the class is applied as soon as the module is imported, so there is nothing to initialize.
- On a server (SSR or static generation) `useTheme()` does nothing and reports `light`. A server-rendered app must inline `themeInitScript` from `@gh-skeleton/ui/theme-script` in `<head>` so the class is set before first paint, and must keep theme-dependent markup inside `<ClientOnly>`.

## 5. Typography

Font family is Tailwind's default system sans stack. Neither app loads a web font.

| Role | Classes |
|---|---|
| Marketing hero title | `text-4xl md:text-5xl lg:text-6xl font-bold` |
| Marketing section title | `text-3xl md:text-4xl font-bold` (`UiSectionHeading`) |
| Page title | `text-2xl font-bold` |
| Card or section title | `text-xl font-semibold` |
| Sub-heading | `text-lg font-semibold` |
| Body | `text-base` |
| Label, secondary text | `text-sm` |
| Hint, caption, validation | `text-xs` |

Weights in use: `font-normal`, `font-medium`, `font-semibold`, `font-bold`. Labels are `font-semibold`.

`text-md` is not a Tailwind class and produces no CSS. Use `text-base`.

## 6. Spacing, radius, shadow

**Spacing.** Tailwind's 4px scale. The steps in regular use:

| Step | Use |
|---|---|
| `gap-2` | Between a control and its label or message |
| `gap-4`, `space-y-4`, `p-4` | Default gap between fields, card padding in the admin, page gutter |
| `p-6`, `p-8` | Marketing card padding |
| `gap-8` | Marketing card grids |
| `py-20` | Marketing section rhythm |

**Radius.**

| Class | Use |
|---|---|
| `rounded-md` | Small inline elements: progress bars, segmented controls |
| `rounded-lg` | Buttons, inputs, tiles, menu items |
| `rounded-xl` | Cards |
| `rounded-2xl` | Hero media |
| `rounded-full` | Avatars, badges, icon circles |

**Shadow.**

| Class | Use |
|---|---|
| `shadow-md` | Elevated cards (admin) |
| `shadow-lg` | Hover state of outlined cards, highlighted cards, forms on marketing pages |
| `shadow-lg shadow-primary/25` | Primary call-to-action glow |

**Breakpoints.** Tailwind defaults. `md` (768px) switches stacked to side-by-side. `xl` (1280px) switches `UiFormGroup` to its horizontal layout.

**Fixed widths.** Form action buttons use `w-full md:w-32`.

## 7. Icons

- **Admin:** PrimeIcons, as classes: `<i class="pi pi-plus" />` or the `icon` prop of a PrimeVue component.
- **Landing:** no icon font is loaded. Use text glyphs or inline SVG.
- Core components that take an `icon` prop (`UiEmptyState`, `UiWrapIcon`) accept any icon-font class and offer a slot for apps without PrimeIcons.

Common actions: `pi-plus` add, `pi-pencil` edit, `pi-trash` delete, `pi-eye` view, `pi-search` search, `pi-filter` filter, `pi-times` close.

An icon-only button needs an `aria-label`.

## 8. Components

### Core — `@gh-skeleton/ui`

| Component | Purpose | Key props | Slots |
|---|---|---|---|
| `UiButton` | Button or link where PrimeVue is not available | `variant` `primary`\|`secondary`\|`outline`\|`ghost`\|`danger`, `size` `sm`\|`md`\|`lg`, `href`, `block`, `loading`, `disabled`, `type`, `label` | default |
| `UiInput` | Labelled text input with `v-model` | `label`, `type`, `error`, `hint`; other attributes reach the `<input>` | `label` |
| `UiCard` | Surface container | `variant` `elevated`\|`outlined`, `padding` `sm`\|`md`\|`lg`, `hoverable`, `highlighted` | default, `header`, `footer` |
| `UiCardHeader` | Title row with actions on the right | `title`, `subtitle` | default (actions), `title` |
| `UiBadge` | Pill label | `variant` `primary`\|`neutral`\|`success`\|`info`\|`warn`\|`danger`, `size` `sm`\|`md`, `label` | default |
| `UiEmptyState` | Placeholder for an empty list or page | `icon`, `title`, `description` | `icon`, `title`, `description`, `actions` |
| `UiLoading` | Inline loading indicator that fills its parent | `message` | — |
| `UiSpinner` | Bare spinner; size with `size-*`, color with `text-*` | `label` | — |
| `UiWrapIcon` | Circle holding an icon or initial | `icon`, `size`, `bgColor`, `iconColor` | default |
| `UiPercentage` | Progress bar with percentage and count | `percentage`, `total`, `current`, `class*` overrides | — |
| `UiContainer` | Centered max-width wrapper | `size` `sm` (3xl)\|`md` (5xl)\|`lg` (6xl) | default |
| `UiSection` | Marketing page band with container | `tone` `default`\|`muted`, `size` | default |
| `UiSectionHeading` | Centered kicker, title, subtitle | `kicker`, `title`, `subtitle` | default (title) |

### PrimeVue — `@gh-skeleton/ui/prime`

| Component | Purpose | Key props / events |
|---|---|---|
| `UiFormGroup` | Label, hint, control, and error layout | `label`, `inputId`, `hint`, `error`, `isRequired`, `isOptional`, `variant` `horizontal`\|`vertical`. Slots: default, `label`, `hint`, `error` |
| `UiFormField` | `UiFormGroup` plus the validation message of a `@primevue/forms` field | `label`, `name`, `form`, plus `UiFormGroup` props. Defaults to `vertical` |
| `UiSearch` | Search input with icon button | `v-model`, `placeholder` |
| `UiPagination` | Page summary and paginator | `v-model` `{ page, pageCount, rows, totalRecords }`, `noPadding`; `@page` |
| `UiSwitch` | Segmented control | `v-model` `{ label, value }`, `options`; `@change` |
| `UiFileUpload` | Image picker with preview | `previewUrl`, `label`, `accept`, `hint`; `@select`, `@remove` |
| `UiAdvanceFilter` | Filter button with popover | `count` (badge, hidden at 0); `@apply`, `@reset`. Slot: filter fields |
| `UiToast` | Mount once at the app root | Driven by `useGlobalToast().showToast()` |
| `UiConfirmDialog` | Mount once at the app root | Driven by `useGlobalConfirm().showConfirm()` |
| `UiGlobalLoading` | Mount once at the app root | Driven by `useGlobalLoading().show()` / `hide()` |

The admin wraps the three global composables in `@/helpers/toast.ts` and `@/helpers/loading.ts` (`showToast`, `showConfirm`, `showLoading`, `hideLoading`). Call those helpers from pages.

### Admin-only

The `UiSidebar*` components stay in `apps/admin/src/components` because they depend on the router and the auth store.

### Choosing a button

| Context | Use |
|---|---|
| Admin | PrimeVue `Button` with `severity` and `variant` |
| Landing and other PrimeVue-free pages | `UiButton` |

Admin button conventions:

| Action | Props |
|---|---|
| Primary (save, create) | default severity |
| Cancel, back | `severity="secondary"` |
| Row action | `variant="text"` or `variant="outlined"`, `size="small"` |
| Destructive | `severity="danger"`, behind `showConfirm({ type: 'danger' })` |

## 9. Page patterns

### Form page (admin)

```vue
<UiCard class="max-w-2xl mx-auto">
  <template #header>
    <h1 class="text-xl font-semibold">Add Merchant</h1>
  </template>

  <Form v-slot="$form" :resolver="resolver" :initialValues="initialValues" class="flex flex-col gap-4 w-full" @submit="onFormSubmit">
    <div class="w-full space-y-4">
      <UiFormField label="Name" name="name" :form="$form">
        <InputText name="name" fluid />
      </UiFormField>
    </div>

    <div class="w-full flex justify-end gap-4">
      <Button severity="secondary" label="Cancel" class="w-full md:w-32" @click="onCancel" />
      <Button type="submit" label="Save" class="w-full md:w-32" />
    </div>
  </Form>
</UiCard>
```

Use `UiFormField` for every validated field. Use plain `UiFormGroup` only when the field has no validation message (read-only values, toggles) or needs extra content between the control and the error.

### List page (admin)

1. Toolbar row: `UiSearch` on the left, primary `Button` on the right.
2. `UiCard` containing a PrimeVue `DataTable`.
3. `UiPagination` in the card footer.
4. Empty table: the `DataTable` `#empty` slot, or `UiEmptyState` for a whole empty page.

### Detail page (admin)

`UiCard` with a header, rows of `text-sm text-gray-500` labels above `text-base` values, and actions in the header or footer.

### Auth page (admin)

Layout `auth`: full-height `bg-primary` (`dark:bg-dark`) with one centered `UiCard`.

### Content page (landing)

Every page except the home page starts with `PageHeader` (title band that clears the fixed header), followed by `UiSection` blocks. Long-form Markdown is wrapped in `class="prose-legal"`.

### Marketing section (landing)

```vue
<UiSection id="features" tone="muted">
  <UiSectionHeading title="Key Features" subtitle="Everything you need." />
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
    <UiCard variant="outlined" padding="md" hoverable>…</UiCard>
  </div>
</UiSection>
```

Alternate `tone="default"` and `tone="muted"` down the page.

## 10. Accessibility

- Link every label to its control: `UiInput` does this itself; with `UiFormGroup` pass `inputId` and set the same `id` on the control.
- Icon-only buttons need an `aria-label`.
- Keep the focus ring. Core components use `focus-visible:outline-primary` or `focus:ring-primary`.
- Do not rely on color alone for state: pair it with text or an icon.
- White text on `primary-500` (`#FE7A36`) has a contrast ratio of about 2.6:1. WCAG AA asks for 4.5:1 on normal text and 3:1 on large text, so this pairing meets neither. It is the existing brand treatment for buttons; do not extend it to body copy or small text. Where AA matters, `primary-800` on white reaches about 5.4:1.
- Mark required fields with `isRequired` and enforce the rule in the validation schema as well.

## 11. Extending the system

**Add a token.** Add a `--color-*` variable to `packages/ui/src/styles/tokens.css` and document it in section 3. The utilities exist as soon as the variable does.

**Add a component.**

1. Put it in `packages/ui/src/core` if it has no PrimeVue import, otherwise `packages/ui/src/prime`.
2. Name it `Ui<Name>.vue`. Use `<script setup lang="ts">` with typed `defineProps`.
3. Write class names as complete literal strings. Tailwind cannot see names built by concatenation.
4. Import PrimeVue components explicitly. Auto-import does not apply inside the package.
5. Export it from the matching `index.ts` and add its name to `packages/ui/resolver.js`.
6. Add a row to the catalog in section 8.

**Keep it in the app instead** when the component needs the router, a store, or an API call.

**Verify.**

```bash
pnpm --filter @gh-skeleton/ui typecheck
pnpm --filter gh-skeleton-app build
pnpm --filter @gh-skeleton/landing build
```
