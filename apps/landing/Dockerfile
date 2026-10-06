FROM node:22-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN corepack prepare pnpm@10.22.0 --activate
WORKDIR /app

# The site is generated statically: these values are fixed into the HTML at build time.
ARG NUXT_PUBLIC_WEB_BASE_URL=https://gh-skeleton-fe-production.up.railway.app
ENV NUXT_PUBLIC_WEB_BASE_URL=$NUXT_PUBLIC_WEB_BASE_URL
ARG NUXT_PUBLIC_API_BASE_URL=https://gh-skeleton-api-production.up.railway.app
ENV NUXT_PUBLIC_API_BASE_URL=$NUXT_PUBLIC_API_BASE_URL
ARG NUXT_PUBLIC_SITE_URL
ENV NUXT_PUBLIC_SITE_URL=$NUXT_PUBLIC_SITE_URL

COPY apps/landing/ .
# @gh-skeleton/ui is source-only: link it so its imports resolve from this app's node_modules.
COPY packages/ui/package.json packages/ui/resolver.js packages/ui/resolver.d.ts ./vendor/ui/
COPY packages/ui/src ./vendor/ui/src
RUN node -e "const fs=require('fs');const p='package.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.dependencies['@gh-skeleton/ui']='link:./vendor/ui';fs.writeFileSync(p,JSON.stringify(j,null,2));"
RUN pnpm install --no-frozen-lockfile
RUN pnpm build

FROM nginx:stable-alpine AS production
COPY --from=build /app/.output/public /usr/share/nginx/html
COPY --from=build /app/default.conf /etc/nginx/templates/default.conf.template
ENV PORT=80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
