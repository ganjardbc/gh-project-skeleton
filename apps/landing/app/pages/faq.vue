<template>
  <div>
    <PageHeader
      :title="t.faq.title"
      :subtitle="t.faq.subtitle"
    />

    <UiSection size="sm">
      <FaqItem
        v-for="(item, index) in t.faq.items"
        :key="index"
        :question="item.question"
        :answer="item.answer"
      />
    </UiSection>
  </div>
</template>

<script setup lang="ts">
import { UiSection } from '@gh-skeleton/ui'

const t = useMessages()

useSeoMeta({
  title: () => t.value.faq.title,
  description: () => t.value.faq.subtitle,
})
</script>
