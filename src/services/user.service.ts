import bcrypt from "bcryptjs"
import { userRepository } from "@/repositories/user.repository"
import { paginateResponse } from "@/repositories/base.repository"
import type { CreateUserInput, UpdateUserInput } from "@/validators"
import type { PaginationInput } from "@/validators/common"

export const userService = {
  async createUser(input: CreateUserInput) {
    const existing = await userRepository.findByEmail(input.email)
    if (existing) {
      throw new Error("Email already registered")
    }

    const passwordHash = await bcrypt.hash(input.password, 12)

    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      studentId: input.studentId,
      department: input.department,
    })

    return user
  },

  async updateUser(id: string, input: UpdateUserInput) {
    const existing = await userRepository.findById(id)
    if (!existing) {
      throw new Error("User not found")
    }

    const updateData: Record<string, unknown> = { ...input }
    if (input.password) {
      updateData.passwordHash = await bcrypt.hash(input.password, 12)
    }
    delete updateData.password

    return userRepository.update(id, updateData)
  },

  async deleteUser(id: string, actorId: string) {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new Error("User not found")
    }
    if (actorId === id) {
      throw new Error("Cannot delete yourself")
    }

    await userRepository.delete(id)
    return { success: true }
  },

  async listUsers(params: { search?: string; role?: string }, pagination?: PaginationInput) {
    const items = await userRepository.findMany(params, pagination)
    if (!pagination) return items
    const total = await userRepository.count(params)
    return paginateResponse(items, total, pagination)
  },
}
