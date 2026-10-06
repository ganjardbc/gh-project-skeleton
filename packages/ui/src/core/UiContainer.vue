<template>
  <div
    class="w-full mx-auto"
    :class="SIZES[size]"
  >
    <slot />
  </div>
</template>
<script setup lang="ts">
type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
};

withDefaults(defineProps<{
  size?: Size;
}>(), {
  size: 'lg',
});
</script>
