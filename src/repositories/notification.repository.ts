import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { buildPaginationArgs } from "./base.repository"
import type { PaginationInput } from "@/validators/common"

export const notificationRepository = {
  async findManyByUser(userId: string, pagination?: PaginationInput) {
    return prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      take: pagination?.limit ?? 50,
      skip: pagination?.cursor ? 1 : undefined,
      cursor: pagination?.cursor ? { id: pagination.cursor } : undefined,
    })
  },

  async findById(id: string) {
    return prisma.notification.findUnique({ where: { id } })
  },

  async create(data: Record<string, unknown>) {
    return prisma.notification.create({ data: data as Prisma.NotificationCreateInput })
  },

  async update(id: string, data: Record<string, unknown>) {
    return prisma.notification.update({ where: { id }, data: data as Prisma.NotificationUpdateInput })
  },

  async updateMany(where: Prisma.NotificationWhereInput, data: Record<string, unknown>) {
    return prisma.notification.updateMany({ where, data: data as Prisma.NotificationUpdateManyMutationInput })
  },

  async delete(id: string) {
    return prisma.notification.delete({ where: { id } })
  },

  async count(where?: Prisma.NotificationWhereInput) {
    return prisma.notification.count({ where })
  },
}
