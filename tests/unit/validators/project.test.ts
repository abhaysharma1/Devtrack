import { describe, it, expect } from "vitest"
import { projectSchema } from "@/validators/project"

describe("projectSchema", () => {
  it("accepts valid project data", () => {
    const data = { title: "My Project", classId: "550e8400-e29b-41d4-a716-446655440000", techStack: ["React"] }
    const result = projectSchema.parse(data)
    expect(result.title).toBe("My Project")
    expect(result.techStack).toEqual(["React"])
  })

  it("defaults techStack to empty array", () => {
    const result = projectSchema.parse({ title: "Project", classId: "550e8400-e29b-41d4-a716-446655440000" })
    expect(result.techStack).toEqual([])
  })

  it("rejects short title", () => {
    expect(() => projectSchema.parse({ title: "AB", classId: "550e8400-e29b-41d4-a716-446655440000" })).toThrow()
  })

  it("rejects non-UUID classId", () => {
    expect(() => projectSchema.parse({ title: "Project", classId: "not-uuid" })).toThrow()
  })

  it("accepts optional repo and live URLs", () => {
    const data = { title: "Project", classId: "550e8400-e29b-41d4-a716-446655440000", repoUrl: "https://github.com/test/repo", liveUrl: "https://example.com" }
    expect(() => projectSchema.parse(data)).not.toThrow()
  })

  it("rejects invalid URL", () => {
    expect(() => projectSchema.parse({ title: "Project", classId: "550e8400-e29b-41d4-a716-446655440000", repoUrl: "not-a-url" })).toThrow()
  })
})
