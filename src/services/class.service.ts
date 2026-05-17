import { classRepository } from "@/repositories/class.repository"
import { paginateResponse } from "@/repositories/base.repository"
import type { ClassInput } from "@/validators/class"
import type { PaginationInput } from "@/validators/common"

export const classService = {
  async createClass(input: ClassInput, userId: string) {
    const existing = await classRepository.findByCode(input.code)
    if (existing) {
      throw new Error("Class code already exists")
    }

    return classRepository.create({
      ...input,
      creatorId: userId,
      teacherId: userId,
    })
  },

  async getClasses(role: string, userId: string, pagination?: PaginationInput) {
    const where = role === "ADMIN" ? undefined : role === "STUDENT" ? { members: { some: { userId } } } : { teacherId: userId }
    const items = await classRepository.findMany(where, pagination)
    if (!pagination) return items
    const total = await classRepository.count(where)
    return paginateResponse(items, total, pagination)
  },
}
