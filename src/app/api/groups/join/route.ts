import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { joinGroupSchema } from "@/validators/group"
import { groupService } from "@/services/group.service"
import { ZodError } from "zod"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const { inviteCode } = joinGroupSchema.parse(body)
    const result = await groupService.joinGroupByCode(inviteCode, session.user.id)
    return NextResponse.json(result, { status: 200 })
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
