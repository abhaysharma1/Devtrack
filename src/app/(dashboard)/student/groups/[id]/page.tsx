"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, Crown, LogOut, ArrowLeft, Loader2, ExternalLink, Plus, Pencil } from "lucide-react"
import { getInitials, getStatusColor } from "@/lib/utils"
import { toast } from "sonner"

interface GroupMember {
  id: string
  userId: string
  role: string
  joinedAt: string
  user: { id: string; name: string; image: string | null; email: string }
}

interface GroupProject {
  id: string
  title: string
  description: string | null
  status: string
  techStack: string
  repoUrl: string | null
  liveUrl: string | null
}

interface GroupData {
  id: string
  name: string
  maxSize: number
  inviteCode: string
  isActive: boolean
  class: { id: string; name: string; code: string; teacherId: string }
  creator: { id: string; name: string; image: string | null }
  members: GroupMember[]
  project: GroupProject | null
}

export default function StudentGroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string

  const [group, setGroup] = useState<GroupData | null>(null)
  const [loading, setLoading] = useState(true)
  const [projectOpen, setProjectOpen] = useState(false)
  const [editProjectOpen, setEditProjectOpen] = useState(false)
  const [projectTitle, setProjectTitle] = useState("")
  const [projectDesc, setProjectDesc] = useState("")
  const [projectTechStack, setProjectTechStack] = useState("")
  const [projectRepoUrl, setProjectRepoUrl] = useState("")
  const [projectLiveUrl, setProjectLiveUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    loadGroup()
  }, [groupId])

  async function loadGroup() {
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`)
      if (!res.ok) {
        toast.error("Failed to load group")
        router.push("/student/groups")
        return
      }
      const data = await res.json()
      setGroup(data)
    } catch {
      toast.error("Something went wrong")
      router.push("/student/groups")
    } finally {
      setLoading(false)
    }
  }

  const currentUserId = session?.user?.id

  async function handleLeave() {
    if (!confirm(`Leave "${group?.name}"?`)) return
    try {
      const res = await fetch(`/api/groups/${groupId}/leave`, { method: "POST" })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to leave"); return }
      toast.success("Left group")
      router.push("/student/groups")
    } catch {
      toast.error("Something went wrong")
    }
  }

  async function handleCreateProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectTitle,
          description: projectDesc || undefined,
          techStack: projectTechStack ? projectTechStack.split(",").map((s) => s.trim()) : [],
          repoUrl: projectRepoUrl || undefined,
          liveUrl: projectLiveUrl || undefined,
        }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to create project"); return }
      toast.success("Project proposal submitted!")
      setProjectOpen(false)
      loadGroup()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEditProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/groups/${groupId}/project`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectTitle,
          description: projectDesc || undefined,
          techStack: projectTechStack ? projectTechStack.split(",").map((s) => s.trim()) : [],
          repoUrl: projectRepoUrl || undefined,
          liveUrl: projectLiveUrl || undefined,
        }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to update project"); return }
      toast.success("Project proposal updated!")
      setEditProjectOpen(false)
      loadGroup()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!group) return null

  const members = group.members
  const leader = members.find((m) => m.role === "leader")
  const project = group.project

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/student/groups")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-muted-foreground">{group.class.name} ({group.class.code})</p>
        </div>
        <Badge variant="outline" className="ml-auto font-mono text-xs">{group.inviteCode}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Members</CardTitle>
              <span className="text-sm text-muted-foreground">{members.length}/{group.maxSize}</span>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={m.user.image || ""} />
                        <AvatarFallback>{getInitials(m.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{m.user.name}</span>
                          {m.role === "leader" && (
                            <Crown className="h-3.5 w-3.5 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{m.user.email}</p>
                      </div>
                    </div>
                    {m.role === "leader" && (
                      <Badge variant="secondary" className="text-[10px]">Leader</Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project</CardTitle>
          </CardHeader>
          <CardContent>
            {!project ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-8 w-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">No project yet</p>
                <Dialog open={projectOpen} onOpenChange={setProjectOpen}>
                  <DialogTrigger>
                    <Button size="sm"><Plus className="mr-1 h-3 w-3" /> Propose Project</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Propose Project</DialogTitle>
                      <DialogDescription>Submit a project proposal for teacher approval</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateProject}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Project Title</Label>
                          <Input id="title" placeholder="My Project" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required disabled={submitting} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="desc">Description</Label>
                          <Textarea id="desc" placeholder="Describe your project..." value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} disabled={submitting} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tech">Tech Stack (comma-separated)</Label>
                          <Input id="tech" placeholder="React, Node.js, PostgreSQL" value={projectTechStack} onChange={(e) => setProjectTechStack(e.target.value)} disabled={submitting} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="repo">Repository URL</Label>
                          <Input id="repo" placeholder="https://github.com/..." value={projectRepoUrl} onChange={(e) => setProjectRepoUrl(e.target.value)} disabled={submitting} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="live">Live URL</Label>
                          <Input id="live" placeholder="https://..." value={projectLiveUrl} onChange={(e) => setProjectLiveUrl(e.target.value)} disabled={submitting} />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" disabled={submitting}>
                          {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                          {submitting ? "Submitting..." : "Submit Proposal"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status === "PROPOSED" ? "Proposal Pending" : project.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                )}
                {project.techStack && project.techStack !== "[]" && project.techStack !== "null" && (
                  <div className="flex flex-wrap gap-1">
                    {JSON.parse(project.techStack).map((tech: string) => (
                      <Badge key={tech} variant="secondary" className="text-[10px]">{tech}</Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  {(project.repoUrl || project.liveUrl) && (
                    <>
                      {project.repoUrl && (
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted h-7 gap-1 px-2.5 text-[0.8rem] whitespace-nowrap">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> Repo
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted h-7 gap-1 px-2.5 text-[0.8rem] whitespace-nowrap">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> Live
                        </a>
                      )}
                    </>
                  )}
                  {project.status === "PROPOSED" && (
                    <Dialog open={editProjectOpen} onOpenChange={setEditProjectOpen}>
                      <DialogTrigger>
                        <Button size="sm" variant="outline"><Pencil className="mr-1 h-3 w-3" /> Edit</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Project Proposal</DialogTitle>
                          <DialogDescription>Update your project proposal details</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditProject}>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-title">Project Title</Label>
                              <Input id="edit-title" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} required disabled={submitting} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-desc">Description</Label>
                              <Textarea id="edit-desc" value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} disabled={submitting} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-tech">Tech Stack (comma-separated)</Label>
                              <Input id="edit-tech" value={projectTechStack} onChange={(e) => setProjectTechStack(e.target.value)} disabled={submitting} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-repo">Repository URL</Label>
                              <Input id="edit-repo" value={projectRepoUrl} onChange={(e) => setProjectRepoUrl(e.target.value)} disabled={submitting} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-live">Live URL</Label>
                              <Input id="edit-live" value={projectLiveUrl} onChange={(e) => setProjectLiveUrl(e.target.value)} disabled={submitting} />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" disabled={submitting}>
                              {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                              {submitting ? "Saving..." : "Save Changes"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleLeave}>
          <LogOut className="mr-1 h-3 w-3" /> Leave Group
        </Button>
      </div>
    </div>
  )
}
