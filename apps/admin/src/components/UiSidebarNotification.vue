<template>
  <div
    v-if="isCanRead"
    class="ui-sidebar-notification"
  >
    <div
      class="ui-sidebar-notification__toggle"
      @click="openNotificationMenu"
    >
      <OverlayBadge
        :severity="unreadCount > 0 ? 'success' : 'secondary'"
      >
        <Button
          severity="secondary" 
          variant="text"
          size="small"
          icon="pi pi-bell"
          aria-label="Notifications"
          rounded
        />
      </OverlayBadge>
    </div>
    <Popover
      ref="opNotificationMenu"
      position="right"
      class="ui-sidebar-notification__popper"
    >
      <div class="w-full pb-3">
        <div class="text-sm font-medium">
          Notifications({{ unreadCount }})
        </div>
      </div>

      <div class="w-80">
        <div
          v-if="loadingLatest && !latest.length"
          class="py-8"
        >
          <UiLoading message="Loading notifications..." />
        </div>
        <UiEmptyState
          v-else-if="!latest.length"
          icon="pi pi-bell-slash"
          title="No Notifications"
          description="You're all caught up!"
        />
        <div
          v-else
          class="divide-y divide-gray-200 dark:divide-dark-line"
        >
          <div
            v-for="item in latest"
            :key="item.id"
            class="flex items-start gap-2 py-2"
            :class="{ 'cursor-pointer': !item.is_read && isCanUpdate }"
            @click="onClickItem(item)"
          >
            <span
              class="mt-1.5 size-2 shrink-0 rounded-full"
              :class="item.is_read ? 'bg-transparent' : 'bg-primary'"
            ></span>
            <div class="min-w-0">
              <p
                class="text-sm truncate"
                :class="item.is_read ? 'font-medium' : 'font-semibold'"
              >
                {{ item.title }}
              </p>
              <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                {{ item.message }}
              </p>
              <p class="mt-1 text-xs text-gray-400">
                {{ formatDateTime(item.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full pt-3">
        <Button
          severity="secondary"
          variant="outlined"
          size="small"
          label="View All"
          fluid
          @click="onRouteViewAll"
        />
      </div>
    </Popover>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { UiEmptyState, UiLoading } from '@gh-skeleton/ui';
import { formatDateTime, getErrorMessage } from '@/helpers/utils.ts';
import { showToast } from '@/helpers/toast.ts';
import { isHasPermission } from '@/helpers/auth.ts';
import { PREFIX_ROUTE_NAME } from '@/modules/notification/services/constants.ts';
import { READ, UPDATE } from '@/modules/notification/services/rbac.ts';
import { useNotificationStore } from '@/modules/notification/stores';
import type { NotificationItem } from '@/modules/notification/services/types.ts';

defineProps<{
  isCollapsed?: boolean;
}>();

const emit = defineEmits(['navigate']);

const router = useRouter();
const notificationStore = useNotificationStore();
const { latest, unreadCount, loadingLatest } = storeToRefs(notificationStore);

// RBAC
const isCanRead = computed(() => isHasPermission(READ));
const isCanUpdate = computed(() => isHasPermission(UPDATE));

// The bell is decoration around the page; a failed refresh keeps the last known state.
const fetchLatest = async () => {
  if (!isCanRead.value) return;
  try {
    await notificationStore.fetchLatest();
  } catch (error) {
    console.log(error);
  }
};

const opNotificationMenu = ref();
const openNotificationMenu = (event: MouseEvent) => {
  opNotificationMenu.value.toggle(event);
  fetchLatest();
};

const onClickItem = async (item: NotificationItem) => {
  if (item.is_read || !isCanUpdate.value) return;
  try {
    await notificationStore.markAsRead(item.id);
  } catch (error) {
    showToast({
      type: 'error',
      title: 'Error.',
      message: getErrorMessage(error) || 'There was an error.',
    });
  }
};

const onRouteViewAll = () => {
  opNotificationMenu.value.hide();
  router.push({ name: PREFIX_ROUTE_NAME });
  emit('navigate');
};

onMounted(fetchLatest);
</script>
<style>
@reference "@/assets/styles/tailwind.css";

.ui-sidebar-notification {
  @apply relative;
}

.ui-sidebar-notification__toggle {
  @apply p-2 rounded-lg flex items-center gap-2;
}

.ui-sidebar-notification__popper.p-popover:before,
.ui-sidebar-notification__popper.p-popover:after {
  @apply hidden;
}
</style>
