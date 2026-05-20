"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, FolderKanban, GitBranch, ExternalLink, MessageSquare, Loader2 } from "lucide-react"
import { getStatusColor, formatDate, formatDateRelative } from "@/lib/utils"
import { toast } from "sonner"
import type { Milestone } from "@prisma/client"

interface MilestoneItem extends Milestone {}

interface StudentProject {
  id: string
  title: string
  description: string | null
  status: string
  completionPct: number
  repoUrl: string | null
  liveUrl: string | null
  dueDate: Date | null
  class: { name: string; code: string }
  group: { name: string } | null
  milestones: MilestoneItem[]
  _count: { comments: number }
}

export function StudentProjectsContent({
  projects,
  classes,
  userId,
}: {
  projects: StudentProject[]
  classes: { id: string; name: string; code: string }[]
  userId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const data = {
      title: form.get("title") as string,
      description: form.get("description") as string,
      classId: form.get("classId") as string,
      techStack: (form.get("techStack") as string || "").split(",").map((s) => s.trim()).filter(Boolean),
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to create project")
        return
      }

      toast.success("Project created")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground">Manage your software projects</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!loading) setOpen(v) }}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-8 gap-1.5 px-2.5 text-sm font-medium hover:bg-primary/80 cursor-pointer">
            <Plus className="h-4 w-4" /> New Project
          </DialogTrigger>
          <DialogContent className="">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted border-t-primary" />
                  <p className="text-xs text-muted-foreground">Creating...</p>
                </div>
              </div>
            )}
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>Start a new software project</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input id="title" name="title" placeholder="E-commerce Platform" required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Brief description of your project" disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classId">Class</Label>
                  <Select name="classId" required disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="techStack">Tech Stack (comma separated)</Label>
                  <Input id="techStack" name="techStack" placeholder="React, Node.js, PostgreSQL" disabled={loading} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search projects..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => {
          const completed = project.milestones.filter((m) => m.status === "APPROVED").length
          const total = project.milestones.length
          return (
            <Link key={project.id} href={`/student/projects/${project.id}`}>
              <Card className="transition-colors hover:bg-accent/50 h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{project.title}</CardTitle>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardDescription>{project.class.code}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={project.completionPct} />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{project.completionPct}% complete</span>
                    {total > 0 && <span>{completed}/{total} milestones</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {project.repoUrl && <GitBranch className="h-3 w-3 text-muted-foreground" />}
                    {project.liveUrl && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                    {project.group && <Badge variant="secondary" className="text-xs">{project.group.name}</Badge>}
                  </div>
                  {project.dueDate && (
                    <p className="text-xs text-muted-foreground">Due: {formatDate(project.dueDate)}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
