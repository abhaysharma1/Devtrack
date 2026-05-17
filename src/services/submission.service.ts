import { submissionRepository } from "@/repositories/submission.repository"
import { notificationRepository } from "@/repositories/notification.repository"
import { activityLogRepository } from "@/repositories/activity-log.repository"
import { milestoneRepository } from "@/repositories/milestone.repository"
import { projectRepository } from "@/repositories/project.repository"
import { pushEvent } from "@/lib/sse"
import type { SubmitInput, GradeInput } from "@/validators/submission"

export const submissionService = {
  async submitMilestone(input: SubmitInput, userId: string, userName: string, userRole: string) {
    const milestone = await milestoneRepository.findById(input.milestoneId, {
      project: { include: { class: true } },
    })
    if (!milestone) {
      throw new Error("Milestone not found")
    }

    const project = (milestone as any).project
    if (project.ownerId !== userId && userRole === "STUDENT") {
      throw new Error("Not your project")
    }

    const existing = await submissionRepository.findByMilestoneAndUser(input.milestoneId, userId)
    if (existing) {
      throw new Error("Already submitted")
    }

    const submission = await submissionRepository.create({
      milestoneId: input.milestoneId,
      userId,
      content: input.content,
      notes: input.notes,
    })

    await milestoneRepository.update(input.milestoneId, { status: "SUBMITTED" })

    await activityLogRepository.create({
      type: "MILESTONE_SUBMITTED",
      description: `submitted milestone "${milestone.title}"`,
      projectId: milestone.projectId,
      userId,
    })

    if (project.class?.teacherId) {
      const notification = await notificationRepository.create({
        type: "STATUS_CHANGE",
        title: "Milestone Submitted",
        message: `${userName} submitted "${milestone.title}" for ${project.title}`,
        recipientId: project.class.teacherId,
        senderId: userId,
      })
      pushEvent(project.class.teacherId, "notification", notification)
    }

    return submission
  },

  async gradeSubmission(input: GradeInput, userId: string) {
    const submission = await submissionRepository.findById(input.submissionId, {
      milestone: { include: { project: { include: { class: true } } } },
    })
    if (!submission) {
      throw new Error("Submission not found")
    }

    const updated = await submissionRepository.update(input.submissionId, {
      grade: input.grade,
      feedback: input.feedback,
    })

    const milestoneStatus = input.grade >= 50 ? "APPROVED" : "REJECTED"
    await milestoneRepository.update(submission.milestoneId, {
      status: milestoneStatus,
      completedAt: new Date(),
    })

    const activityType = milestoneStatus === "APPROVED" ? "MILESTONE_APPROVED" : "MILESTONE_REJECTED"
    const activityDesc = milestoneStatus === "APPROVED" ? "approved" : "rejected"

    await activityLogRepository.create({
      type: activityType,
      description: `${activityDesc} milestone "${(submission as any).milestone.title}" with grade ${input.grade}`,
      projectId: (submission as any).milestone.projectId,
      userId,
    })

    const notification = await notificationRepository.create({
      type: activityType,
      title: `Milestone ${milestoneStatus === "APPROVED" ? "Approved" : "Rejected"}`,
      message: `Your milestone "${(submission as any).milestone.title}" was ${activityDesc} with grade ${input.grade}`,
      recipientId: submission.userId,
      senderId: userId,
    })
    pushEvent(submission.userId, "notification", notification)

    const ms = (submission as any).milestone
    const milestones = await milestoneRepository.findManyByProject(ms.projectId)
    const totalWeight = milestones.reduce((s, m) => s + m.weight, 0)
    const completedWeight = milestones
      .filter((m) => m.status === "APPROVED")
      .reduce((s, m) => s + m.weight, 0)
    const completionPct = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0

    await projectRepository.update(ms.projectId, { completionPct })

    return updated
  },
}
