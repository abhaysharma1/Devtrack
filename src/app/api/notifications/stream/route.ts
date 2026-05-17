import { auth } from "@/lib/auth"
import { addClient, removeClient } from "@/lib/sse"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }

  const stream = new ReadableStream<string>({
    start(controller) {
      addClient(session.user.id, controller)

      controller.enqueue(`data: ${JSON.stringify({ type: "connected" })}\n\n`)

      const keepalive = setInterval(() => {
        try {
          controller.enqueue(": keepalive\n\n")
        } catch {
          clearInterval(keepalive)
        }
      }, 30000)

      req.signal.addEventListener("abort", () => {
        clearInterval(keepalive)
        removeClient(session.user.id, controller)
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
