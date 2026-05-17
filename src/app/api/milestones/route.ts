import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createMilestoneSchema } from "@/validators/milestone"
import { milestoneService } from "@/services/milestone.service"
import { ZodError } from "zod"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = createMilestoneSchema.parse(body)
    const milestone = await milestoneService.createMilestone(data, session.user.id)
    return NextResponse.json(milestone, { status: 201 })
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
