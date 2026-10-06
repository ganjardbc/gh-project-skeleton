export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  unread?: boolean;
}

export interface NotificationListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}
