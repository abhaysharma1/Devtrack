import { prisma } from "@/lib/prisma"
import { classRepository } from "@/repositories/class.repository"
import { groupRepository } from "@/repositories/group.repository"
import { notificationRepository } from "@/repositories/notification.repository"
import { paginateResponse } from "@/repositories/base.repository"
import { pushEvent } from "@/lib/sse"
import type { GroupInput } from "@/validators/group"
import type { PaginationInput } from "@/validators/common"

export const groupService = {
  async createGroup(input: GroupInput, userId: string) {
    const classExists = await classRepository.findFirst({ id: input.classId })
    if (!classExists) {
      throw new Error("Class not found")
    }

    const group = await groupRepository.create({
      name: input.name,
      classId: input.classId,
      maxSize: input.maxSize,
      creatorId: userId,
    })

    await groupRepository.addMember(group.id, userId, "leader")

    if (classExists.teacherId && classExists.teacherId !== userId) {
      const notification = await notificationRepository.create({
        type: "GROUP_CREATED",
        title: "New Group Created",
        message: `A new group "${group.name}" was created in your class`,
        recipientId: classExists.teacherId,
        senderId: userId,
        link: `/teacher/groups/${group.id}`,
      })
      pushEvent(classExists.teacherId, "notification", notification)
    }

    return group
  },

  async getGroups(role: string, userId: string, pagination?: PaginationInput) {
    const where = role === "STUDENT"
      ? { members: { some: { userId } } }
      : undefined
    const items = await groupRepository.findMany(where, pagination)
    if (!pagination) return items
    const total = await groupRepository.count(where)
    return paginateResponse(items, total, pagination)
  },

  async getAvailableGroups(userId: string, classId?: string) {
    const where: Record<string, unknown> = {
      isActive: true,
      members: { none: { userId } },
    }
    if (classId) where.classId = classId
    return groupRepository.findMany(where as any)
  },

  async joinGroupByCode(code: string, userId: string) {
    const group = await groupRepository.findByInviteCode(code)
    if (!group) throw new Error("Group not found")
    if (!group.isActive) throw new Error("Group is not active")
    if (group.members.length >= group.maxSize) throw new Error("Group is full")

    const alreadyMember = group.members.some((m) => m.user.id === userId)
    if (alreadyMember) throw new Error("Already a member of this group")

    const result = await prisma.$transaction(async (tx) => {
      const membership = await tx.groupMember.create({
        data: { groupId: group.id, userId, role: "member" },
        include: { user: { select: { id: true, name: true, image: true } } },
      })

      const notification = await tx.notification.create({
        data: {
          type: "GROUP_JOINED",
          title: "New Group Member",
          message: `A student joined "${group.name}"`,
          recipientId: group.creatorId,
          senderId: userId,
          link: `/teacher/groups/${group.id}`,
        },
      })

      return { membership, notification }
    })

    pushEvent(group.creatorId, "notification", result.notification)

    return result.membership
  },

  async leaveGroup(groupId: string, userId: string) {
    const group = await groupRepository.findById(groupId)
    if (!group) throw new Error("Group not found")

    await groupRepository.removeMember(groupId, userId)

    if (group.creatorId && group.creatorId !== userId) {
      const notification = await notificationRepository.create({
        type: "GROUP_LEFT",
        title: "Member Left Group",
        message: `A member left "${group.name}"`,
        recipientId: group.creatorId,
        senderId: userId,
        link: `/teacher/groups/${group.id}`,
      })
      pushEvent(group.creatorId, "notification", notification)
    }

    return { success: true }
  },

  async requestJoinGroup(groupId: string, userId: string) {
    const group = await groupRepository.findById(groupId)
    if (!group) throw new Error("Group not found")
    if (!group.isActive) throw new Error("Group is not active")

    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.groupJoinRequest.create({
        data: { groupId, userId },
        include: { user: { select: { id: true, name: true, image: true } } },
      })

      const notification = await tx.notification.create({
        data: {
          type: "GROUP_JOIN_REQUEST",
          title: "Join Request",
          message: `A student wants to join "${group.name}"`,
          recipientId: group.creatorId,
          senderId: userId,
          link: `/teacher/groups/${group.id}`,
        },
      })

      return { request, notification }
    })

    pushEvent(group.creatorId, "notification", result.notification)

    return result.request
  },

  async approveJoinRequest(requestId: string, userId: string) {
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.groupJoinRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" },
      })

      await tx.groupMember.create({
        data: { groupId: request.groupId, userId: request.userId, role: "member" },
      })

      const notification = await tx.notification.create({
        data: {
          type: "GROUP_JOIN_APPROVED",
          title: "Join Request Approved",
          message: "Your request to join the group was approved",
          recipientId: request.userId,
          senderId: userId,
          link: `/student/groups/${request.groupId}`,
        },
      })

      return { request, notification }
    })

    pushEvent(result.request.userId, "notification", result.notification)

    return result.request
  },

  async rejectJoinRequest(requestId: string, userId: string) {
    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.groupJoinRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      })

      const notification = await tx.notification.create({
        data: {
          type: "GROUP_JOIN_REJECTED",
          title: "Join Request Rejected",
          message: "Your request to join the group was rejected",
          recipientId: request.userId,
          senderId: userId,
          link: `/student/groups`,
        },
      })

      return { request, notification }
    })

    pushEvent(result.request.userId, "notification", result.notification)

    return result.request
  },

  async getJoinRequests(groupId: string) {
    return groupRepository.findJoinRequests(groupId)
  },
}
