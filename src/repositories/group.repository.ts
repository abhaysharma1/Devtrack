import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { buildPaginationArgs } from "./base.repository"
import type { PaginationInput } from "@/validators/common"

export const groupRepository = {
  async findMany(where?: Prisma.GroupWhereInput, pagination?: PaginationInput) {
    return prisma.group.findMany({
      where,
      include: {
        class: { select: { name: true, code: true } },
        members: { include: { user: { select: { id: true, name: true, image: true, email: true } } } },
        project: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      ...(pagination ? buildPaginationArgs(pagination) : {}),
    })
  },

  async findById(id: string) {
    return prisma.group.findUnique({ where: { id } })
  },

  async findByIdWithDetails(id: string) {
    return prisma.group.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true, code: true, teacherId: true } },
        creator: { select: { id: true, name: true, image: true } },
        members: {
          include: { user: { select: { id: true, name: true, image: true, email: true } } },
          orderBy: { joinedAt: "asc" },
        },
        project: {
          include: {
            milestones: { orderBy: { order: "asc" } },
            _count: { select: { milestones: true, comments: true } },
          },
        },
        joinRequests: {
          include: { user: { select: { id: true, name: true, image: true, email: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    })
  },

  async findByInviteCode(code: string) {
    return prisma.group.findUnique({
      where: { inviteCode: code },
      include: {
        class: { select: { name: true, code: true } },
        members: { include: { user: { select: { id: true, name: true, image: true } } } },
        project: { select: { id: true, title: true, status: true } },
      },
    })
  },

  async create(data: Prisma.GroupCreateInput | Prisma.GroupUncheckedCreateInput) {
    return prisma.group.create({ data: data as Prisma.GroupCreateInput })
  },

  async update(id: string, data: Prisma.GroupUpdateInput | Prisma.GroupUncheckedUpdateInput) {
    return prisma.group.update({ where: { id }, data: data as Prisma.GroupUpdateInput })
  },

  async addMember(groupId: string, userId: string, role = "member") {
    return prisma.groupMember.create({
      data: { groupId, userId, role },
      include: { user: { select: { id: true, name: true, image: true } } },
    })
  },

  async removeMember(groupId: string, userId: string) {
    return prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    })
  },

  async updateMemberRole(groupId: string, userId: string, role: string) {
    return prisma.groupMember.update({
      where: { groupId_userId: { groupId, userId } },
      data: { role },
      include: { user: { select: { id: true, name: true, image: true } } },
    })
  },

  async count(where?: Prisma.GroupWhereInput) {
    return prisma.group.count({ where })
  },

  async findJoinRequests(groupId: string) {
    return prisma.groupJoinRequest.findMany({
      where: { groupId },
      include: { user: { select: { id: true, name: true, image: true, email: true } } },
      orderBy: { createdAt: "desc" },
    })
  },

  async createJoinRequest(groupId: string, userId: string) {
    return prisma.groupJoinRequest.create({
      data: { groupId, userId },
      include: { user: { select: { id: true, name: true, image: true } } },
    })
  },

  async updateJoinRequest(id: string, data: Prisma.GroupJoinRequestUpdateInput | Prisma.GroupJoinRequestUncheckedUpdateInput) {
    return prisma.groupJoinRequest.update({
      where: { id },
      data: data as Prisma.GroupJoinRequestUpdateInput,
    })
  },

  async deleteGroup(id: string) {
    return prisma.group.delete({ where: { id } })
  },
}
