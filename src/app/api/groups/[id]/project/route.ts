import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { z } from "zod"
import { groupService } from "@/services/group.service"
import { handleApiError } from "@/lib/app-error"

const groupProjectSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  techStack: z.array(z.string()).default([]),
  repoUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id } = await params
    const body = await req.json()
    const data = groupProjectSchema.parse(body)
    const project = await groupService.createGroupProject(id, data, session.user.id)
    return NextResponse.json(project, { status: 201 })
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
    const data = groupProjectSchema.partial().parse(body)
    const project = await groupService.updateGroupProject(id, data, session.user.id)
    return NextResponse.json(project)
  } catch (error) {
    return handleApiError(error)
  }
}
