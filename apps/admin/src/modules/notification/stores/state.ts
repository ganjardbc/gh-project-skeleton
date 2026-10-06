import type { NotificationItem } from '@/modules/notification/services/types.ts';

export interface NotificationState {
  // Most recent notifications, shown in the sidebar popover.
  latest: NotificationItem[];
  unreadCount: number;
  loadingLatest: boolean;
}

export function state(): NotificationState {
  return {
    latest: [],
    unreadCount: 0,
    loadingLatest: false,
  };
}
