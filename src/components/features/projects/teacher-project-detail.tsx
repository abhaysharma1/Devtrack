"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft, GitBranch, ExternalLink, Calendar, MessageSquare,
  CheckCircle2, XCircle, Users, FileText, Loader2, Send,
} from "lucide-react"
import { getInitials, getStatusColor, formatDate, formatDateRelative } from "@/lib/utils"
import { toast } from "sonner"
import { MilestoneList } from "@/components/features/milestones/milestone-list"
import { GitHubRepoManager } from "@/components/features/github/github-repo-manager"
import type { Milestone, MilestoneSubmission, Comment, GitHubRepository, ActivityLog, Group, GroupMember } from "@prisma/client"

interface ProjectDetail {
  id: string
  title: string
  description: string | null
  techStack: string
  status: string
  priority: string
  completionPct: number
  repoUrl: string | null
  liveUrl: string | null
  dueDate: Date | null
  tags: string
  owner: { id: string; name: string; image: string | null; email: string }
  class: { id: string; name: string; code: string; teacherId: string }
  group: (Group & { members: (GroupMember & { user: { id: string; name: string; image: string | null } })[] }) | null
  milestones: (Milestone & { submissions: (MilestoneSubmission & { user: { id: string; name: string; image: string | null } })[] })[]
  comments: (Comment & { user: { id: string; name: string; image: string | null }; replies: (Comment & { user: { id: string; name: string; image: string | null } })[] })[]
  repositories: GitHubRepository[]
  activities: (ActivityLog & { user: { name: string; image: string | null } })[]
}

export function TeacherProjectDetail({ project, userId }: { project: ProjectDetail; userId: string }) {
  const router = useRouter()
  const [commentText, setCommentText] = useState("")
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [gradingStates, setGradingStates] = useState<Record<string, { grade: string; feedback: string }>>({})

  const techStack = parseJsonArray(project.techStack)
  const tags = parseJsonArray(project.tags)

  function parseJsonArray(val: string): string[] {
    try { return JSON.parse(val) } catch { return [] }
  }

  async function addComment() {
    if (!commentText.trim()) return
    setSubmitting("comment")
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText, projectId: project.id }),
      })
      if (!res.ok) { toast.error("Failed to add comment"); setSubmitting(null); return }
      setCommentText("")
      toast.success("Comment added")
      setSubmitting(null)
      router.refresh()
    } catch { toast.error("Something went wrong"); setSubmitting(null) }
  }

  async function handleGrade(submissionId: string, grade: number, feedback: string) {
    setSubmitting(`grade-${submissionId}`)
    try {
      const res = await fetch("/api/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, grade, feedback }),
      })
      if (!res.ok) { toast.error("Failed to grade"); setSubmitting(null); return }
      toast.success("Graded successfully")
      setSubmitting(null)
      router.refresh()
    } catch { toast.error("Something went wrong"); setSubmitting(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/projects" className="inline-flex items-center justify-center rounded-md hover:bg-accent h-7 w-7">
            <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
            <Badge variant="outline" className="capitalize">{project.priority}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{project.class.code} &middot; {project.owner.name}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {project.description && <p className="text-sm">{project.description}</p>}
              <Progress value={project.completionPct} className="w-full" />
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {project.dueDate ? formatDate(project.dueDate) : "No due date"}</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {project.group?.members.length ?? 1} members</span>
                <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {project.milestones.length} milestones</span>
              </div>
              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {techStack.map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}
                </div>
              )}
              <div className="flex gap-2">
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <GitBranch className="h-4 w-4" /> Repository
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                    <ExternalLink className="h-4 w-4" /> Live Demo
                  </a>
                )}
              </div>
              {project.group && (
                <div>
                  <p className="text-sm font-medium mb-2">Team Members</p>
                  <div className="flex flex-wrap gap-2">
                    {project.group.members.map((m) => (
                      <div key={m.user.id} className="flex items-center gap-2 bg-muted rounded-full px-3 py-1">
                        <Avatar className="h-5 w-5"><AvatarImage src={m.user.image || ""} /><AvatarFallback className="text-[8px]">{getInitials(m.user.name)}</AvatarFallback></Avatar>
                        <span className="text-xs">{m.user.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
            <CardContent>
              <MilestoneList
                milestones={project.milestones}
                onGrade={handleGrade}
                isGrading={submitting}
                gradingStates={gradingStates}
                onGradingChange={(id, field, value) =>
                  setGradingStates((p) => ({ ...p, [id]: { ...p[id], [field]: value } }))
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Comments & Feedback</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea placeholder="Add a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="min-h-[80px]" disabled={submitting === "comment"} />
              </div>
              <Button onClick={addComment} disabled={submitting !== null || !commentText.trim()}>
                {submitting === "comment" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {submitting === "comment" ? "Posting..." : "Post Comment"}
              </Button>
              <Separator />
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {project.comments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8"><AvatarImage src={comment.user.image || ""} /><AvatarFallback className="text-xs">{getInitials(comment.user.name)}</AvatarFallback></Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{comment.user.name}</span>
                            <span className="text-xs text-muted-foreground">{formatDateRelative(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-3 ml-12">
                          <Avatar className="h-7 w-7"><AvatarImage src={reply.user.image || ""} /><AvatarFallback className="text-[10px]">{getInitials(reply.user.name)}</AvatarFallback></Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{reply.user.name}</span>
                              <span className="text-xs text-muted-foreground">{formatDateRelative(reply.createdAt)}</span>
                            </div>
                            <p className="text-sm mt-1">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Activity Log</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {project.activities.map((a) => (
                    <div key={a.id} className="flex items-start gap-2 text-sm border-b pb-2 last:border-0">
                      <Avatar className="h-6 w-6"><AvatarImage src={a.user.image || ""} /><AvatarFallback className="text-[8px]">{getInitials(a.user.name)}</AvatarFallback></Avatar>
                      <div className="flex-1">
                        <p><span className="font-medium">{a.user.name}</span> {a.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDateRelative(a.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <GitHubRepoManager projectId={project.id} repositories={project.repositories} />
        </div>
      </div>
    </div>
  )
}
