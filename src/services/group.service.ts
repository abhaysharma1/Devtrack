import { prisma } from "@/lib/prisma"
import { classRepository } from "@/repositories/class.repository"
import { groupRepository } from "@/repositories/group.repository"
import { notificationRepository } from "@/repositories/notification.repository"
import { projectRepository } from "@/repositories/project.repository"
import { paginateResponse } from "@/repositories/base.repository"
import { pushEvent } from "@/lib/sse"
import type { GroupInput, UpdateGroupInput, UpdateMemberRoleInput } from "@/validators/group"
import type { ProjectInput } from "@/validators/project"
import type { PaginationInput } from "@/validators/common"

type GroupProjectInput = Omit<ProjectInput, "classId">

export const groupService = {
  async createGroup(input: GroupInput, userId: string) {
    const classExists = await classRepository.findFirst({ id: input.classId })
    if (!classExists) {
      throw new Error("Class not found")
    }

    const group = await groupRepository.create({
      name: input.name,
      class: { connect: { id: input.classId } },
      maxSize: input.maxSize,
      creator: { connect: { id: userId } },
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

    const existingGroupInClass = await prisma.group.findFirst({
      where: {
        classId: group.classId,
        members: { some: { userId } },
      },
    })
    if (existingGroupInClass) throw new Error("You are already in a group for this class")

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
    const request = await prisma.groupJoinRequest.findUnique({
      where: { id: requestId },
      include: { group: { include: { members: true } } },
    })
    if (!request) throw new Error("Join request not found")
    if (request.status !== "PENDING") throw new Error("Join request is no longer pending")
    if (request.group.members.length >= request.group.maxSize) throw new Error("Group is full")

    const alreadyMember = request.group.members.some((m) => m.userId === request.userId)
    if (alreadyMember) throw new Error("User is already a member of this group")

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.groupJoinRequest.update({
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

      return { request: updated, notification }
    })

    pushEvent(request.userId, "notification", result.notification)

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

  async getGroupById(id: string, userId: string) {
    const group = await groupRepository.findByIdWithDetails(id)
    if (!group) throw new Error("Group not found")

    const isMember = group.members.some((m) => m.userId === userId)
    const isTeacher = group.class.teacherId === userId
    if (!isMember && !isTeacher) throw new Error("Not authorized to view this group")

    return group
  },

  async updateGroup(id: string, input: UpdateGroupInput, userId: string) {
    const group = await groupRepository.findById(id)
    if (!group) throw new Error("Group not found")
    if (group.creatorId !== userId) throw new Error("Only the group leader can update settings")

    if (input.maxSize !== undefined) {
      const members = await prisma.groupMember.count({ where: { groupId: id } })
      if (input.maxSize < members) throw new Error("Max size cannot be less than current member count")
    }

    const updated = await groupRepository.update(id, input)

    const notification = await notificationRepository.create({
      type: "GROUP_UPDATED",
      title: "Group Updated",
      message: `"${group.name}" settings have been updated`,
      recipientId: group.creatorId,
      senderId: userId,
      link: `/teacher/groups/${id}`,
    })
    pushEvent(group.creatorId, "notification", notification)

    return updated
  },

  async deleteGroup(id: string, userId: string) {
    const group = await groupRepository.findByIdWithDetails(id)
    if (!group) throw new Error("Group not found")

    const isLeader = group.members.some((m) => m.userId === userId && m.role === "leader")
    const isTeacher = group.class.teacherId === userId
    if (!isLeader && !isTeacher) throw new Error("Only the group leader or teacher can delete the group")

    await groupRepository.deleteGroup(id)

    return { success: true }
  },

  async regenerateInviteCode(id: string, userId: string) {
    const group = await groupRepository.findById(id)
    if (!group) throw new Error("Group not found")
    if (group.creatorId !== userId) throw new Error("Only the group leader can regenerate the invite code")

    const { customAlphabet } = await import("nanoid")
    const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8)
    const newCode = nanoid()

    const updated = await groupRepository.update(id, { inviteCode: newCode })

    const notification = await notificationRepository.create({
      type: "GROUP_UPDATED",
      title: "Invite Code Regenerated",
      message: `The invite code for "${group.name}" has been changed`,
      recipientId: group.creatorId,
      senderId: userId,
      link: `/teacher/groups/${id}`,
    })
    pushEvent(group.creatorId, "notification", notification)

    return updated
  },

  async updateMemberRole(groupId: string, targetUserId: string, input: UpdateMemberRoleInput, actorId: string) {
    const group = await groupRepository.findById(groupId)
    if (!group) throw new Error("Group not found")

    const actorMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: actorId } },
    })
    if (!actorMember || actorMember.role !== "leader") throw new Error("Only the group leader can change roles")

    if (targetUserId === actorId) throw new Error("You cannot change your own role")

    if (input.role === "member") {
      const leaderCount = await prisma.groupMember.count({
        where: { groupId, role: "leader" },
      })
      if (leaderCount <= 1) throw new Error("Cannot demote the last leader")
    }

    return groupRepository.updateMemberRole(groupId, targetUserId, input.role)
  },

  async removeMember(groupId: string, targetUserId: string, actorId: string) {
    const group = await groupRepository.findById(groupId)
    if (!group) throw new Error("Group not found")

    const actorMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: actorId } },
    })
    if (!actorMember || actorMember.role !== "leader") throw new Error("Only the group leader can remove members")

    if (targetUserId === actorId) throw new Error("Use leave instead")

    const targetMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: targetUserId } },
    })
    if (!targetMember) throw new Error("Member not found")

    if (targetMember.role === "leader") {
      const leaderCount = await prisma.groupMember.count({
        where: { groupId, role: "leader" },
      })
      if (leaderCount <= 1) throw new Error("Cannot remove the last leader")
    }

    await groupRepository.removeMember(groupId, targetUserId)

    const notification = await notificationRepository.create({
      type: "MEMBER_REMOVED",
      title: "Removed from Group",
      message: `You have been removed from "${group.name}"`,
      recipientId: targetUserId,
      senderId: actorId,
      link: `/student/groups`,
    })
    pushEvent(targetUserId, "notification", notification)

    return { success: true }
  },

  async createGroupProject(groupId: string, input: GroupProjectInput, userId: string) {
    const group = await groupRepository.findByIdWithDetails(groupId)
    if (!group) throw new Error("Group not found")

    const isMember = group.members.some((m) => m.userId === userId)
    if (!isMember) throw new Error("Only group members can create a project")

    if (group.projectId) throw new Error("Group already has a project")

    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          title: input.title,
          description: input.description,
          techStack: JSON.stringify(input.techStack),
          classId: group.classId,
          ownerId: userId,
          status: "PROPOSED",
          tags: "[]",
        },
      })

      await tx.group.update({
        where: { id: groupId },
        data: { projectId: project.id },
      })

      const notification = await tx.notification.create({
        data: {
          type: "PROJECT_PROPOSED",
          title: "Project Proposal Submitted",
          message: `"${group.name}" submitted a project proposal: "${input.title}"`,
          recipientId: group.class.teacherId,
          senderId: userId,
          link: `/teacher/groups/${groupId}`,
        },
      })

      return { project, notification }
    })

    pushEvent(group.class.teacherId, "notification", result.notification)

    return result.project
  },

  async updateGroupProject(groupId: string, input: Partial<GroupProjectInput>, userId: string) {
    const group = await groupRepository.findByIdWithDetails(groupId)
    if (!group) throw new Error("Group not found")

    const isMember = group.members.some((m) => m.userId === userId)
    if (!isMember) throw new Error("Only group members can update the project")

    if (!group.projectId) throw new Error("Group does not have a project yet")

    if (group.project && group.project.status !== "PROPOSED") {
      throw new Error("Can only update a project in PROPOSED status")
    }

    const updateData: Record<string, unknown> = {}
    if (input.title !== undefined) updateData.title = input.title
    if (input.description !== undefined) updateData.description = input.description
    if (input.techStack !== undefined) updateData.techStack = JSON.stringify(input.techStack)
    if (input.repoUrl !== undefined) updateData.repoUrl = input.repoUrl
    if (input.liveUrl !== undefined) updateData.liveUrl = input.liveUrl

    return projectRepository.update(group.projectId, updateData)
  },

  async approveGroupProject(groupId: string, status: "APPROVED" | "REJECTED", teacherId: string) {
    const group = await groupRepository.findByIdWithDetails(groupId)
    if (!group) throw new Error("Group not found")

    if (group.class.teacherId !== teacherId) throw new Error("Only the class teacher can approve or reject proposals")

    if (!group.projectId || !group.project) throw new Error("Group does not have a project proposal")

    if (group.project.status !== "PROPOSED") throw new Error("Project is not in PROPOSED status")

    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.update({
        where: { id: group.projectId! },
        data: { status },
      })

      const memberIds = group.members.map((m) => m.userId)

      const notifications = await Promise.all(
        memberIds.map((memberId) =>
          tx.notification.create({
            data: {
              type: status === "APPROVED" ? "PROJECT_PROPOSAL_APPROVED" : "PROJECT_PROPOSAL_REJECTED",
              title: status === "APPROVED" ? "Project Proposal Approved" : "Project Proposal Rejected",
              message:
                status === "APPROVED"
                  ? `"${group.name}"'s project proposal has been approved`
                  : `"${group.name}"'s project proposal has been rejected`,
              recipientId: memberId,
              senderId: teacherId,
              link: `/student/groups/${groupId}`,
            },
          })
        ),
      )

      return { project, notifications }
    })

    for (const notification of result.notifications) {
      pushEvent(notification.recipientId, "notification", notification)
    }

    return result.project
  },
}
