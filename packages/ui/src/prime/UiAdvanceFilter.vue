<template>
  <component
    :is="count > 0 ? OverlayBadge : 'span'"
    v-bind="count > 0 ? { value: count, severity: 'danger' } : { class: 'inline-flex' }"
  >
    <Button
      severity="secondary"
      variant="outlined"
      class="w-[100px]"
      size="medium"
      @click="popover?.toggle($event)"
    >
      <i class="pi pi-filter" />
      Filter
    </Button>
  </component>

  <Popover
    ref="popover"
    class="w-[380px]"
  >
    <div class="font-semibold mb-2">
      Filter By
    </div>

    <slot />

    <div class="flex items-center justify-end gap-2 mt-4">
      <Button
        label="Reset"
        severity="secondary"
        variant="text"
        size="small"
        class="w-[90px]"
        @click="$emit('reset')"
      />
      <Button
        label="Apply"
        severity="primary"
        size="small"
        class="w-[90px]"
        @click="$emit('apply')"
      />
    </div>
  </Popover>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import OverlayBadge from 'primevue/overlaybadge';
import Popover from 'primevue/popover';

withDefaults(defineProps<{
  // Number of active filters, shown as a badge. Hidden at 0.
  count?: number;
}>(), {
  count: 0,
});

defineEmits<{
  reset: []
  apply: []
}>();

const popover = ref<InstanceType<typeof Popover>>();
</script>
