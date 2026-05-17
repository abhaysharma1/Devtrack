import { describe, it, expect, vi, beforeEach } from "vitest"

const mockProjectRepo = vi.hoisted(() => ({
  findMany: vi.fn(),
  create: vi.fn(),
  count: vi.fn(),
}))

const mockClassRepo = vi.hoisted(() => ({
  findById: vi.fn(),
}))

const mockActivityLogRepo = vi.hoisted(() => ({
  create: vi.fn(),
}))

vi.mock("@/repositories/project.repository", () => ({
  projectRepository: mockProjectRepo,
}))

vi.mock("@/repositories/class.repository", () => ({
  classRepository: mockClassRepo,
}))

vi.mock("@/repositories/activity-log.repository", () => ({
  activityLogRepository: mockActivityLogRepo,
}))

vi.mock("@/repositories/base.repository", () => ({
  paginateResponse: vi.fn((items, total) => ({ items, total })),
}))

import { projectService } from "@/services/project.service"

describe("projectService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createProject", () => {
    it("creates project when class exists", async () => {
      mockClassRepo.findById.mockResolvedValue({ id: "c1", name: "CS101" })
      mockProjectRepo.create.mockResolvedValue({ id: "p1", title: "My Project" })

      const result = await projectService.createProject(
        { title: "My Project", classId: "c1", techStack: ["React"] },
        "u1"
      )

      expect(result.title).toBe("My Project")
      expect(mockProjectRepo.create).toHaveBeenCalled()
      expect(mockActivityLogRepo.create).toHaveBeenCalled()
    })

    it("throws when class not found", async () => {
      mockClassRepo.findById.mockResolvedValue(null)

      await expect(
        projectService.createProject({ title: "My Project", classId: "bad-id", techStack: [] }, "u1")
      ).rejects.toThrow("Class not found")
    })
  })

  describe("getProjects", () => {
    it("filters by owner for STUDENT role", async () => {
      mockProjectRepo.findMany.mockResolvedValue([])
      await projectService.getProjects("STUDENT", "u1")
      expect(mockProjectRepo.findMany).toHaveBeenCalledWith({ ownerId: "u1" }, undefined)
    })

    it("returns all for non-STUDENT role", async () => {
      mockProjectRepo.findMany.mockResolvedValue([])
      await projectService.getProjects("TEACHER", "u1")
      expect(mockProjectRepo.findMany).toHaveBeenCalledWith(undefined, undefined)
    })
  })
})
