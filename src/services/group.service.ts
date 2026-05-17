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

    const membership = await groupRepository.addMember(group.id, userId)

    await notificationRepository.create({
      type: "GROUP_JOINED",
      title: "New Group Member",
      message: `A student joined "${group.name}"`,
      recipientId: group.creatorId,
      senderId: userId,
    })

    return membership
  },

  async leaveGroup(groupId: string, userId: string) {
    const group = await groupRepository.findById(groupId)
    if (!group) throw new Error("Group not found")

    await groupRepository.removeMember(groupId, userId)
    return { success: true }
  },

  async requestJoinGroup(groupId: string, userId: string) {
    const group = await groupRepository.findById(groupId)
    if (!group) throw new Error("Group not found")
    if (!group.isActive) throw new Error("Group is not active")

    const request = await groupRepository.createJoinRequest(groupId, userId)

    const notification = await notificationRepository.create({
      type: "GROUP_JOIN_REQUEST",
      title: "Join Request",
      message: `A student wants to join "${group.name}"`,
      recipientId: group.creatorId,
      senderId: userId,
    })
    pushEvent(group.creatorId, "notification", notification)

    return request
  },

  async approveJoinRequest(requestId: string, userId: string) {
    const request = await groupRepository.updateJoinRequest(requestId, { status: "APPROVED" })
    await groupRepository.addMember(request.groupId, request.userId)

    const notification = await notificationRepository.create({
      type: "GROUP_JOIN_APPROVED",
      title: "Join Request Approved",
      message: `Your request to join the group was approved`,
      recipientId: request.userId,
      senderId: userId,
    })
    pushEvent(request.userId, "notification", notification)

    return request
  },

  async rejectJoinRequest(requestId: string, userId: string) {
    const request = await groupRepository.updateJoinRequest(requestId, { status: "REJECTED" })

    const notification = await notificationRepository.create({
      type: "GROUP_JOIN_REJECTED",
      title: "Join Request Rejected",
      message: `Your request to join the group was rejected`,
      recipientId: request.userId,
      senderId: userId,
    })
    pushEvent(request.userId, "notification", notification)

    return request
  },

  async getJoinRequests(groupId: string) {
    return groupRepository.findJoinRequests(groupId)
  },
}
