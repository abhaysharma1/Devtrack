import { describe, it, expect, vi, beforeEach } from "vitest"

const mockMilestoneRepo = vi.hoisted(() => ({
  findById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}))

const mockActivityLogRepo = vi.hoisted(() => ({ create: vi.fn() }))

vi.mock("@/repositories/milestone.repository", () => ({
  milestoneRepository: mockMilestoneRepo,
}))
vi.mock("@/repositories/activity-log.repository", () => ({
  activityLogRepository: mockActivityLogRepo,
}))

import { milestoneService } from "@/services/milestone.service"

describe("milestoneService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createMilestone", () => {
    it("creates milestone when project found and user is teacher", async () => {
      mockMilestoneRepo.findById.mockResolvedValue({
        project: { class: { teacherId: "t1" } },
      } as any)
      mockMilestoneRepo.create.mockResolvedValue({ id: "m1", title: "Setup" })

      const result = await milestoneService.createMilestone(
        { projectId: "p1", title: "Setup", order: 1, weight: 1 },
        "t1"
      )
      expect(result.title).toBe("Setup")
    })

    it("throws when project not found", async () => {
      mockMilestoneRepo.findById.mockResolvedValue(null)
      await expect(
        milestoneService.createMilestone({ projectId: "bad", title: "Setup", order: 1, weight: 1 }, "t1")
      ).rejects.toThrow("Project not found")
    })
  })

  describe("updateMilestone", () => {
    it("allows teacher to update status", async () => {
      mockMilestoneRepo.findById.mockResolvedValue({
        id: "m1",
        title: "Setup",
        projectId: "p1",
        project: { ownerId: "s1", class: { teacherId: "t1" } },
      } as any)
      mockMilestoneRepo.update.mockResolvedValue({ id: "m1", status: "APPROVED" })

      const result = await milestoneService.updateMilestone("m1", { status: "APPROVED" }, "t1", "TEACHER")
      expect(result.status).toBe("APPROVED")
    })

    it("throws when milestone not found", async () => {
      mockMilestoneRepo.findById.mockResolvedValue(null)
      await expect(
        milestoneService.updateMilestone("bad", { title: "Updated" }, "t1", "TEACHER")
      ).rejects.toThrow("Milestone not found")
    })

    it("does not allow student to set non-SUBMITTED status", async () => {
      mockMilestoneRepo.findById.mockResolvedValue({
        id: "m1",
        projectId: "p1",
        title: "Test",
        project: { ownerId: "s1", class: { teacherId: "t1" } },
      } as any)

      await expect(
        milestoneService.updateMilestone("m1", { status: "APPROVED" }, "s1", "STUDENT")
      ).rejects.toThrow("Only teachers can change status to that value")
    })
  })

  describe("deleteMilestone", () => {
    it("deletes milestone when user is teacher", async () => {
      mockMilestoneRepo.findById.mockResolvedValue({
        id: "m1",
        projectId: "p1",
        project: { ownerId: "s1", class: { teacherId: "t1" } },
      } as any)
      mockMilestoneRepo.delete.mockResolvedValue({})
      const result = await milestoneService.deleteMilestone("m1", "t1", "TEACHER")
      expect(result.success).toBe(true)
    })

    it("throws when milestone not found", async () => {
      mockMilestoneRepo.findById.mockResolvedValue(null)
      await expect(
        milestoneService.deleteMilestone("bad", "t1", "TEACHER")
      ).rejects.toThrow("Milestone not found")
    })

    it("throws when user is not authorized", async () => {
      mockMilestoneRepo.findById.mockResolvedValue({
        id: "m1",
        projectId: "p1",
        project: { ownerId: "s1", class: { teacherId: "t1" } },
      } as any)
      await expect(
        milestoneService.deleteMilestone("m1", "s2", "STUDENT")
      ).rejects.toThrow("Forbidden")
    })
  })
})
