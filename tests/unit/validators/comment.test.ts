import { describe, it, expect } from "vitest"
import { commentSchema } from "@/validators/comment"

describe("commentSchema", () => {
  it("accepts valid comment", () => {
    const data = { content: "Nice work!", projectId: "550e8400-e29b-41d4-a716-446655440000" }
    const result = commentSchema.parse(data)
    expect(result.content).toBe("Nice work!")
  })

  it("accepts optional parentId", () => {
    const data = { content: "Reply", projectId: "550e8400-e29b-41d4-a716-446655440000", parentId: "550e8400-e29b-41d4-a716-446655440001" }
    const result = commentSchema.parse(data)
    expect(result.parentId).toBe("550e8400-e29b-41d4-a716-446655440001")
  })

  it("rejects empty content", () => {
    expect(() => commentSchema.parse({ content: "", projectId: "550e8400-e29b-41d4-a716-446655440000" })).toThrow()
  })

  it("rejects content over 5000 chars", () => {
    expect(() => commentSchema.parse({ content: "x".repeat(5001), projectId: "550e8400-e29b-41d4-a716-446655440000" })).toThrow()
  })
})
