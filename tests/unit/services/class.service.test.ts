import { describe, it, expect, vi, beforeEach } from "vitest"

const mockClassRepo = vi.hoisted(() => ({
  findByCode: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  count: vi.fn(),
}))

vi.mock("@/repositories/class.repository", () => ({
  classRepository: mockClassRepo,
}))

vi.mock("@/repositories/base.repository", () => ({
  paginateResponse: vi.fn((items, total) => ({ items, total })),
}))

import { classService } from "@/services/class.service"

describe("classService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createClass", () => {
    it("creates class when code is unique", async () => {
      mockClassRepo.findByCode.mockResolvedValue(null)
      mockClassRepo.create.mockResolvedValue({ id: "c1", name: "CS101", code: "CS101-2025" })

      const result = await classService.createClass(
        { name: "CS101", code: "CS101-2025", semester: "Fall", year: 2025 },
        "u1"
      )

      expect(result.id).toBe("c1")
      expect(mockClassRepo.create).toHaveBeenCalledWith({
        name: "CS101",
        code: "CS101-2025",
        semester: "Fall",
        year: 2025,
        creatorId: "u1",
        teacherId: "u1",
      })
    })

    it("throws when code already exists", async () => {
      mockClassRepo.findByCode.mockResolvedValue({ id: "c1" })

      await expect(
        classService.createClass({ name: "CS101", code: "CS101-2025", semester: "Fall", year: 2025 }, "u1")
      ).rejects.toThrow("Class code already exists")
    })
  })

  describe("getClasses", () => {
    it("returns all for ADMIN", async () => {
      mockClassRepo.findMany.mockResolvedValue([])
      await classService.getClasses("ADMIN", "u1")
      expect(mockClassRepo.findMany).toHaveBeenCalledWith(undefined, undefined)
    })

    it("filters by teacherId for non-ADMIN", async () => {
      mockClassRepo.findMany.mockResolvedValue([])
      await classService.getClasses("TEACHER", "u1")
      expect(mockClassRepo.findMany).toHaveBeenCalledWith({ teacherId: "u1" }, undefined)
    })
  })
})
