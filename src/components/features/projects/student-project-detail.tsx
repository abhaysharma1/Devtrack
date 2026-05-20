"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft, GitBranch, ExternalLink, Calendar, MessageSquare,
  CheckCircle2, XCircle, Clock, Users, Send, Loader2, Upload, Paperclip, Trash2,
} from "lucide-react"
import { getInitials, getStatusColor, formatDate, formatDateRelative } from "@/lib/utils"
import { toast } from "sonner"
import { UploadButton } from "@/lib/uploadthing"
import { GitHubRepoManager } from "@/components/features/github/github-repo-manager"
import { MilestoneCreateForm, MilestoneEditForm } from "@/components/features/milestones"
import type { Milestone, MilestoneSubmission, Comment, GitHubRepository, Group, GroupMember, FileAttachment } from "@prisma/client"

interface StudentProjectDetailProps {
  project: {
    id: string
    title: string
    description: string | null
    techStack: string
    status: string
    completionPct: number
    repoUrl: string | null
    liveUrl: string | null
    dueDate: Date | null
    tags: string
    owner: { id: string; name: string; image: string | null }
    class: { name: string; code: string }
    group: (Group & { members: (GroupMember & { user: { id: string; name: string; image: string | null } })[] }) | null
    milestones: (Milestone & { submissions: MilestoneSubmission[] })[]
    comments: (Comment & { user: { id: string; name: string; image: string | null }; replies: (Comment & { user: { id: string; name: string; image: string | null } })[] })[]
    repositories: GitHubRepository[]
    attachments: FileAttachment[]
  }
  userId: string
}

