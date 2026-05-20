import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { groupService } from "@/services/group.service"
import { handleApiError } from "@/lib/app-error"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await params
    const group = await groupService.regenerateInviteCode(id, session.user.id)
    return NextResponse.json(group)
  } catch (error) {
    return handleApiError(error)
  }
}
