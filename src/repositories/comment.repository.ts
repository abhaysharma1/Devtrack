import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { buildPaginationArgs } from "./base.repository"
import type { PaginationInput } from "@/validators/common"

export const commentRepository = {
  async findManyByProject(projectId: string, pagination?: PaginationInput) {
    return prisma.comment.findMany({
      where: { projectId, parentId: null },
      include: {
        user: { select: { id: true, name: true, image: true } },
        replies: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      ...(pagination ? buildPaginationArgs(pagination) : {}),
    })
  },

  async create(data: Record<string, unknown> & { include?: Prisma.CommentInclude }) {
    const { include, ...createData } = data
    return prisma.comment.create({
      data: createData as Prisma.CommentCreateInput,
      include: include || { user: { select: { id: true, name: true, image: true } } },
    })
  },

  async count(projectId: string) {
    return prisma.comment.count({ where: { projectId, parentId: null } })
  },
}
