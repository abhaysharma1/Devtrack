import { describe, it, expect, vi, beforeEach } from "vitest"

const mockUserRepo = vi.hoisted(() => ({
  findByEmail: vi.fn(),
  findById: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
}))

vi.mock("@/repositories/user.repository", () => ({
  userRepository: mockUserRepo,
}))

vi.mock("@/repositories/base.repository", () => ({
  paginateResponse: vi.fn((items, total) => ({ items, total })),
}))

import { userService } from "@/services/user.service"

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createUser", () => {
    it("creates user when email is not taken", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null)
      mockUserRepo.create.mockResolvedValue({ id: "1", name: "Alice", email: "a@test.com" })

      const result = await userService.createUser({ name: "Alice", email: "a@test.com", password: "secret123", role: "STUDENT" })

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith("a@test.com")
      expect(mockUserRepo.create).toHaveBeenCalled()
      expect(result.name).toBe("Alice")
    })

    it("throws when email already exists", async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: "1", email: "a@test.com" })

      await expect(userService.createUser({ name: "Alice", email: "a@test.com", password: "secret123", role: "STUDENT" }))
        .rejects.toThrow("Email already registered")
    })
  })

  describe("updateUser", () => {
    it("updates user when found", async () => {
      mockUserRepo.findById.mockResolvedValue({ id: "1", name: "Alice" })
      mockUserRepo.update.mockResolvedValue({ id: "1", name: "Updated" })

      const result = await userService.updateUser("1", { name: "Updated" })
      expect(mockUserRepo.findById).toHaveBeenCalledWith("1")
      expect(mockUserRepo.update).toHaveBeenCalled()
      expect(result.name).toBe("Updated")
    })

    it("throws when user not found", async () => {
      mockUserRepo.findById.mockResolvedValue(null)
      await expect(userService.updateUser("1", { name: "X" })).rejects.toThrow("User not found")
    })
  })

  describe("deleteUser", () => {
    it("deletes user when found and not self", async () => {
      mockUserRepo.findById.mockResolvedValue({ id: "2", name: "Bob" })
      mockUserRepo.delete.mockResolvedValue({ id: "2" })

      const result = await userService.deleteUser("2", "1")
      expect(result.success).toBe(true)
      expect(mockUserRepo.delete).toHaveBeenCalledWith("2")
    })

    it("throws when deleting yourself", async () => {
      mockUserRepo.findById.mockResolvedValue({ id: "1", name: "Alice" })
      await expect(userService.deleteUser("1", "1")).rejects.toThrow("Cannot delete yourself")
    })

    it("throws when user not found", async () => {
      mockUserRepo.findById.mockResolvedValue(null)
      await expect(userService.deleteUser("99", "1")).rejects.toThrow("User not found")
    })
  })

  describe("listUsers", () => {
    it("returns paginated results when pagination provided", async () => {
      mockUserRepo.findMany.mockResolvedValue([{ id: "1" }])
      mockUserRepo.count.mockResolvedValue(1)

      const result = await userService.listUsers({}, { limit: 10 })
      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it("returns non-paginated results when no pagination", async () => {
      mockUserRepo.findMany.mockResolvedValue([{ id: "1" }, { id: "2" }])
      const result = await userService.listUsers({})
      expect(result).toHaveLength(2)
    })
  })
})
