import { describe, it, expect, vi, beforeEach } from "vitest"

const mockProject = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  count: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: { project: mockProject },
}))

import { projectRepository } from "@/repositories/project.repository"

describe("projectRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("findMany includes owner, class, and counts", async () => {
    mockProject.findMany.mockResolvedValue([])
    await projectRepository.findMany({ ownerId: "1" })
    expect(mockProject.findMany).toHaveBeenCalledWith({
      where: { ownerId: "1" },
      include: {
        owner: { select: { name: true, image: true } },
        class: { select: { name: true, code: true } },
        _count: { select: { milestones: true, comments: true } },
      },
      orderBy: { updatedAt: "desc" },
    })
  })

  it("findById calls with optional include", async () => {
    mockProject.findUnique.mockResolvedValue({ id: "p1" })
    await projectRepository.findById("p1", { owner: true })
    expect(mockProject.findUnique).toHaveBeenCalledWith({ where: { id: "p1" }, include: { owner: true } })
  })

  it("create passes data through", async () => {
    mockProject.create.mockResolvedValue({ id: "p1", title: "Test" })
    const result = await projectRepository.create({ title: "Test" })
    expect(result.title).toBe("Test")
  })
})
