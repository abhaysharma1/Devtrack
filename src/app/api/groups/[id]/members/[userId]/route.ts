import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { groupService } from "@/services/group.service"
import { handleApiError } from "@/lib/app-error"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id, userId } = await params
    const result = await groupService.removeMember(id, userId, session.user.id)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
