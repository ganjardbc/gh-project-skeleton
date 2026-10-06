# GH Skeleton Landing

Public marketing site for GH Skeleton: a home page (hero, features, pricing, testimonials, registration form) plus About, FAQ, and Terms & Conditions, in Indonesian and English.

Nuxt 4, generated as a static site. Components and design tokens come from `@gh-skeleton/ui`; see [`DESIGN.md`](../../DESIGN.md). Conventions for working in this app are in [`CLAUDE.md`](CLAUDE.md).

## Commands

Run from the repository root:

```bash
pnpm --filter @gh-skeleton/landing dev        # http://localhost:5174
pnpm --filter @gh-skeleton/landing build      # static site in .output/public
pnpm --filter @gh-skeleton/landing preview    # serve the generated site
pnpm --filter @gh-skeleton/landing typecheck
```

Requires Node 22.19 or newer.

## Environment

`apps/landing/.env` (template: `.env.sample`). Values are read at build time.

| Variable | Purpose | Fallback |
|---|---|---|
| `NUXT_PUBLIC_WEB_BASE_URL` | Admin app URL, used by the Login and Register links | `http://localhost:5173` |
| `NUXT_PUBLIC_API_BASE_URL` | API base URL, used by the registration form | `http://localhost:3000` |
| `NUXT_PUBLIC_SITE_URL` | Public URL of this site, used for canonical and hreflang links | `http://localhost:5174` |

## Pages

| Page | Indonesian | English |
|---|---|---|
| Home | `/` | `/en` |
| About | `/about` | `/en/about` |
| FAQ | `/faq` | `/en/faq` |
| Terms & Conditions | `/terms` | `/en/terms` |

## Where to edit content

| Content | Location |
|---|---|
| Page copy, FAQ entries, pricing plans | `app/locales/id.ts` and `app/locales/en.ts` |
| Terms & Conditions text | `content/id/terms.md` and `content/en/terms.md` |
| Images | `public/` |

The Terms & Conditions files are a placeholder outline marked `draft: true`. Replace the text with the reviewed legal version, then remove the `draft` line to hide the "Draft" badge.
