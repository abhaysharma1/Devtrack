import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProjectsPageContent } from "@/components/features/projects/projects-page-content"

export default async function TeacherProjectsPage() {
  const session = await auth()
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    redirect("/login")
  }

  const projects = await prisma.project.findMany({
    where: { class: { teacherId: session.user.id }, isArchived: false },
    include: {
      owner: { select: { name: true, image: true } },
      class: { select: { name: true, code: true } },
      group: { include: { members: { include: { user: { select: { name: true } } } } } },
      _count: { select: { milestones: true, comments: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  })

  return <ProjectsPageContent projects={projects} />
}
