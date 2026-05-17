import { describe, it, expect } from "vitest"
import { createMilestoneSchema, updateMilestoneSchema } from "@/validators/milestone"

describe("createMilestoneSchema", () => {
  it("accepts valid milestone data", () => {
    const data = { projectId: "550e8400-e29b-41d4-a716-446655440000", title: "Setup", order: 1 }
    const result = createMilestoneSchema.parse(data)
    expect(result.title).toBe("Setup")
    expect(result.weight).toBe(1)
  })

  it("accepts optional fields", () => {
    const data = { projectId: "550e8400-e29b-41d4-a716-446655440000", title: "Design", order: 2, weight: 3, dueDate: "2025-06-01T00:00:00Z" }
    expect(() => createMilestoneSchema.parse(data)).not.toThrow()
  })

  it("rejects short title", () => {
    expect(() => createMilestoneSchema.parse({ projectId: "550e8400-e29b-41d4-a716-446655440000", title: "AB", order: 1 })).toThrow()
  })

  it("rejects weight over 10", () => {
    expect(() => createMilestoneSchema.parse({ projectId: "550e8400-e29b-41d4-a716-446655440000", title: "Test", order: 1, weight: 15 })).toThrow()
  })

  it("rejects order below 1", () => {
    expect(() => createMilestoneSchema.parse({ projectId: "550e8400-e29b-41d4-a716-446655440000", title: "Test", order: 0 })).toThrow()
  })
})

describe("updateMilestoneSchema", () => {
  it("accepts partial update", () => {
    const result = updateMilestoneSchema.parse({ title: "Updated Title" })
    expect(result.title).toBe("Updated Title")
  })

  it("accepts status update", () => {
    const result = updateMilestoneSchema.parse({ status: "IN_PROGRESS" })
    expect(result.status).toBe("IN_PROGRESS")
  })

  it("rejects invalid status", () => {
    expect(() => updateMilestoneSchema.parse({ status: "INVALID" })).toThrow()
  })
})
