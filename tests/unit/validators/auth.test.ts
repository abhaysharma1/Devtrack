import { describe, it, expect } from "vitest"
import { forgotPasswordSchema, resetPasswordSchema } from "@/validators/auth"

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = forgotPasswordSchema.parse({ email: "user@test.com" })
    expect(result.email).toBe("user@test.com")
  })

  it("rejects invalid email", () => {
    expect(() => forgotPasswordSchema.parse({ email: "bad" })).toThrow()
  })

  it("rejects missing email", () => {
    expect(() => forgotPasswordSchema.parse({})).toThrow()
  })
})

describe("resetPasswordSchema", () => {
  it("accepts valid token and password", () => {
    const result = resetPasswordSchema.parse({ token: "abc123", password: "newpassword123" })
    expect(result.token).toBe("abc123")
    expect(result.password).toBe("newpassword123")
  })

  it("rejects empty token", () => {
    expect(() => resetPasswordSchema.parse({ token: "", password: "newpassword123" })).toThrow()
  })

  it("rejects short password", () => {
    expect(() => resetPasswordSchema.parse({ token: "abc", password: "123" })).toThrow()
  })
})
