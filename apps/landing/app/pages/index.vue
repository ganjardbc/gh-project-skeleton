<template>
  <div>
    <HeroSection />
    <FeaturesSection />
    <PricingSection />
    <TestimonialsSection />
    <RegisterSection />
  </div>
</template>

<script setup lang="ts">
const t = useMessages()

useSeoMeta({
  description: () => t.value.meta.beranda.description,
  ogTitle: () => t.value.meta.beranda.title,
  ogDescription: () => t.value.meta.beranda.description,
})
</script>
