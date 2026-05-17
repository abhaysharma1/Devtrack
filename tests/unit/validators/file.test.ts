import { describe, it, expect } from "vitest"
import { fileSchema } from "@/validators/file"

describe("fileSchema", () => {
  it("accepts valid file data", () => {
    const data = { projectId: "550e8400-e29b-41d4-a716-446655440000", fileName: "report.pdf", fileSize: 1024, mimeType: "application/pdf", url: "https://example.com/file.pdf", key: "abc123" }
    const result = fileSchema.parse(data)
    expect(result.fileName).toBe("report.pdf")
    expect(result.fileSize).toBe(1024)
  })

  it("rejects zero fileSize", () => {
    expect(() => fileSchema.parse({ projectId: "550e8400-e29b-41d4-a716-446655440000", fileName: "f.txt", fileSize: 0, mimeType: "text/plain", url: "https://example.com/f.txt", key: "k" })).toThrow()
  })

  it("rejects negative fileSize", () => {
    expect(() => fileSchema.parse({ projectId: "550e8400-e29b-41d4-a716-446655440000", fileName: "f.txt", fileSize: -1, mimeType: "text/plain", url: "https://example.com/f.txt", key: "k" })).toThrow()
  })

  it("rejects invalid URL", () => {
    expect(() => fileSchema.parse({ projectId: "550e8400-e29b-41d4-a716-446655440000", fileName: "f.txt", fileSize: 100, mimeType: "text/plain", url: "not-a-url", key: "k" })).toThrow()
  })
})
