import { milestoneRepository } from "@/repositories/milestone.repository"
import { activityLogRepository } from "@/repositories/activity-log.repository"
import type { CreateMilestoneInput, UpdateMilestoneInput } from "@/validators/milestone"

export const milestoneService = {
  async createMilestone(input: CreateMilestoneInput, userId: string) {
    const project = await milestoneRepository.findById(input.projectId, {
      project: { include: { class: true } },
    })
    if (!project || (project as any).project?.class?.teacherId !== userId) {
      throw new Error("Project not found")
    }

    return milestoneRepository.create({
      title: input.title,
      description: input.description,
      projectId: input.projectId,
      order: input.order,
      weight: input.weight,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    })
  },

  async updateMilestone(id: string, input: UpdateMilestoneInput, userId: string, userRole: string) {
    const milestone = await milestoneRepository.findById(id, {
      project: { include: { class: true } },
    })
    if (!milestone) {
      throw new Error("Milestone not found")
    }

    const isTeacher = userRole === "TEACHER" || userRole === "ADMIN"
    const isOwner = (milestone as any).project.ownerId === userId

    if (!isTeacher && !isOwner) {
      throw new Error("Forbidden")
    }

    if (input.status && !isTeacher && input.status !== "SUBMITTED") {
      throw new Error("Only teachers can change status to that value")
    }

    const updateData: Record<string, unknown> = { ...input }
    if (input.status === "APPROVED" || input.status === "REJECTED") {
      updateData.completedAt = new Date()
    }

    const updated = await milestoneRepository.update(id, updateData)

    if (input.status) {
      const statusToType: Record<string, string> = {
        SUBMITTED: "MILESTONE_SUBMITTED",
        APPROVED: "MILESTONE_APPROVED",
        REJECTED: "MILESTONE_REJECTED",
      }
      const statusToDesc: Record<string, string> = {
        SUBMITTED: "submitted",
        APPROVED: "approved",
        REJECTED: "rejected",
      }

      await activityLogRepository.create({
        type: statusToType[input.status] || "PROJECT_UPDATED",
        description: `${statusToDesc[input.status] || "updated"} milestone "${milestone.title}"`,
        projectId: milestone.projectId,
        userId,
      })
    }

    return updated
  },

  async deleteMilestone(id: string, userId: string, userRole: string) {
    const milestone = await milestoneRepository.findById(id, {
      project: { include: { class: true } },
    })
    if (!milestone) {
      throw new Error("Milestone not found")
    }

    const isTeacher = userRole === "TEACHER" || userRole === "ADMIN"
    const isOwner = (milestone as any).project.ownerId === userId

    if (!isTeacher && !isOwner) {
      throw new Error("Forbidden")
    }

    await milestoneRepository.delete(id)
    return { success: true }
  },
}
