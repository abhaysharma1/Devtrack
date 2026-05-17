import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { classSchema, paginationSchema } from "@/validators"
import { classService } from "@/services/class.service"
import { ZodError } from "zod"

export async function POST(req: Request) {
  const session = await auth()
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = classSchema.parse(body)
    const cls = await classService.createClass(data, session.user.id)
    return NextResponse.json(cls, { status: 201 })
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
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(req.url)
  const pagination = paginationSchema.parse(Object.fromEntries(url.searchParams))

  const result = await classService.getClasses(session.user.role, session.user.id, pagination)
  return NextResponse.json(result)
}
