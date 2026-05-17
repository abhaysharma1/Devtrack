import { describe, it, expect } from "vitest"
import { submitSchema, gradeSchema } from "@/validators/submission"

describe("submitSchema", () => {
  it("accepts valid submission", () => {
    const data = { milestoneId: "550e8400-e29b-41d4-a716-446655440000", content: "This is my submission content with at least ten chars" }
    const result = submitSchema.parse(data)
    expect(result.content.length).toBeGreaterThanOrEqual(10)
  })

  it("accepts optional notes", () => {
    const data = { milestoneId: "550e8400-e29b-41d4-a716-446655440000", content: "This is my submission content with at least ten chars", notes: "Please review" }
    expect(() => submitSchema.parse(data)).not.toThrow()
  })

  it("rejects short content", () => {
    expect(() => submitSchema.parse({ milestoneId: "550e8400-e29b-41d4-a716-446655440000", content: "Short" })).toThrow()
  })

  it("rejects content over 10000 chars", () => {
    expect(() => submitSchema.parse({ milestoneId: "550e8400-e29b-41d4-a716-446655440000", content: "x".repeat(10001) })).toThrow()
  })
})

describe("gradeSchema", () => {
  it("accepts valid grade", () => {
    const data = { submissionId: "550e8400-e29b-41d4-a716-446655440000", grade: 85 }
    const result = gradeSchema.parse(data)
    expect(result.grade).toBe(85)
  })

  it("accepts grade of 0", () => {
    const result = gradeSchema.parse({ submissionId: "550e8400-e29b-41d4-a716-446655440000", grade: 0 })
    expect(result.grade).toBe(0)
  })

  it("accepts grade of 100", () => {
    const result = gradeSchema.parse({ submissionId: "550e8400-e29b-41d4-a716-446655440000", grade: 100 })
    expect(result.grade).toBe(100)
  })

  it("rejects grade below 0", () => {
    expect(() => gradeSchema.parse({ submissionId: "550e8400-e29b-41d4-a716-446655440000", grade: -1 })).toThrow()
  })

  it("rejects grade above 100", () => {
    expect(() => gradeSchema.parse({ submissionId: "550e8400-e29b-41d4-a716-446655440000", grade: 101 })).toThrow()
  })

  it("accepts feedback", () => {
    const result = gradeSchema.parse({ submissionId: "550e8400-e29b-41d4-a716-446655440000", grade: 90, feedback: "Great work!" })
    expect(result.feedback).toBe("Great work!")
  })
})
