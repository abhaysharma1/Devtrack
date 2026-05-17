import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export const fileRepository = {
  async create(data: Record<string, unknown>) {
    return prisma.fileAttachment.create({ data: data as Prisma.FileAttachmentCreateInput })
  },
}
