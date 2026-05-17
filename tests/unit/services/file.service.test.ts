import { describe, it, expect, vi, beforeEach } from "vitest"

const mockProjectRepo = vi.hoisted(() => ({ findById: vi.fn() }))
const mockFileRepo = vi.hoisted(() => ({ create: vi.fn() }))

vi.mock("@/repositories/project.repository", () => ({
  projectRepository: mockProjectRepo,
}))
vi.mock("@/repositories/file.repository", () => ({
  fileRepository: mockFileRepo,
}))

import { fileService } from "@/services/file.service"

describe("fileService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("attaches file when project exists and user is owner", async () => {
    mockProjectRepo.findById.mockResolvedValue({ id: "p1", ownerId: "s1" })
    mockFileRepo.create.mockResolvedValue({ id: "f1", fileName: "report.pdf" })

    const result = await fileService.attachFile(
      { projectId: "p1", fileName: "report.pdf", fileSize: 1024, mimeType: "application/pdf", url: "https://example.com/f", key: "k1" },
      "s1", "STUDENT"
    )

    expect(result.fileName).toBe("report.pdf")
  })

  it("throws when project not found", async () => {
    mockProjectRepo.findById.mockResolvedValue(null)
    await expect(
      fileService.attachFile({ projectId: "bad", fileName: "f.txt", fileSize: 100, mimeType: "text/plain", url: "https://example.com/f", key: "k" }, "s1", "STUDENT")
    ).rejects.toThrow("Project not found")
  })

  it("throws when student tries to attach to another student's project", async () => {
    mockProjectRepo.findById.mockResolvedValue({ id: "p1", ownerId: "s2" })
    await expect(
      fileService.attachFile({ projectId: "p1", fileName: "f.txt", fileSize: 100, mimeType: "text/plain", url: "https://example.com/f", key: "k" }, "s1", "STUDENT")
    ).rejects.toThrow("Not your project")
  })
})
