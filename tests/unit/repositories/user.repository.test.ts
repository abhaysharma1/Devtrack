import { describe, it, expect, vi, beforeEach } from "vitest"

const mockUser = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({
  prisma: { user: mockUser },
}))

import { userRepository } from "@/repositories/user.repository"

describe("userRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("findById calls prisma.user.findUnique with id", async () => {
    mockUser.findUnique.mockResolvedValue({ id: "1", name: "Alice" })
    const result = await userRepository.findById("1")
    expect(mockUser.findUnique).toHaveBeenCalledWith({ where: { id: "1" } })
    expect(result?.name).toBe("Alice")
  })

  it("findByEmail calls prisma.user.findUnique with email", async () => {
    mockUser.findUnique.mockResolvedValue({ id: "1", email: "a@test.com" })
    const result = await userRepository.findByEmail("a@test.com")
    expect(mockUser.findUnique).toHaveBeenCalledWith({ where: { email: "a@test.com" } })
    expect(result?.email).toBe("a@test.com")
  })

  it("findMany with search and role filters", async () => {
    mockUser.findMany.mockResolvedValue([{ id: "1", name: "Alice" }])
    await userRepository.findMany({ search: "Ali", role: "STUDENT" })
    expect(mockUser.findMany).toHaveBeenCalledWith({
      where: { role: "STUDENT", OR: [{ name: { contains: "Ali" } }, { email: { contains: "Ali" } }] },
      orderBy: { createdAt: "desc" },
    })
  })

  it("findMany with pagination", async () => {
    mockUser.findMany.mockResolvedValue([])
    await userRepository.findMany({}, { limit: 10, cursor: "abc" })
    expect(mockUser.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: "desc" },
      take: 10,
      skip: 1,
      cursor: { id: "abc" },
    })
  })

  it("create passes data through", async () => {
    const data = { name: "Bob", email: "b@test.com" }
    mockUser.create.mockResolvedValue({ id: "2", ...data })
    const result = await userRepository.create(data)
    expect(mockUser.create).toHaveBeenCalledWith({ data })
    expect(result.id).toBe("2")
  })

  it("update passes id and data", async () => {
    mockUser.update.mockResolvedValue({ id: "1", name: "Updated" })
    await userRepository.update("1", { name: "Updated" })
    expect(mockUser.update).toHaveBeenCalledWith({ where: { id: "1" }, data: { name: "Updated" } })
  })

  it("delete calls prisma.user.delete with id", async () => {
    mockUser.delete.mockResolvedValue({ id: "1" })
    await userRepository.delete("1")
    expect(mockUser.delete).toHaveBeenCalledWith({ where: { id: "1" } })
  })

  it("count with filters", async () => {
    mockUser.count.mockResolvedValue(5)
    const result = await userRepository.count({ role: "STUDENT" })
    expect(mockUser.count).toHaveBeenCalledWith({ where: { role: "STUDENT" } })
    expect(result).toBe(5)
  })
})
