import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { buildPaginationArgs } from "./base.repository"
import type { PaginationInput } from "@/validators/common"

export const classRepository = {
  async findMany(where?: Prisma.ClassWhereInput, pagination?: PaginationInput) {
    return prisma.class.findMany({
      where,
      include: { _count: { select: { members: true, projects: true, groups: true } } },
      orderBy: { createdAt: "desc" },
      ...(pagination ? buildPaginationArgs(pagination) : {}),
    })
  },

  async findByCode(code: string) {
    return prisma.class.findUnique({ where: { code } })
  },

  async findById(id: string) {
    return prisma.class.findUnique({ where: { id } })
  },

  async findFirst(where: Prisma.ClassWhereInput) {
    return prisma.class.findFirst({ where })
  },

  async create(data: Record<string, unknown>) {
    return prisma.class.create({ data: data as Prisma.ClassCreateInput })
  },

  async count(where?: Prisma.ClassWhereInput) {
    return prisma.class.count({ where })
  },
}
