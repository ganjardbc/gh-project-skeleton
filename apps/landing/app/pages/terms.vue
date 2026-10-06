<template>
  <div>
    <PageHeader
      :title="t.terms.title"
      :subtitle="t.terms.subtitle"
    >
      <template
        v-if="doc?.draft"
        #badge
      >
        <UiBadge
          variant="warn"
          size="md"
          class="mb-4"
        >
          {{ t.terms.draf }}
        </UiBadge>
      </template>
    </PageHeader>

    <UiSection size="sm">
      <ContentRenderer
        v-if="doc"
        :value="doc"
        class="prose-legal"
      />
      <p
        v-else
        class="text-center text-gray-500 dark:text-gray-400"
      >
        {{ t.terms.tidakAda }}
      </p>
    </UiSection>
  </div>
</template>

<script setup lang="ts">
import { UiBadge, UiSection } from '@gh-skeleton/ui'

const t = useMessages()
const { locale } = useI18n()

// The text lives in content/<locale>/terms.md.
const { data: doc } = await useAsyncData(
  () => `terms-${locale.value}`,
  () => queryCollection('legal').path(`/${locale.value}/terms`).first(),
  { watch: [locale] },
)

useSeoMeta({
  title: () => t.value.terms.title,
  description: () => t.value.terms.subtitle,
})
</script>
