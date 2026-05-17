import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { buildPaginationArgs } from "./base.repository"
import type { PaginationInput } from "@/validators/common"

export const projectRepository = {
  async findMany(where?: Prisma.ProjectWhereInput, pagination?: PaginationInput) {
    return prisma.project.findMany({
      where,
      include: {
        owner: { select: { name: true, image: true } },
        class: { select: { name: true, code: true } },
        _count: { select: { milestones: true, comments: true } },
      },
      orderBy: { updatedAt: "desc" },
      ...(pagination ? buildPaginationArgs(pagination) : {}),
    })
  },

  async findById(id: string, include?: Prisma.ProjectInclude) {
    return prisma.project.findUnique({ where: { id }, include })
  },

  async create(data: Record<string, unknown>) {
    return prisma.project.create({ data: data as Prisma.ProjectCreateInput })
  },

  async update(id: string, data: Record<string, unknown>) {
    return prisma.project.update({ where: { id }, data: data as Prisma.ProjectUpdateInput })
  },

  async count(where?: Prisma.ProjectWhereInput) {
    return prisma.project.count({ where })
  },
}
