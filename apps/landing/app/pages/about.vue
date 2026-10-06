<template>
  <div>
    <PageHeader
      :title="t.about.title"
      :subtitle="t.about.subtitle"
    />

    <UiSection size="sm">
      <h2 class="text-2xl font-bold text-navy dark:text-white mb-4">
        {{ t.about.misi.title }}
      </h2>
      <p
        v-for="(paragraph, index) in t.about.misi.paragraf"
        :key="index"
        class="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed"
      >
        {{ paragraph }}
      </p>
    </UiSection>

    <UiSection tone="muted">
      <UiSectionHeading :title="t.about.nilai.title" />
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <UiCard
          v-for="(item, index) in t.about.nilai.items"
          :key="index"
          variant="outlined"
          padding="md"
        >
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">{{ item.title }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">{{ item.description }}</p>
          </div>
        </UiCard>
      </div>
    </UiSection>
  </div>
</template>

<script setup lang="ts">
import { UiCard, UiSection, UiSectionHeading } from '@gh-skeleton/ui'

const t = useMessages()

useSeoMeta({
  title: () => t.value.about.title,
  description: () => t.value.about.subtitle,
})
</script>
