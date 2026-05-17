import { prisma } from "@/lib/prisma"
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

    const result = await prisma.$transaction(async (tx) => {
      const submission = await tx.milestoneSubmission.create({
        data: {
          milestoneId: input.milestoneId,
          userId,
          content: input.content,
          notes: input.notes,
        },
      })

      await tx.milestone.update({
        where: { id: input.milestoneId },
        data: { status: "SUBMITTED" },
      })

      await tx.activityLog.create({
        data: {
          type: "MILESTONE_SUBMITTED",
          description: `submitted milestone "${milestone.title}"`,
          projectId: milestone.projectId,
          userId,
        },
      })

      if (project.class?.teacherId) {
        const notification = await tx.notification.create({
          data: {
            type: "STATUS_CHANGE",
            title: "Milestone Submitted",
            message: `${userName} submitted "${milestone.title}" for ${project.title}`,
            recipientId: project.class.teacherId,
            senderId: userId,
            link: `/teacher/projects/${milestone.projectId}`,
          },
        })
        pushEvent(project.class.teacherId, "notification", notification)
      }

      return submission
    })

    return result
  },

  async gradeSubmission(input: GradeInput, userId: string, userRole: string) {
    const submission = await submissionRepository.findById(input.submissionId, {
      milestone: { include: { project: { include: { class: true } } } },
    })
    if (!submission) {
      throw new Error("Submission not found")
    }

    if (userRole !== "TEACHER" && userRole !== "ADMIN") {
      throw new Error("Only teachers can grade submissions")
    }

    const ms = (submission as any).milestone
    const project = ms?.project

    if (userRole === "TEACHER" && project?.class?.teacherId && project.class.teacherId !== userId) {
      throw new Error("Not your class's project")
    }

    const milestoneStatus = input.grade >= 50 ? "APPROVED" : "REJECTED"
    const activityType = milestoneStatus === "APPROVED" ? "MILESTONE_APPROVED" : "MILESTONE_REJECTED"
    const activityDesc = milestoneStatus === "APPROVED" ? "approved" : "rejected"

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.milestoneSubmission.update({
        where: { id: input.submissionId },
        data: { grade: input.grade, feedback: input.feedback },
      })

      await tx.milestone.update({
        where: { id: submission.milestoneId },
        data: { status: milestoneStatus, completedAt: new Date() },
      })

      await tx.activityLog.create({
        data: {
          type: activityType,
          description: `${activityDesc} milestone "${ms.title}" with grade ${input.grade}`,
          projectId: ms.projectId,
          userId,
        },
      })

      const milestones = await tx.milestone.findMany({
        where: { projectId: ms.projectId },
      })
      const totalWeight = milestones.reduce((s, m) => s + m.weight, 0)
      const completedWeight = milestones
        .filter((m) => m.status === "APPROVED")
        .reduce((s, m) => s + m.weight, 0)
      const completionPct = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0

      await tx.project.update({
        where: { id: ms.projectId },
        data: { completionPct },
      })

      const notification = await tx.notification.create({
        data: {
          type: activityType,
          title: `Milestone ${milestoneStatus === "APPROVED" ? "Approved" : "Rejected"}`,
          message: `Your milestone "${ms.title}" was ${activityDesc} with grade ${input.grade}`,
          recipientId: submission.userId,
          senderId: userId,
          link: `/student/projects/${ms.projectId}`,
        },
      })

      return { updated, notification }
    })

    pushEvent(submission.userId, "notification", result.notification)
    return result.updated
  },
}
