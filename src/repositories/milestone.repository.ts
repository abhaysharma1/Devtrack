import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export const milestoneRepository = {
  async findById(id: string, include?: Prisma.MilestoneInclude) {
    return prisma.milestone.findUnique({ where: { id }, include })
  },

  async findManyByProject(projectId: string) {
    return prisma.milestone.findMany({ where: { projectId } })
  },

  async create(data: Record<string, unknown>) {
    return prisma.milestone.create({ data: data as Prisma.MilestoneCreateInput })
  },

  async update(id: string, data: Record<string, unknown>) {
    return prisma.milestone.update({ where: { id }, data: data as Prisma.MilestoneUpdateInput })
  },

  async delete(id: string) {
    return prisma.milestone.delete({ where: { id } })
  },
}
