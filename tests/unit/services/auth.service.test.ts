import { describe, it, expect, vi, beforeEach } from "vitest"

const mockUserRepo = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  create: vi.fn(),
}))

const mockPrisma = vi.hoisted(() => ({
  verificationToken: {
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    update: vi.fn(),
  },
}))

const mockBcrypt = vi.hoisted(() => ({
  hash: vi.fn(() => Promise.resolve("hashed-password")),
}))

const mockEmail = vi.hoisted(() => ({
  sendPasswordResetEmail: vi.fn(),
}))

vi.mock("@/repositories/user.repository", () => ({
  userRepository: mockUserRepo,
}))

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}))

vi.mock("@/lib/email", () => mockEmail)

vi.mock("bcryptjs", () => ({ default: mockBcrypt, ...mockBcrypt }))

import { authService } from "@/services/auth.service"

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("register", () => {
    it("registers a new user", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null)
      mockUserRepo.create.mockResolvedValue({ id: "1" })

      const result = await authService.register({ name: "Alice", email: "a@test.com", password: "secret123", role: "STUDENT" })

      expect(result.success).toBe(true)
      expect(result.userId).toBe("1")
      expect(mockUserRepo.create).toHaveBeenCalled()
    })

    it("throws when email already registered", async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: "1" })

      await expect(authService.register({ name: "Alice", email: "a@test.com", password: "secret123", role: "STUDENT" }))
        .rejects.toThrow("Email already registered")
    })
  })

  describe("initiatePasswordReset", () => {
    it("creates token and sends email", async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: "1", email: "a@test.com" })
      mockPrisma.verificationToken.create.mockResolvedValue({})

      const result = await authService.initiatePasswordReset({ email: "a@test.com" })

      expect(result.success).toBe(true)
      expect(mockPrisma.verificationToken.create).toHaveBeenCalled()
    })

    it("throws when email not found", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null)

      await expect(authService.initiatePasswordReset({ email: "unknown@test.com" }))
        .rejects.toThrow("No account found with that email")
    })
  })

  describe("resetPassword", () => {
    it("resets password with valid token", async () => {
      mockPrisma.verificationToken.findUnique.mockResolvedValue({
        token: "valid-token",
        identifier: "a@test.com",
        expires: new Date(Date.now() + 3600000),
      })
      mockPrisma.user.update.mockResolvedValue({})
      mockPrisma.verificationToken.delete.mockResolvedValue({})

      const result = await authService.resetPassword({ token: "valid-token", password: "newpass123" })

      expect(result.success).toBe(true)
      expect(mockPrisma.user.update).toHaveBeenCalled()
      expect(mockPrisma.verificationToken.delete).toHaveBeenCalled()
    })

    it("throws with invalid token", async () => {
      mockPrisma.verificationToken.findUnique.mockResolvedValue(null)

      await expect(authService.resetPassword({ token: "bad", password: "newpass123" }))
        .rejects.toThrow("Invalid or expired token")
    })

    it("throws with expired token", async () => {
      mockPrisma.verificationToken.findUnique.mockResolvedValue({
        token: "expired",
        identifier: "a@test.com",
        expires: new Date(Date.now() - 3600000),
      })

      await expect(authService.resetPassword({ token: "expired", password: "newpass123" }))
        .rejects.toThrow("Token has expired")
    })
  })
})
