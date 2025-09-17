export type InboxNotification = {
  id: string;
  type: 'production' | 'inventory' | 'recipe' | 'info';
  title: string;
  message: string;
  link?: string;
  createdAt: string;
  read: boolean;
};

async function http<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    }
    return res.json();
  } catch (err) {
    throw err instanceof Error ? err : new Error('Network error');
  }
}

export const notificationsApi = {
  async create(input: Omit<InboxNotification, 'id' | 'createdAt' | 'read'>) {
    try {
      return await http<InboxNotification>('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch (e) {
      console.warn('Notifications: create failed', e);
      throw e;
    }
  },
  async list(unread?: boolean) {
    try {
      const q = unread ? '?unread=true' : '';
      return await http<InboxNotification[]>(`/api/notifications${q}`);
    } catch (e) {
      console.warn('Notifications: list failed, returning empty array', e);
      return [];
    }
  },
  async markRead(id: string, read: boolean) {
    try {
      return await http<InboxNotification>(`/api/notifications/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ read }),
      });
    } catch (e) {
      console.warn('Notifications: markRead failed (ignored)', e);
      return Promise.resolve({} as any);
    }
  },
  async markAllRead() {
    try {
      return await http<{ success: true }>(`/api/notifications/mark-all-read`, {
        method: 'POST',
      });
    } catch (e) {
      console.warn('Notifications: markAllRead failed (ignored)', e);
      return { success: true } as any;
    }
  },
};
