import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updateProjectStatusSchema } from "@/validators/group"
import { groupService } from "@/services/group.service"
import { handleApiError } from "@/lib/app-error"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const { status } = updateProjectStatusSchema.parse(body)
    const project = await groupService.approveGroupProject(id, status, session.user.id)
    return NextResponse.json(project)
  } catch (error) {
    return handleApiError(error)
  }
}
