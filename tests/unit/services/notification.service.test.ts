import type { PaginatedResult } from "@/validators/common"
import { describe, it, expect, vi, beforeEach } from "vitest"

const mockNotifRepo = vi.hoisted(() => ({
  findManyByUser: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
}))

vi.mock("@/repositories/notification.repository", () => ({
  notificationRepository: mockNotifRepo,
}))

vi.mock("@/repositories/base.repository", () => ({
  paginateResponse: vi.fn((items, total) => ({ items, total })),
}))

import { notificationService } from "@/services/notification.service"

describe("notificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("listNotifications", () => {
    it("returns paginated notifications", async () => {
      mockNotifRepo.findManyByUser.mockResolvedValue([{ id: "n1" }])
      mockNotifRepo.count.mockResolvedValue(1)

      const result = await notificationService.listNotifications("u1", { limit: 10 }) as PaginatedResult<unknown>
      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })

  describe("getUnreadCount", () => {
    it("returns unread count", async () => {
      mockNotifRepo.count.mockResolvedValue(3)
      const result = await notificationService.getUnreadCount("u1")
      expect(result).toBe(3)
      expect(mockNotifRepo.count).toHaveBeenCalledWith({ recipientId: "u1", isRead: false })
    })
  })

  describe("markAsRead", () => {
    it("marks notification as read when owned by user", async () => {
      mockNotifRepo.findById.mockResolvedValue({ id: "n1", recipientId: "u1" })
      mockNotifRepo.update.mockResolvedValue({ id: "n1", isRead: true })

      const result = await notificationService.markAsRead("n1", "u1")
      expect(result.isRead).toBe(true)
    })

    it("throws when notification not owned by user", async () => {
      mockNotifRepo.findById.mockResolvedValue({ id: "n1", recipientId: "u2" })
      await expect(notificationService.markAsRead("n1", "u1")).rejects.toThrow("Notification not found")
    })

    it("throws when notification not found", async () => {
      mockNotifRepo.findById.mockResolvedValue(null)
      await expect(notificationService.markAsRead("n1", "u1")).rejects.toThrow("Notification not found")
    })
  })

  describe("markAllAsRead", () => {
    it("updates all unread notifications", async () => {
      mockNotifRepo.updateMany.mockResolvedValue({ count: 2 })
      await notificationService.markAllAsRead("u1")
      expect(mockNotifRepo.updateMany).toHaveBeenCalledWith(
        { recipientId: "u1", isRead: false },
        { isRead: true }
      )
    })
  })

  describe("deleteNotification", () => {
    it("deletes notification when owned by user", async () => {
      mockNotifRepo.findById.mockResolvedValue({ id: "n1", recipientId: "u1" })
      mockNotifRepo.delete.mockResolvedValue({})

      const result = await notificationService.deleteNotification("n1", "u1")
      expect(result.success).toBe(true)
    })

    it("throws when not owned by user", async () => {
      mockNotifRepo.findById.mockResolvedValue({ id: "n1", recipientId: "u2" })
      await expect(notificationService.deleteNotification("n1", "u1")).rejects.toThrow("Notification not found")
    })
  })
})
