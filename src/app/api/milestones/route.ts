import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createMilestoneSchema } from "@/validators/milestone"
import { milestoneService } from "@/services/milestone.service"
import { ZodError } from "zod"
import { handleApiError } from "@/lib/app-error"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = createMilestoneSchema.parse(body)
    const milestone = await milestoneService.createMilestone(data, session.user.id)
    return NextResponse.json(milestone, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
