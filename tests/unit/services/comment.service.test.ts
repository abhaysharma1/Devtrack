import { describe, it, expect, vi, beforeEach } from "vitest"

const mockProjectRepo = vi.hoisted(() => ({ findById: vi.fn() }))
const mockCommentRepo = vi.hoisted(() => ({
  create: vi.fn(),
  findManyByProject: vi.fn(),
  count: vi.fn(),
}))
const mockNotifRepo = vi.hoisted(() => ({ create: vi.fn() }))
const mockActivityLogRepo = vi.hoisted(() => ({ create: vi.fn() }))

vi.mock("@/repositories/project.repository", () => ({
  projectRepository: mockProjectRepo,
}))
vi.mock("@/repositories/comment.repository", () => ({
  commentRepository: mockCommentRepo,
}))
vi.mock("@/repositories/notification.repository", () => ({
  notificationRepository: mockNotifRepo,
}))
vi.mock("@/repositories/activity-log.repository", () => ({
  activityLogRepository: mockActivityLogRepo,
}))
vi.mock("@/repositories/base.repository", () => ({
  paginateResponse: vi.fn((items, total) => ({ items, total })),
}))
vi.mock("@/lib/sse", () => ({ pushEvent: vi.fn() }))

import { commentService } from "@/services/comment.service"

describe("commentService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("addComment", () => {
    it("adds comment and notifies project owner", async () => {
      mockProjectRepo.findById.mockResolvedValue({ id: "p1", title: "My Project", ownerId: "u2" })
      mockCommentRepo.create.mockResolvedValue({ id: "c1", content: "Nice work!" })
      mockNotifRepo.create.mockResolvedValue({})

      const result = await commentService.addComment(
        { content: "Nice work!", projectId: "p1" },
        "u1", "STUDENT", "Alice"
      )

      expect(result.id).toBe("c1")
      expect(mockNotifRepo.create).toHaveBeenCalled()
      expect(mockActivityLogRepo.create).toHaveBeenCalled()
    })

    it("does not notify when commenting on own project", async () => {
      mockProjectRepo.findById.mockResolvedValue({ id: "p1", title: "My Project", ownerId: "u1" })
      mockCommentRepo.create.mockResolvedValue({ id: "c1", content: "Self comment" })

      await commentService.addComment(
        { content: "Self comment", projectId: "p1" },
        "u1", "STUDENT", "Alice"
      )

      expect(mockNotifRepo.create).not.toHaveBeenCalled()
    })

    it("throws when project not found", async () => {
      mockProjectRepo.findById.mockResolvedValue(null)
      await expect(
        commentService.addComment({ content: "Comment", projectId: "bad" }, "u1", "STUDENT", "Alice")
      ).rejects.toThrow("Project not found")
    })
  })

  describe("getComments", () => {
    it("returns paginated comments", async () => {
      mockCommentRepo.findManyByProject.mockResolvedValue([{ id: "c1" }])
      mockCommentRepo.count.mockResolvedValue(1)

      const result = await commentService.getComments("p1", { limit: 10 })
      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)
    })
  })
})
