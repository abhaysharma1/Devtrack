import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updateGroupSchema } from "@/validators/group"
import { groupService } from "@/services/group.service"
import { handleApiError } from "@/lib/app-error"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await params
    const group = await groupService.getGroupById(id, session.user.id)
    return NextResponse.json(group)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const data = updateGroupSchema.parse(body)
    const group = await groupService.updateGroup(id, data, session.user.id)
    return NextResponse.json(group)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await params
    const result = await groupService.deleteGroup(id, session.user.id)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
