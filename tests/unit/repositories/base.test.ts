import { describe, it, expect } from "vitest"
import { buildPaginationArgs, paginateResponse } from "@/repositories/base.repository"

describe("buildPaginationArgs", () => {
  it("returns take and skip without cursor when no cursor given", () => {
    const result = buildPaginationArgs({ limit: 20 })
    expect(result).toEqual({ take: 20, skip: 0, cursor: undefined })
  })

  it("includes cursor when provided", () => {
    const result = buildPaginationArgs({ limit: 10, cursor: "abc" })
    expect(result).toEqual({ take: 10, skip: 1, cursor: { id: "abc" } })
  })
})

describe("paginateResponse", () => {
  it("returns items, total, and no nextCursor when fewer items than limit", () => {
    const items = [{ id: "1" }, { id: "2" }]
    const result = paginateResponse(items, 5, { limit: 10 })
    expect(result.items).toEqual(items)
    expect(result.total).toBe(5)
    expect(result.nextCursor).toBeUndefined()
  })

  it("returns nextCursor when items equal limit", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ id: `${i}` }))
    const result = paginateResponse(items, 25, { limit: 10 })
    expect(result.nextCursor).toBe("9")
  })
})
