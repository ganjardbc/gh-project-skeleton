<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-dark text-gray-900 dark:text-white transition-colors">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// Sets <html lang>, plus hreflang and canonical links for each language.
const head = useLocaleHead()
const t = useMessages()

useHead({
  htmlAttrs: { lang: () => head.value.htmlAttrs?.lang },
  link: () => head.value.link ?? [],
  meta: () => head.value.meta ?? [],
  titleTemplate: (title) => (title ? `${title} — ${t.value.meta.situs}` : t.value.meta.beranda.title),
})
</script>
