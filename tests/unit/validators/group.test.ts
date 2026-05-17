import { describe, it, expect } from "vitest"
import { groupSchema, joinGroupSchema, joinRequestSchema, approveRequestSchema } from "@/validators/group"

describe("groupSchema", () => {
  it("accepts valid group data", () => {
    const data = { name: "Team Alpha", classId: "550e8400-e29b-41d4-a716-446655440000" }
    const result = groupSchema.parse(data)
    expect(result.name).toBe("Team Alpha")
    expect(result.maxSize).toBe(5)
  })

  it("accepts custom maxSize", () => {
    const result = groupSchema.parse({ name: "Team Beta", classId: "550e8400-e29b-41d4-a716-446655440000", maxSize: 3 })
    expect(result.maxSize).toBe(3)
  })

  it("rejects maxSize over 20", () => {
    expect(() => groupSchema.parse({ name: "Team", classId: "550e8400-e29b-41d4-a716-446655440000", maxSize: 25 })).toThrow()
  })

  it("rejects short name", () => {
    expect(() => groupSchema.parse({ name: "A", classId: "550e8400-e29b-41d4-a716-446655440000" })).toThrow()
  })
})

describe("joinGroupSchema", () => {
  it("accepts invite code", () => {
    const result = joinGroupSchema.parse({ inviteCode: "abc123" })
    expect(result.inviteCode).toBe("abc123")
  })

  it("rejects empty invite code", () => {
    expect(() => joinGroupSchema.parse({ inviteCode: "" })).toThrow()
  })
})

describe("joinRequestSchema", () => {
  it("accepts valid groupId", () => {
    const result = joinRequestSchema.parse({ groupId: "550e8400-e29b-41d4-a716-446655440000" })
    expect(result.groupId).toBe("550e8400-e29b-41d4-a716-446655440000")
  })
})

describe("approveRequestSchema", () => {
  it("accepts APPROVED status", () => {
    const result = approveRequestSchema.parse({ status: "APPROVED" })
    expect(result.status).toBe("APPROVED")
  })

  it("accepts REJECTED status", () => {
    const result = approveRequestSchema.parse({ status: "REJECTED" })
    expect(result.status).toBe("REJECTED")
  })

  it("rejects invalid status", () => {
    expect(() => approveRequestSchema.parse({ status: "PENDING" })).toThrow()
  })
})