export function StudentProjectDetail({ project, userId }: StudentProjectDetailProps) {
  const router = useRouter()
  const [commentText, setCommentText] = useState("")
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [submitContent, setSubmitContent] = useState("")
  const [submitNotes, setSubmitNotes] = useState("")
  const [activeMilestone, setActiveMilestone] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; url: string; key: string; size: number; type: string }[]>>({})

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

  async function submitMilestone(milestoneId: string) {
    if (!submitContent.trim()) return
    setSubmitting(`submit-${milestoneId}`)
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, content: submitContent, notes: submitNotes }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to submit"); setSubmitting(null); return }

      // Save uploaded file records
      const files = uploadedFiles[milestoneId] || []
      for (const f of files) {
        await fetch("/api/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: project.id,
            fileName: f.name,
            fileSize: f.size,
            mimeType: f.type,
            url: f.url,
            key: f.key,
          }),
        })
      }

      toast.success("Milestone submitted!")
      setSubmitContent("")
      setSubmitNotes("")
      setActiveMilestone(null)
      setUploadedFiles((prev) => { const next = { ...prev }; delete next[milestoneId]; return next })
      setSubmitting(null)
      router.refresh()
    } catch { toast.error("Something went wrong"); setSubmitting(null) }
  }

  const completedMilestones = project.milestones.filter((m) => m.status === "APPROVED").length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/student/projects" className="inline-flex items-center justify-center rounded-md hover:bg-accent h-7 w-7">
            <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{project.class.code}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Overview */}
          <Card>
            <CardHeader><CardTitle>Project Overview</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {project.description && <p className="text-sm">{project.description}</p>}
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{project.completionPct}% ({completedMilestones}/{project.milestones.length} milestones)</span>
                </div>
                <Progress value={project.completionPct} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {project.dueDate && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Due {formatDate(project.dueDate)}</span>}
                {project.group && <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {project.group.members.length} members</span>}
              </div>
              {techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {techStack.map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}
                </div>
              )}
              <div className="flex gap-3">
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
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Milestones</CardTitle>
                <MilestoneCreateForm projectId={project.id} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.milestones.map((ms) => {
                const submission = ms.submissions[0]
                const isActive = activeMilestone === ms.id
                return (
                  <div key={ms.id} className={`border rounded-lg p-4 ${ms.status === "APPROVED" ? "border-border bg-muted/30" : ""}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {ms.status === "APPROVED" ? <CheckCircle2 className="h-5 w-5 text-primary" /> :
                           ms.status === "REJECTED" ? <XCircle className="h-5 w-5 text-destructive" /> :
                           ms.status === "SUBMITTED" ? <Clock className="h-5 w-5 text-muted-foreground" /> :
                           <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">#{ms.order} {ms.title}</span>
                            <Badge className={getStatusColor(ms.status)}>{ms.status.replace("_", " ")}</Badge>
                            <MilestoneEditForm milestone={ms} />
                          </div>
                          {ms.description && <p className="text-xs text-muted-foreground mt-1">{ms.description}</p>}
                          {ms.dueDate && <p className="text-xs text-muted-foreground mt-1">Due: {formatDate(ms.dueDate)}</p>}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        <p>Weight: {ms.weight}</p>
                      </div>
                    </div>

                    {/* Submission area */}
                    {ms.status === "PENDING" || ms.status === "IN_PROGRESS" ? (
                      <div className="mt-3">
                        {isActive ? (
                          <div className="space-y-2 bg-muted/30 rounded p-3">
                            <Textarea placeholder="Describe what you've completed..." value={submitContent}
                              onChange={(e) => setSubmitContent(e.target.value)} rows={3} disabled={submitting !== null} />
                            <Textarea placeholder="Additional notes (optional)" value={submitNotes}
                              onChange={(e) => setSubmitNotes(e.target.value)} rows={2} className="text-sm" disabled={submitting !== null} />

                            {/* File upload */}
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground font-medium">Attachments</p>
                              <UploadButton
                                endpoint="attachment"
                                onClientUploadComplete={(res) => {
                                  const files = res.map((f) => ({
                                    name: f.name,
                                    url: f.url,
                                    key: f.key,
                                    size: f.size,
                                    type: f.type,
                                  }))
                                  setUploadedFiles((prev) => ({ ...prev, [ms.id]: [...(prev[ms.id] || []), ...files] }))
                                  toast.success("Files uploaded")
                                }}
                                onUploadError={(err) => {
                                  toast.error(err.message || "Upload failed")
                                }}
                                appearance={{
                                  button: { fontSize: "12px", padding: "4px 12px", height: "auto" },
                                  allowedContent: { fontSize: "11px" },
                                }}
                              />
                              {uploadedFiles[ms.id] && uploadedFiles[ms.id].length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {uploadedFiles[ms.id].map((f) => (
                                    <a key={f.key} href={f.url} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs bg-background border rounded px-2 py-1 hover:bg-muted transition-colors">
                                      <Paperclip className="h-3 w-3" />
                                      <span className="max-w-[120px] truncate">{f.name}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => submitMilestone(ms.id)} disabled={submitting !== null || !submitContent.trim()}>
                                {submitting === `submit-${ms.id}` ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Upload className="mr-1 h-3 w-3" />}
                                {submitting === `submit-${ms.id}` ? "Submitting..." : "Submit"}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setActiveMilestone(null)}>Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="mt-2" onClick={() => setActiveMilestone(ms.id)}>
                            <Upload className="mr-1 h-3 w-3" /> Submit Milestone
                          </Button>
                        )}
                      </div>
                    ) : null}

                    {/* Feedback */}
                    {submission?.feedback && (
                      <div className="mt-3 bg-muted/30 rounded p-3 text-sm">
                        <p className="font-medium text-xs text-muted-foreground mb-1">Teacher Feedback:</p>
                        <p>{submission.feedback}</p>
                        {submission.grade !== null && <p className="mt-1 font-medium">Grade: {submission.grade}/100</p>}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader><CardTitle>Comments</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea placeholder="Ask a question or share an update..." value={commentText}
                  onChange={(e) => setCommentText(e.target.value)} className="min-h-[80px]" disabled={submitting === "comment"} />
              </div>
              <Button onClick={addComment} disabled={submitting !== null || !commentText.trim()}>
                {submitting === "comment" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {submitting === "comment" ? "Posting..." : "Post Comment"}
              </Button>
              <Separator />
              <div className="space-y-4">
                {project.comments.map((comment) => (
                  <div key={comment.id}>
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
                      <div key={reply.id} className="flex gap-3 ml-12 mt-2">
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {project.group && (
            <Card>
              <CardHeader><CardTitle>Team Members</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.group.members.map((m) => (
                    <div key={m.user.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8"><AvatarImage src={m.user.image || ""} /><AvatarFallback className="text-xs">{getInitials(m.user.name)}</AvatarFallback></Avatar>
                      <span className="text-sm">{m.user.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <GitHubRepoManager projectId={project.id} repositories={project.repositories} />

          <Card>
            <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className={getStatusColor(project.status)}>{project.status.replace("_", " ")}</Badge></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Progress</span><span>{project.completionPct}%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Milestones</span><span>{completedMilestones}/{project.milestones.length}</span></div>
              {project.dueDate && <div className="flex justify-between"><span className="text-muted-foreground">Due</span><span>{formatDate(project.dueDate)}</span></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
