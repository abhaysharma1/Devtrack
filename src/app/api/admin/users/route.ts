import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createUserSchema, paginationSchema } from "@/validators"
import { userService } from "@/services/user.service"
import { ZodError } from "zod"

export async function GET(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const url = new URL(req.url)
  const search = url.searchParams.get("search") || ""
  const role = url.searchParams.get("role") || ""
  const pagination = paginationSchema.parse(Object.fromEntries(url.searchParams))

  const result = await userService.listUsers({ search, role }, pagination)
  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = createUserSchema.parse(body)
    const user = await userService.createUser(data)
    return NextResponse.json(user, { status: 201 })
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
