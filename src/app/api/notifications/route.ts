import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { paginationSchema } from "@/validators/common"
import { notificationService } from "@/services/notification.service"
import { ZodError } from "zod"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const url = new URL(req.url)
    const count = url.searchParams.get("count")

    if (count === "true") {
      const unreadCount = await notificationService.getUnreadCount(session.user.id)
      return NextResponse.json({ count: unreadCount })
    }

    const pagination = paginationSchema.parse(Object.fromEntries(url.searchParams))
    const result = await notificationService.listNotifications(session.user.id, pagination)
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

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    if (body.all === true) {
      const result = await notificationService.markAllAsRead(session.user.id)
      return NextResponse.json(result)
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
