<template>
  <div class="w-full space-y-4">
    <div class="flex justify-between items-center gap-4">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ unreadCount }} unread
      </div>
      <Button
        icon="pi pi-check"
        label="Mark all as read"
        size="small"
        :disabled="!isCanUpdate || !unreadCount"
        :loading="markingAll"
        @click="handleMarkAll"
      />
    </div>

    <UiCard class="p-0! gap-0! overflow-hidden!">
      <div
        v-if="loading"
        class="py-16"
      >
        <UiLoading message="Loading notifications..." />
      </div>
      <UiEmptyState
        v-else-if="!notifications.length"
        icon="pi pi-bell-slash"
        title="No notifications"
        description="You don't have any notifications yet."
      />
      <div
        v-else
        class="divide-y divide-gray-200 dark:divide-dark-line"
      >
        <div
          v-for="item in notifications"
          :key="item.id"
          class="flex justify-between items-start gap-4 p-4"
          :class="{ 'bg-primary-25 dark:bg-dark-line': !item.is_read }"
        >
          <div class="flex items-start gap-3 min-w-0">
            <span
              class="mt-1.5 size-2 shrink-0 rounded-full"
              :class="item.is_read ? 'bg-transparent' : 'bg-primary'"
            ></span>
            <div class="min-w-0">
              <p :class="item.is_read ? 'font-medium' : 'font-semibold'">
                {{ item.title }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-300 break-words">
                {{ item.message }}
              </p>
              <p class="mt-1 text-xs text-gray-400">
                {{ formatDateTime(item.created_at) }}
              </p>
            </div>
          </div>
          <Button
            v-if="!item.is_read && isCanUpdate"
            label="Mark read"
            size="small"
            variant="text"
            class="shrink-0"
            :loading="markingId === item.id"
            @click="handleMarkAsRead(item)"
          />
        </div>
      </div>
      <UiPagination
        v-if="notifications.length"
        v-model="pagination"
        class="border-t border-gray-200 dark:border-dark-line"
        @page="onPageChange"
      />
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { UiCard, UiEmptyState, UiLoading } from '@gh-skeleton/ui';
import { UiPagination } from '@gh-skeleton/ui/prime';
import { formatDateTime, getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { getListNotification } from '@/modules/notification/services/api.ts';
import { UPDATE } from '@/modules/notification/services/rbac.ts';
import { useNotificationStore } from '@/modules/notification/stores';
import type { NotificationItem } from '@/modules/notification/services/types.ts';

const notificationStore = useNotificationStore();
// Shared with the sidebar bell, so both stay in sync.
const { unreadCount } = storeToRefs(notificationStore);

// RBAC
const isCanUpdate = computed(() => isHasPermission(UPDATE));

// Fetch Data
const loading = ref(false);
const notifications = ref<NotificationItem[]>([]);
const pagination = ref({
  page: 1,
  pageCount: 0,
  rows: 10,
  totalRecords: 0,
});

const showError = (error: unknown) => {
  showToast({
    type: 'error',
    title: 'Error.',
    message: getErrorMessage(error) || 'There was an error.',
  });
};

const fetchNotifications = async () => {
  try {
    loading.value = true;
    const response = await getListNotification({
      page: pagination.value.page,
      limit: pagination.value.rows,
    });
    const { data, meta } = response?.data?.data || {};

    notifications.value = data || [];
    unreadCount.value = meta?.unreadCount || 0;
    pagination.value.totalRecords = meta?.total || 0;
    pagination.value.pageCount = meta?.totalPages || 0;
  } catch (error) {
    showError(error);
  } finally {
    loading.value = false;
  }
};

const onPageChange = (event: any) => {
  pagination.value.page = event.page + 1;
  fetchNotifications();
};

// Actions
const markingId = ref('');
const markingAll = ref(false);

const handleMarkAsRead = async (item: NotificationItem) => {
  try {
    markingId.value = item.id;
    await notificationStore.markAsRead(item.id);
    item.is_read = true;
  } catch (error) {
    showError(error);
  } finally {
    markingId.value = '';
  }
};

const handleMarkAll = async () => {
  try {
    markingAll.value = true;
    await notificationStore.markAllAsRead();
    notifications.value.forEach((item) => {
      item.is_read = true;
    });
  } catch (error) {
    showError(error);
  } finally {
    markingAll.value = false;
  }
};

onMounted(fetchNotifications);
</script>
