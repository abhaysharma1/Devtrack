import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export const githubRepository = {
  async findByProjectId(projectId: string) {
    return prisma.gitHubRepository.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    })
  },

  async findById(id: string) {
    return prisma.gitHubRepository.findUnique({ where: { id } })
  },

  async findByFullName(projectId: string, fullName: string) {
    return prisma.gitHubRepository.findUnique({
      where: { projectId_fullName: { projectId, fullName } },
    })
  },

  async create(data: Record<string, unknown>) {
    return prisma.gitHubRepository.create({ data: data as Prisma.GitHubRepositoryCreateInput })
  },

  async update(id: string, data: Record<string, unknown>) {
    return prisma.gitHubRepository.update({
      where: { id },
      data: data as Prisma.GitHubRepositoryUpdateInput,
    })
  },

  async delete(id: string) {
    return prisma.gitHubRepository.delete({ where: { id } })
  },

  async findAllWithProject() {
    return prisma.gitHubRepository.findMany({
      include: { project: { select: { id: true, title: true } } },
    })
  },
}
