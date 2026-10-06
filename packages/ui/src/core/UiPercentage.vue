<template>
  <div class="flex flex-col gap-2">
    <div class="w-full flex justify-between items-center">
      <div
        class="text-sm text-gray-500"
        :class="classPercentage"
      >
        {{ percentage }}%
      </div>
      <div
        class="text-sm text-gray-500"
        :class="classCurrentTotal"
      >
        {{ current ? `${current} /` : '' }}
        <span class="font-semibold">
          {{ total }}
        </span>
      </div>
    </div>
    <div
      class="relative w-full h-3 bg-gray-100 dark:bg-dark-line rounded-md overflow-hidden"
      :class="classWrapperSlider"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="clamped"
    >
      <div
        class="absolute top-0 left-0 h-3 bg-primary-500 rounded-md"
        :class="classContentSlider"
        :style="{ width: clamped + '%' }"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  percentage: number;
  total: number;
  current?: number;
  classCurrentTotal?: string;
  classPercentage?: string;
  classWrapperSlider?: string;
  classContentSlider?: string;
}>();

const clamped = computed(() => Math.min(100, Math.max(0, props.percentage)));
</script>
