import { getDB } from "@/services/indexeddb/db"
import type { BusinessNotification } from "@/lib/notification-service"

export const notificationRepository = {
  async create(data: Omit<BusinessNotification, "id" | "createdAt">): Promise<BusinessNotification> {
    const db = await getDB()
    const notification: BusinessNotification = {
      ...data,
      id: `notif_${crypto.randomUUID()}`,
      createdAt: new Date().toISOString(),
    }

    await db.put("notifications", notification)
    return notification
  },

  async findByBusinessId(businessId: string, recipientId?: string): Promise<BusinessNotification[]> {
    const db = await getDB()
    const allNotifications = await db.getAll("notifications")

    return allNotifications
      .filter((n: BusinessNotification) => {
        if (n.businessId !== businessId) return false
        if (recipientId && n.recipientId && n.recipientId !== recipientId) return false
        return true
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async markAsRead(id: string): Promise<void> {
    const db = await getDB()
    const notification = (await db.get("notifications", id)) as BusinessNotification
    if (notification) {
      notification.read = true
      await db.put("notifications", notification)
    }
  },

  async markAllAsRead(businessId: string, recipientId?: string): Promise<void> {
    const notifications = await this.findByBusinessId(businessId, recipientId)
    const db = await getDB()

    for (const notification of notifications) {
      if (!notification.read) {
        notification.read = true
        await db.put("notifications", notification)
      }
    }
  },

  async getUnreadCount(businessId: string, recipientId?: string): Promise<number> {
    const notifications = await this.findByBusinessId(businessId, recipientId)
    return notifications.filter((n) => !n.read).length
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete("notifications", id)
  },
}
