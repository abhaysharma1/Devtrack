import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { approveRequestSchema } from "@/validators/group"
import { groupService } from "@/services/group.service"
import { ZodError } from "zod"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { status } = approveRequestSchema.parse(body)

    const result = status === "APPROVED"
      ? await groupService.approveJoinRequest(id, session.user.id)
      : await groupService.rejectJoinRequest(id, session.user.id)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
