import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { commentSchema, paginationSchema } from "@/validators"
import { commentService } from "@/services/comment.service"
import { ZodError } from "zod"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = commentSchema.parse(body)
    const comment = await commentService.addComment(data, session.user.id, session.user.role, session.user.name || "")
    return NextResponse.json(comment, { status: 201 })
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

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const url = new URL(req.url)
    const projectId = url.searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json({ error: "projectId query param required" }, { status: 400 })
    }

    const pagination = paginationSchema.parse(Object.fromEntries(url.searchParams))
    const result = await commentService.getComments(projectId, pagination)
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
