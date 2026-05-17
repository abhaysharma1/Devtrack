import { describe, it, expect, vi, beforeEach } from "vitest"

const mockTxClient = vi.hoisted(() => ({
  comment: { create: vi.fn() },
  notification: { create: vi.fn() },
  activityLog: { create: vi.fn() },
  user: { findUnique: vi.fn() },
}))

const mockPrisma = vi.hoisted(() => ({
  $transaction: vi.fn((cb: Function) => cb(mockTxClient)),
}))

const mockProjectRepo = vi.hoisted(() => ({ findById: vi.fn() }))
const mockCommentRepo = vi.hoisted(() => ({
  create: vi.fn(),
  findManyByProject: vi.fn(),
  count: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/repositories/project.repository", () => ({
  projectRepository: mockProjectRepo,
}))
vi.mock("@/repositories/comment.repository", () => ({
  commentRepository: mockCommentRepo,
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
      mockTxClient.comment.create.mockResolvedValue({ id: "c1", content: "Nice work!" })
      mockTxClient.notification.create.mockResolvedValue({})
      mockTxClient.user.findUnique.mockResolvedValue({ role: "STUDENT" })

      const result = await commentService.addComment(
        { content: "Nice work!", projectId: "p1" },
        "u1", "STUDENT", "Alice"
      )

      expect(result.id).toBe("c1")
      expect(mockTxClient.notification.create).toHaveBeenCalled()
      expect(mockTxClient.activityLog.create).toHaveBeenCalled()
    })

    it("does not notify when commenting on own project", async () => {
      mockProjectRepo.findById.mockResolvedValue({ id: "p1", title: "My Project", ownerId: "u1" })
      mockTxClient.comment.create.mockResolvedValue({ id: "c1", content: "Self comment" })

      await commentService.addComment(
        { content: "Self comment", projectId: "p1" },
        "u1", "STUDENT", "Alice"
      )

      expect(mockTxClient.notification.create).not.toHaveBeenCalled()
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
