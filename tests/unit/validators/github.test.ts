import { describe, it, expect } from "vitest"
import { linkRepositorySchema, syncRepoSchema } from "@/validators/github"

describe("linkRepositorySchema", () => {
  it("accepts valid input", () => {
    const result = linkRepositorySchema.parse({ projectId: "proj-1", fullName: "owner/repo" })
    expect(result.projectId).toBe("proj-1")
    expect(result.fullName).toBe("owner/repo")
  })

  it("rejects empty projectId", () => {
    expect(() => linkRepositorySchema.parse({ projectId: "", fullName: "owner/repo" })).toThrow()
  })

  it("rejects empty fullName", () => {
    expect(() => linkRepositorySchema.parse({ projectId: "proj-1", fullName: "" })).toThrow()
  })
})

describe("syncRepoSchema", () => {
  it("accepts empty input", () => {
    const result = syncRepoSchema.parse({})
    expect(Object.keys(result)).toHaveLength(0)
  })

  it("accepts repoId", () => {
    const result = syncRepoSchema.parse({ repoId: "repo-1" })
    expect(result.repoId).toBe("repo-1")
  })
})
