import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { groupService } from "@/services/group.service"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const classId = url.searchParams.get("classId") || undefined

  const groups = await groupService.getAvailableGroups(session.user.id, classId)
  return NextResponse.json(groups)
}
