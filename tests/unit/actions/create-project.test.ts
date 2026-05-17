import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

const mockSession = vi.hoisted(() => vi.fn())
vi.mock("@/lib/auth", () => ({ auth: mockSession }))

const mockService = vi.hoisted(() => ({ createProject: vi.fn() }))
vi.mock("@/services/project.service", () => ({ projectService: mockService }))

const mockParse = vi.hoisted(() => vi.fn())
vi.mock("@/validators/project", () => ({ projectSchema: { parse: mockParse } }))

import { createProject } from "@/actions/create-project"

describe("createProject action", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates project successfully", async () => {
    mockSession.mockResolvedValue({ user: { id: "u1" } })
    mockParse.mockReturnValue({ title: "My Project", classId: "c1", techStack: [] })
    mockService.createProject.mockResolvedValue({ id: "p1", title: "My Project" })

    const formData = new FormData()
    formData.set("title", "My Project")
    formData.set("classId", "c1")
    formData.set("techStack", "[]")

    const result = await createProject(formData)
    expect(result.success).toBe(true)
    expect(result.project?.title).toBe("My Project")
  })

  it("throws when unauthorized", async () => {
    mockSession.mockResolvedValue(null)
    const formData = new FormData()

    await expect(createProject(formData)).rejects.toThrow("Unauthorized")
  })
})
