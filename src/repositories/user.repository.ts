import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { buildPaginationArgs } from "./base.repository"
import type { PaginationInput } from "@/validators/common"

export const userRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },

  async findMany(params: { search?: string; role?: string }, pagination?: PaginationInput) {
    const where: Prisma.UserWhereInput = {}
    if (params.role) where.role = params.role
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
      ]
    }
    return prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...(pagination ? buildPaginationArgs(pagination) : {}),
    })
  },



  async create(data: Record<string, unknown>) {
    return prisma.user.create({ data: data as Prisma.UserCreateInput })
  },

  async update(id: string, data: Record<string, unknown>) {
    return prisma.user.update({ where: { id }, data: data as Prisma.UserUpdateInput })
  },

  async delete(id: string) {
    return prisma.user.delete({ where: { id } })
  },

  async count(params?: { search?: string; role?: string }) {
    const where: Prisma.UserWhereInput = {}
    if (params?.role) where.role = params.role
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
      ]
    }
    return prisma.user.count({ where })
  },
}
