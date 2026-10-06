<template>
  <div class="w-full flex flex-col justify-center items-center py-16">
    <div class="text-center">
      <slot name="icon">
        <i
          class="text-6xl! text-gray-400 mb-4 block"
          :class="icon"
        ></i>
      </slot>

      <slot name="title">
        <h2 class="text-xl font-bold mb-2">{{ title }}</h2>
      </slot>

      <slot name="description">
        <p class="text-sm text-gray-400">{{ description }}</p>
      </slot>

      <slot name="actions"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
withDefaults(defineProps<{
  // Icon-font class. The default needs PrimeIcons; use the `icon` slot without it.
  icon?: string;
  title?: string;
  description?: string;
}>(), {
  icon: 'pi pi-info-circle',
  title: 'No data',
  description: 'There is no data to display yet.',
});
</script>
