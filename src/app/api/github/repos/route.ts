import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { linkRepositorySchema } from "@/validators/github"
import { githubService } from "@/services/github.service"
import { ZodError } from "zod"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const projectId = url.searchParams.get("projectId")

  if (!projectId) {
    return NextResponse.json({ error: "projectId query parameter is required" }, { status: 400 })
  }

  const repos = await githubService.getRepositories(projectId)
  return NextResponse.json(repos)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const data = linkRepositorySchema.parse(body)
    const repo = await githubService.linkRepository(data.projectId, data.fullName)
    return NextResponse.json(repo, { status: 201 })
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
