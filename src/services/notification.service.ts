import { notificationRepository } from "@/repositories/notification.repository"
import { paginateResponse } from "@/repositories/base.repository"
import type { PaginationInput } from "@/validators/common"

export const notificationService = {
  async listNotifications(userId: string, pagination?: PaginationInput) {
    const items = await notificationRepository.findManyByUser(userId, pagination)
    if (!pagination) return items
    const total = await notificationRepository.count({ recipientId: userId })
    return paginateResponse(items, total, pagination)
  },

  async getUnreadCount(userId: string) {
    return notificationRepository.count({ recipientId: userId, isRead: false })
  },

  async markAsRead(id: string, userId: string) {
    const notification = await notificationRepository.findById(id)
    if (!notification || notification.recipientId !== userId) {
      throw new Error("Notification not found")
    }
    return notificationRepository.update(id, { isRead: true })
  },

  async markAllAsRead(userId: string) {
    await notificationRepository.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    )
    return { success: true }
  },

  async deleteNotification(id: string, userId: string) {
    const notification = await notificationRepository.findById(id)
    if (!notification || notification.recipientId !== userId) {
      throw new Error("Notification not found")
    }
    await notificationRepository.delete(id)
    return { success: true }
  },
}
