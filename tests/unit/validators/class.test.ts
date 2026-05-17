import { describe, it, expect } from "vitest"
import { classSchema } from "@/validators/class"

describe("classSchema", () => {
  it("accepts valid class data", () => {
    const data = { name: "CS101", code: "CS101-2025", semester: "Fall", year: 2025 }
    const result = classSchema.parse(data)
    expect(result.name).toBe("CS101")
    expect(result.year).toBe(2025)
  })

  it("accepts optional fields", () => {
    const data = { name: "CS101", code: "CS101", semester: "Spring", year: 2024, description: "Intro", section: "A" }
    const result = classSchema.parse(data)
    expect(result.description).toBe("Intro")
    expect(result.section).toBe("A")
  })

  it("rejects year below 2020", () => {
    expect(() => classSchema.parse({ name: "CS101", code: "CS101", semester: "Fall", year: 2019 })).toThrow()
  })

  it("rejects year above 2030", () => {
    expect(() => classSchema.parse({ name: "CS101", code: "CS101", semester: "Fall", year: 2031 })).toThrow()
  })

  it("rejects short name", () => {
    expect(() => classSchema.parse({ name: "X", code: "CS101", semester: "Fall", year: 2025 })).toThrow()
  })
})
