<template>
  <UiToast />
  <UiConfirmDialog />
  <UiGlobalLoading />

  <component :is="currentLayout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import DefaultLayout from '@/layouts/default.vue';
import AuthLayout from '@/layouts/auth.vue';

import { UiToast, UiConfirmDialog, UiGlobalLoading } from '@gh-skeleton/ui/prime';

import { useAuthStore } from '@/modules/auth/stores/index.ts';

const router = useRouter();
const authStore = useAuthStore();
const { deviceType } = storeToRefs(authStore);

const currentLayout = computed(() => {
  const layout = router.currentRoute.value.meta?.layout;
  if (layout === 'auth') return AuthLayout;
  return DefaultLayout;
});

// Watch device type changes (example logic, can be modified as needed)
const innerWidth = ref(window.innerWidth);

const updateDeviceType = (newWidth: number) => {
  if (newWidth <= 768) {
    deviceType.value = 'mobile';
  } else if (newWidth <= 1024) {
    deviceType.value = 'tablet';
  } else {
    deviceType.value = 'web';
  }
};

const handleResize = () => {
  innerWidth.value = window.innerWidth;
};

watch(innerWidth, updateDeviceType, { immediate: true });

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
