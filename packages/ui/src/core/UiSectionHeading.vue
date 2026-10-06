<template>
  <div class="text-center mb-12">
    <p
      v-if="kicker"
      class="text-primary font-semibold mb-2"
    >
      {{ kicker }}
    </p>
    <h2 class="text-3xl md:text-4xl font-bold text-navy dark:text-white">
      <slot>{{ title }}</slot>
    </h2>
    <p
      v-if="subtitle"
      class="mt-2 text-gray-500 dark:text-gray-400 max-w-xl mx-auto"
    >
      {{ subtitle }}
    </p>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
  kicker?: string;
}>();
</script>
