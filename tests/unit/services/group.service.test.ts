import { describe, it, expect, vi, beforeEach } from "vitest"

const mockTxClient = vi.hoisted(() => ({
  groupMember: { create: vi.fn() },
  groupJoinRequest: { create: vi.fn(), update: vi.fn() },
  notification: { create: vi.fn() },
  project: { create: vi.fn(), update: vi.fn() },
  group: { update: vi.fn() },
}))

const mockPrisma = vi.hoisted(() => ({
  group: {
    findFirst: vi.fn(),
  },
  groupMember: {
    findUnique: vi.fn(),
    count: vi.fn(),
  },
  groupJoinRequest: {
    findUnique: vi.fn(),
  },
  $transaction: vi.fn((cb: Function) => cb(mockTxClient)),
}))

const mockClassRepo = vi.hoisted(() => ({ findFirst: vi.fn() }))
const mockGroupRepo = vi.hoisted(() => ({
  create: vi.fn(),
  findMany: vi.fn(),
  findByInviteCode: vi.fn(),
  findById: vi.fn(),
  findByIdWithDetails: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  updateMemberRole: vi.fn(),
  deleteGroup: vi.fn(),
  update: vi.fn(),
  createJoinRequest: vi.fn(),
  updateJoinRequest: vi.fn(),
  findJoinRequests: vi.fn(),
  count: vi.fn(),
}))
const mockProjectRepo = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
}))
const mockNotificationRepo = vi.hoisted(() => ({
  create: vi.fn().mockResolvedValue({}),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/repositories/class.repository", () => ({ classRepository: mockClassRepo }))
vi.mock("@/repositories/group.repository", () => ({ groupRepository: mockGroupRepo }))
vi.mock("@/repositories/project.repository", () => ({ projectRepository: mockProjectRepo }))
vi.mock("@/repositories/notification.repository", () => ({ notificationRepository: mockNotificationRepo }))
vi.mock("@/repositories/base.repository", () => ({
  paginateResponse: vi.fn((items, total) => ({ items, total })),
}))
vi.mock("@/lib/sse", () => ({ pushEvent: vi.fn() }))

import { groupService } from "@/services/group.service"

describe("groupService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("createGroup", () => {
    it("creates group when class exists", async () => {
      mockClassRepo.findFirst.mockResolvedValue({ id: "c1" })
      mockGroupRepo.create.mockResolvedValue({ id: "g1", name: "Team Alpha" })
      mockGroupRepo.addMember.mockResolvedValue({})

      const result = await groupService.createGroup({ name: "Team Alpha", classId: "c1", maxSize: 5 }, "u1")

      expect(result.name).toBe("Team Alpha")
      expect(mockGroupRepo.create).toHaveBeenCalled()
      expect(mockGroupRepo.addMember).toHaveBeenCalledWith("g1", "u1", "leader")
    })

    it("throws when class not found", async () => {
      mockClassRepo.findFirst.mockResolvedValue(null)
      await expect(groupService.createGroup({ name: "Team", classId: "bad", maxSize: 5 }, "u1"))
        .rejects.toThrow("Class not found")
    })
  })

  describe("joinGroupByCode", () => {
    it("joins group with valid code", async () => {
      mockGroupRepo.findByInviteCode.mockResolvedValue({
        id: "g1",
        name: "Team Alpha",
        isActive: true,
        maxSize: 5,
        classId: "c1",
        members: [],
        creatorId: "u2",
      })
      mockPrisma.group.findFirst.mockResolvedValue(null)
      mockTxClient.groupMember.create.mockResolvedValue({ id: "m1" })
      mockTxClient.notification.create.mockResolvedValue({})

      const result = await groupService.joinGroupByCode("code123", "u1")
      expect(result.id).toBe("m1")
    })

    it("throws when group is full", async () => {
      mockGroupRepo.findByInviteCode.mockResolvedValue({
        id: "g1",
        isActive: true,
        maxSize: 1,
        members: [{ user: { id: "u1" } }, { user: { id: "u2" } }],
      })
      await expect(groupService.joinGroupByCode("code", "u3")).rejects.toThrow("Group is full")
    })

    it("throws when already member", async () => {
      mockGroupRepo.findByInviteCode.mockResolvedValue({
        id: "g1",
        isActive: true,
        maxSize: 5,
        members: [{ user: { id: "u1" } }],
      })
      await expect(groupService.joinGroupByCode("code", "u1")).rejects.toThrow("Already a member of this group")
    })
  })

  describe("approveJoinRequest", () => {
    it("approves pending request", async () => {
      mockPrisma.groupJoinRequest.findUnique.mockResolvedValue({
        id: "r1",
        groupId: "g1",
        userId: "u3",
        status: "PENDING",
        group: {
          maxSize: 5,
          members: [],
        },
      })
      mockTxClient.groupJoinRequest.update.mockResolvedValue({ id: "r1", status: "APPROVED" })
      mockTxClient.groupMember.create.mockResolvedValue({})
      mockTxClient.notification.create.mockResolvedValue({})

      const result = await groupService.approveJoinRequest("r1", "u2")
      expect(result.status).toBe("APPROVED")
    })

    it("throws when request not found", async () => {
      mockPrisma.groupJoinRequest.findUnique.mockResolvedValue(null)
      await expect(groupService.approveJoinRequest("bad", "u2")).rejects.toThrow("Join request not found")
    })

    it("throws when request is not pending", async () => {
      mockPrisma.groupJoinRequest.findUnique.mockResolvedValue({
        id: "r1",
        status: "REJECTED",
        group: { maxSize: 5, members: [] },
      })
      await expect(groupService.approveJoinRequest("r1", "u2")).rejects.toThrow("Join request is no longer pending")
    })

    it("throws when group is full", async () => {
      mockPrisma.groupJoinRequest.findUnique.mockResolvedValue({
        id: "r1",
        groupId: "g1",
        userId: "u3",
        status: "PENDING",
        group: {
          maxSize: 1,
          members: [{ userId: "u1" }, { userId: "u2" }],
        },
      })
      await expect(groupService.approveJoinRequest("r1", "u2")).rejects.toThrow("Group is full")
    })
  })

  describe("leaveGroup", () => {
    it("removes member when group exists", async () => {
      mockGroupRepo.findById.mockResolvedValue({ id: "g1" })
      mockGroupRepo.removeMember.mockResolvedValue({})

      const result = await groupService.leaveGroup("g1", "u1")
      expect(result.success).toBe(true)
      expect(mockGroupRepo.removeMember).toHaveBeenCalledWith("g1", "u1")
    })

    it("throws when group not found", async () => {
      mockGroupRepo.findById.mockResolvedValue(null)
      await expect(groupService.leaveGroup("bad", "u1")).rejects.toThrow("Group not found")
    })
  })

  describe("getGroupById", () => {
    it("returns group with details when user is member", async () => {
      mockGroupRepo.findByIdWithDetails.mockResolvedValue({
        id: "g1",
        name: "Team Alpha",
        members: [{ userId: "u1" }],
        class: { teacherId: "t1" },
      })
      const result = await groupService.getGroupById("g1", "u1")
      expect(result.id).toBe("g1")
    })

    it("returns group when user is teacher", async () => {
      mockGroupRepo.findByIdWithDetails.mockResolvedValue({
        id: "g1",
        name: "Team Alpha",
        members: [{ userId: "u2" }],
        class: { teacherId: "u1" },
      })
      const result = await groupService.getGroupById("g1", "u1")
      expect(result.id).toBe("g1")
    })

    it("throws when not authorized", async () => {
      mockGroupRepo.findByIdWithDetails.mockResolvedValue({
        id: "g1",
        members: [{ userId: "u2" }],
        class: { teacherId: "t1" },
      })
      await expect(groupService.getGroupById("g1", "u1")).rejects.toThrow("Not authorized to view this group")
    })
  })

  describe("updateGroup", () => {
    it("updates group settings when leader", async () => {
      mockGroupRepo.findById.mockResolvedValue({ id: "g1", name: "Old", creatorId: "u1" })
      mockPrisma.groupMember.count.mockResolvedValue(3)
      mockGroupRepo.update.mockResolvedValue({ id: "g1", name: "New" })
      mockTxClient.notification.create.mockResolvedValue({})

      const result = await groupService.updateGroup("g1", { name: "New" }, "u1")
      expect(mockGroupRepo.update).toHaveBeenCalled()
    })

    it("throws when not the leader", async () => {
      mockGroupRepo.findById.mockResolvedValue({ id: "g1", creatorId: "u1" })
      await expect(groupService.updateGroup("g1", { name: "New" }, "u2")).rejects.toThrow("Only the group leader")
    })
  })

  describe("deleteGroup", () => {
    it("deletes group when leader", async () => {
      mockGroupRepo.findByIdWithDetails.mockResolvedValue({
        id: "g1",
        members: [{ userId: "u1", role: "leader" }],
        class: { teacherId: "t1" },
      })
      mockGroupRepo.deleteGroup.mockResolvedValue({})

      const result = await groupService.deleteGroup("g1", "u1")
      expect(result.success).toBe(true)
    })

    it("throws when not leader or teacher", async () => {
      mockGroupRepo.findByIdWithDetails.mockResolvedValue({
        id: "g1",
        members: [{ userId: "u2", role: "leader" }],
        class: { teacherId: "t1" },
      })
      await expect(groupService.deleteGroup("g1", "u1")).rejects.toThrow("Only the group leader or teacher")
    })
  })

  describe("updateMemberRole", () => {
    it("promotes a member to leader", async () => {
      mockGroupRepo.findById.mockResolvedValue({ id: "g1" })
      mockPrisma.groupMember.findUnique
        .mockResolvedValueOnce({ role: "leader" })
      mockGroupRepo.updateMemberRole.mockResolvedValue({ role: "leader" })

      const result = await groupService.updateMemberRole("g1", "u2", { role: "leader" }, "u1")
      expect(mockGroupRepo.updateMemberRole).toHaveBeenCalledWith("g1", "u2", "leader")
    })

    it("throws when actor is not leader", async () => {
      mockGroupRepo.findById.mockResolvedValue({ id: "g1" })
      mockPrisma.groupMember.findUnique.mockResolvedValueOnce({ role: "member" })

      await expect(groupService.updateMemberRole("g1", "u2", { role: "leader" }, "u1")).rejects.toThrow("Only the group leader")
    })
  })

  describe("removeMember", () => {
    it("removes a member when leader", async () => {
      mockGroupRepo.findById.mockResolvedValue({ id: "g1", name: "Team" })
      mockPrisma.groupMember.findUnique
        .mockResolvedValueOnce({ role: "leader" })
        .mockResolvedValueOnce({ role: "member" })
      mockGroupRepo.removeMember.mockResolvedValue({})
      mockNotificationRepo.create.mockResolvedValue({})

      const result = await groupService.removeMember("g1", "u2", "u1")
      expect(result.success).toBe(true)
    })

    it("throws when trying to remove self", async () => {
      mockGroupRepo.findById.mockResolvedValue({ id: "g1" })
      mockPrisma.groupMember.findUnique.mockResolvedValueOnce({ role: "leader" })
      await expect(groupService.removeMember("g1", "u1", "u1")).rejects.toThrow("Use leave instead")
    })
  })

  describe("createGroupProject", () => {
    it("creates project proposal and links to group", async () => {
      mockGroupRepo.findByIdWithDetails.mockResolvedValue({
        id: "g1",
        classId: "c1",
        projectId: null,
        project: null,
        members: [{ userId: "u1" }],
        class: { teacherId: "t1" },
      })
      mockTxClient.project.create.mockResolvedValue({ id: "p1", title: "My Project", status: "PROPOSED" })
      mockTxClient.group.update.mockResolvedValue({})
      mockTxClient.notification.create.mockResolvedValue({})

      const result = await groupService.createGroupProject("g1", { title: "My Project", techStack: ["React"] }, "u1")
      expect(result.title).toBe("My Project")
      expect(result.status).toBe("PROPOSED")
    })

    it("throws when group already has a project", async () => {
      mockGroupRepo.findByIdWithDetails.mockResolvedValue({
        id: "g1",
        projectId: "p1",
        members: [{ userId: "u1" }],
      })
      await expect(groupService.createGroupProject("g1", { title: "P2", techStack: [] }, "u1")).rejects.toThrow("already has a project")
    })
  })

  describe("approveGroupProject", () => {
    it("approves a project proposal", async () => {
      mockGroupRepo.findByIdWithDetails.mockResolvedValue({
        id: "g1",
        projectId: "p1",
        project: { id: "p1", title: "My Project", status: "PROPOSED" },
        members: [{ userId: "u1" }, { userId: "u2" }],
        class: { teacherId: "t1" },
      })
      mockTxClient.project.update.mockResolvedValue({ id: "p1", status: "APPROVED" })
      mockTxClient.notification.create.mockResolvedValue({})

      const result = await groupService.approveGroupProject("g1", "APPROVED", "t1")
      expect(result.status).toBe("APPROVED")
    })

    it("throws when not the class teacher", async () => {
      mockGroupRepo.findByIdWithDetails.mockResolvedValue({
        id: "g1",
        project: { status: "PROPOSED" },
        class: { teacherId: "t1" },
      })
      await expect(groupService.approveGroupProject("g1", "APPROVED", "u2")).rejects.toThrow("Only the class teacher")
    })
  })
})
