<template>
  <div
    class="relative rounded-full flex items-center justify-center shrink-0"
    :class="[bgColor, iconColor]"
    :style="{ width: size, height: size }"
  >
    <slot>
      <i :class="icon" />
    </slot>
  </div>
</template>
<script setup lang="ts">
withDefaults(defineProps<{
  // Icon-font class, e.g. `pi pi-user`. Omit it when using the default slot.
  icon?: string;
  size?: string;
  bgColor?: string;
  iconColor?: string;
}>(), {
  size: '48px',
  bgColor: 'bg-primary-600',
  iconColor: 'text-gray-100',
});
</script>
