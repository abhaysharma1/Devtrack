import { describe, it, expect, vi, beforeEach } from "vitest"

const mockClassRepo = vi.hoisted(() => ({ findFirst: vi.fn() }))
const mockGroupRepo = vi.hoisted(() => ({
  create: vi.fn(),
  findMany: vi.fn(),
  findByInviteCode: vi.fn(),
  findById: vi.fn(),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  createJoinRequest: vi.fn(),
  updateJoinRequest: vi.fn(),
  findJoinRequests: vi.fn(),
  count: vi.fn(),
}))
const mockNotifRepo = vi.hoisted(() => ({ create: vi.fn() }))

vi.mock("@/repositories/class.repository", () => ({ classRepository: mockClassRepo }))
vi.mock("@/repositories/group.repository", () => ({ groupRepository: mockGroupRepo }))
vi.mock("@/repositories/notification.repository", () => ({ notificationRepository: mockNotifRepo }))
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
        members: [],
        creatorId: "u2",
      })
      mockGroupRepo.addMember.mockResolvedValue({ id: "m1" })
      mockNotifRepo.create.mockResolvedValue({})

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
})
