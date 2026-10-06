import {
  getListNotification,
  markAllNotificationAsRead,
  markNotificationAsRead,
} from '@/modules/notification/services/api.ts';
import type { NotificationState } from './state';

const LATEST_LIMIT = 5;

const loadLatest = async (store: NotificationState) => {
  const response = await getListNotification({ page: 1, limit: LATEST_LIMIT });
  const { data, meta } = response?.data?.data || {};

  store.latest = data || [];
  store.unreadCount = meta?.unreadCount || 0;
};

export const actions = {
  async fetchLatest(this: NotificationState) {
    this.loadingLatest = true;
    try {
      await loadLatest(this);
    } finally {
      this.loadingLatest = false;
    }
  },

  async markAsRead(this: NotificationState, id: string) {
    await markNotificationAsRead(id);
    await loadLatest(this);
  },

  async markAllAsRead(this: NotificationState) {
    await markAllNotificationAsRead();
    await loadLatest(this);
  },
};
