<template>
  <section
    class="py-20 px-4"
    :class="{ 'bg-cream dark:bg-dark-secondary': tone === 'muted' }"
  >
    <UiContainer :size="size">
      <slot />
    </UiContainer>
  </section>
</template>
<script setup lang="ts">
import UiContainer from './UiContainer.vue';

withDefaults(defineProps<{
  // muted: cream band, used to alternate with the default page background.
  tone?: 'default' | 'muted';
  size?: 'sm' | 'md' | 'lg';
}>(), {
  tone: 'default',
  size: 'lg',
});
</script>
