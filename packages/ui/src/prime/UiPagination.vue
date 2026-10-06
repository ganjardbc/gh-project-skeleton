<template>
  <div
    class="w-full flex flex-col md:flex-row items-center justify-between gap-4"
    :class="{
      'px-4 py-2': !noPadding,
    }"
  >
    <div class="text-sm font-semibold">
      {{ summary }}
    </div>
    <Paginator
      v-model="pagination"
      :rows="pagination?.rows"
      :totalRecords="pagination?.totalRecords"
      @page="onPageChange"
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import Paginator from 'primevue/paginator';

type Pagination = {
  page: number;
  pageCount: number;
  rows: number;
  totalRecords: number;
};

defineProps<{
  noPadding?: boolean;
}>();

const pagination = defineModel<Pagination>({ required: true });

const emit = defineEmits(['page']);

const summary = computed(() => {
  const { page, pageCount, totalRecords } = pagination.value ?? {};
  return `Page ${page || '0'} - ${pageCount || '0'} (${totalRecords || '0'} data)`;
});

const onPageChange = (event: any) => {
  emit('page', event);
};
</script>
