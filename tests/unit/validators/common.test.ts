import { describe, it, expect } from "vitest"
import { paginationSchema, sortSchema } from "@/validators/common"

describe("paginationSchema", () => {
  it("applies defaults when no input", () => {
    const result = paginationSchema.parse({})
    expect(result.limit).toBe(50)
    expect(result.cursor).toBeUndefined()
  })

  it("accepts valid cursor and limit", () => {
    const result = paginationSchema.parse({ cursor: "abc123", limit: 20 })
    expect(result.cursor).toBe("abc123")
    expect(result.limit).toBe(20)
  })

  it("rejects limit over 100", () => {
    expect(() => paginationSchema.parse({ limit: 200 })).toThrow()
  })

  it("rejects limit below 1", () => {
    expect(() => paginationSchema.parse({ limit: 0 })).toThrow()
  })

  it("coerces string limit to number", () => {
    const result = paginationSchema.parse({ limit: "10" })
    expect(result.limit).toBe(10)
  })
})

describe("sortSchema", () => {
  it("applies default sortOrder as desc", () => {
    const result = sortSchema.parse({})
    expect(result.sortOrder).toBe("desc")
  })

  it("accepts asc order", () => {
    const result = sortSchema.parse({ sortOrder: "asc" })
    expect(result.sortOrder).toBe("asc")
  })

  it("rejects invalid sortOrder", () => {
    expect(() => sortSchema.parse({ sortOrder: "invalid" })).toThrow()
  })
})
