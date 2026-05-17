import { describe, it, expect } from "vitest"
import { registerSchema, createUserSchema, updateUserSchema } from "@/validators/user"

describe("registerSchema", () => {
  it("accepts valid student registration", () => {
    const data = { name: "Alice", email: "alice@test.com", password: "secret123", role: "STUDENT" }
    expect(() => registerSchema.parse(data)).not.toThrow()
  })

  it("accepts registration with optional fields", () => {
    const data = { name: "Bob", email: "bob@test.com", password: "secret123", role: "TEACHER", studentId: "S001", department: "CS" }
    const result = registerSchema.parse(data)
    expect(result.studentId).toBe("S001")
    expect(result.department).toBe("CS")
  })

  it("rejects short name", () => {
    expect(() => registerSchema.parse({ name: "A", email: "a@test.com", password: "secret123", role: "STUDENT" })).toThrow()
  })

  it("rejects invalid email", () => {
    expect(() => registerSchema.parse({ name: "Alice", email: "not-email", password: "secret123", role: "STUDENT" })).toThrow()
  })

  it("rejects short password", () => {
    expect(() => registerSchema.parse({ name: "Alice", email: "alice@test.com", password: "123", role: "STUDENT" })).toThrow()
  })

  it("rejects invalid role", () => {
    expect(() => registerSchema.parse({ name: "Alice", email: "alice@test.com", password: "secret123", role: "ADMIN" })).toThrow()
  })
})

describe("createUserSchema", () => {
  it("accepts admin creation with valid data", () => {
    const data = { name: "Admin", email: "admin@test.com", password: "secret123", role: "ADMIN" }
    expect(() => createUserSchema.parse(data)).not.toThrow()
  })

  it("rejects without name", () => {
    expect(() => createUserSchema.parse({ email: "a@test.com", password: "secret123", role: "STUDENT" })).toThrow()
  })
})

describe("updateUserSchema", () => {
  it("accepts partial update", () => {
    const result = updateUserSchema.parse({ name: "New Name" })
    expect(result.name).toBe("New Name")
  })

  it("accepts empty object", () => {
    const result = updateUserSchema.parse({})
    expect(result).toEqual({})
  })

  it("accepts all fields", () => {
    const data = { name: "Xi", email: "x@test.com", password: "newpass123", role: "TEACHER", isActive: false, isSuspended: true }
    expect(() => updateUserSchema.parse(data)).not.toThrow()
  })
})
