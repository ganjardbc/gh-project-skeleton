<template>
  <div
    class="relative flex flex-col gap-4 rounded-xl bg-white dark:bg-dark-secondary"
    :class="[
      PADDINGS[padding],
      variant === 'elevated' ? 'shadow-md dark:shadow-xl' : 'border',
      variant === 'outlined' && (highlighted ? 'border-primary shadow-lg' : 'border-gray-200 dark:border-dark-line'),
      { 'transition-shadow hover:shadow-lg': hoverable },
    ]"
  >
    <div
      v-if="$slots.header"
      class="w-full pb-4 border-b border-gray-200 dark:border-dark-line"
    >
      <slot name="header" />
    </div>

    <slot />

    <div
      v-if="$slots.footer"
      class="w-full pt-4 border-t border-gray-200 dark:border-dark-line"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
<script setup lang="ts">
type Padding = 'sm' | 'md' | 'lg';

const PADDINGS: Record<Padding, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

withDefaults(defineProps<{
  // elevated: shadow, no border (app surfaces). outlined: border, no shadow (marketing).
  variant?: 'elevated' | 'outlined';
  padding?: Padding;
  hoverable?: boolean;
  // Outlined only: brand border, for the one card that should stand out.
  highlighted?: boolean;
}>(), {
  variant: 'elevated',
  padding: 'sm',
});
</script>
