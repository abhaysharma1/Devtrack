import { projectRepository } from "@/repositories/project.repository"
import { activityLogRepository } from "@/repositories/activity-log.repository"
import { classRepository } from "@/repositories/class.repository"
import { paginateResponse } from "@/repositories/base.repository"
import type { ProjectInput } from "@/validators/project"
import type { PaginationInput } from "@/validators/common"

export const projectService = {
  async createProject(input: ProjectInput, userId: string) {
    const classExists = await classRepository.findById(input.classId)
    if (!classExists) {
      throw new Error("Class not found")
    }

    const project = await projectRepository.create({
      title: input.title,
      description: input.description,
      classId: input.classId,
      techStack: JSON.stringify(input.techStack),
      ownerId: userId,
      tags: "[]",
    })

    await activityLogRepository.create({
      type: "PROJECT_CREATED",
      description: "created a new project",
      projectId: project.id,
      userId,
    })

    return project
  },

  async getProjects(role: string, userId: string, pagination?: PaginationInput) {
    const where = role === "STUDENT" ? { ownerId: userId } : undefined
    const items = await projectRepository.findMany(where, pagination)
    if (!pagination) return items
    const total = await projectRepository.count(where)
    return paginateResponse(items, total, pagination)
  },
}
