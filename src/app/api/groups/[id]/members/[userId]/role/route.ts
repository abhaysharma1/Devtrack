import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updateMemberRoleSchema } from "@/validators/group"
import { groupService } from "@/services/group.service"
import { handleApiError } from "@/lib/app-error"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id, userId } = await params
    const body = await req.json()
    const data = updateMemberRoleSchema.parse(body)
    const member = await groupService.updateMemberRole(id, userId, data, session.user.id)
    return NextResponse.json(member)
  } catch (error) {
    return handleApiError(error)
  }
}
