"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Crown, ArrowLeft, Loader2, ExternalLink, Check, X, Trash2, RefreshCw, Save, Shield, UserMinus } from "lucide-react"
import { getInitials, getStatusColor } from "@/lib/utils"
import { toast } from "sonner"

interface GroupMember {
  id: string
  userId: string
  role: string
  joinedAt: string
  user: { id: string; name: string; image: string | null; email: string }
}

interface JoinRequest {
  id: string
  groupId: string
  userId: string
  status: string
  createdAt: string
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
  joinRequests: JoinRequest[]
}

export default function TeacherGroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const groupId = params.id as string

  const [group, setGroup] = useState<GroupData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editName, setEditName] = useState("")
  const [editMaxSize, setEditMaxSize] = useState(5)
  const [saving, setSaving] = useState(false)
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)
  const [processingMember, setProcessingMember] = useState<string | null>(null)

  useEffect(() => {
    loadGroup()
  }, [groupId])

  async function loadGroup() {
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`)
      if (!res.ok) {
        toast.error("Failed to load group")
        router.push("/teacher/groups")
        return
      }
      const data = await res.json()
      setGroup(data)
      setEditName(data.name)
      setEditMaxSize(data.maxSize)
    } catch {
      toast.error("Something went wrong")
      router.push("/teacher/groups")
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveSettings() {
    setSaving(true)
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, maxSize: editMaxSize }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to save"); return }
      toast.success("Group settings updated")
      loadGroup()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  async function handleRegenerateInvite() {
    if (!confirm("Regenerate invite code? The old code will stop working.")) return
    try {
      const res = await fetch(`/api/groups/${groupId}/regenerate-invite`, { method: "POST" })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed"); return }
      toast.success("Invite code regenerated")
      loadGroup()
    } catch {
      toast.error("Something went wrong")
    }
  }

  async function handleDeleteGroup() {
    if (!confirm("Delete this group? This action cannot be undone.")) return
    try {
      const res = await fetch(`/api/groups/${groupId}`, { method: "DELETE" })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to delete"); return }
      toast.success("Group deleted")
      router.push("/teacher/groups")
    } catch {
      toast.error("Something went wrong")
    }
  }

  async function handleApproveRequest(requestId: string) {
    setProcessingRequest(requestId)
    try {
      const res = await fetch(`/api/groups/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to approve"); return }
      toast.success("Request approved")
      loadGroup()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setProcessingRequest(null)
    }
  }

  async function handleRejectRequest(requestId: string) {
    setProcessingRequest(requestId)
    try {
      const res = await fetch(`/api/groups/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to reject"); return }
      toast.success("Request rejected")
      loadGroup()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setProcessingRequest(null)
    }
  }

  async function handleChangeRole(targetUserId: string, newRole: string) {
    setProcessingMember(targetUserId)
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${targetUserId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to change role"); return }
      toast.success(newRole === "leader" ? "Promoted to leader" : "Demoted to member")
      loadGroup()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setProcessingMember(null)
    }
  }

  async function handleRemoveMember(targetUserId: string, name: string) {
    if (!confirm(`Remove ${name} from this group?`)) return
    setProcessingMember(targetUserId)
    try {
      const res = await fetch(`/api/groups/${groupId}/members/${targetUserId}`, { method: "DELETE" })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to remove"); return }
      toast.success("Member removed")
      loadGroup()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setProcessingMember(null)
    }
  }

  async function handleApproveProject() {
    try {
      const res = await fetch(`/api/groups/${groupId}/project/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to approve"); return }
      toast.success("Project proposal approved!")
      loadGroup()
    } catch {
      toast.error("Something went wrong")
    }
  }

  async function handleRejectProject() {
    try {
      const res = await fetch(`/api/groups/${groupId}/project/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to reject"); return }
      toast.success("Project proposal rejected")
      loadGroup()
    } catch {
      toast.error("Something went wrong")
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

  const project = group.project
  const pendingRequests = group.joinRequests.filter((r) => r.status === "PENDING")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/teacher/groups")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-muted-foreground">{group.class.name} ({group.class.code})</p>
        </div>
        <Badge variant="outline" className="ml-auto font-mono text-xs">{group.inviteCode}</Badge>
      </div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members ({group.members.length})</TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1 text-[10px] px-1 py-0">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="project">Project</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Group Members</CardTitle>
                <span className="text-sm text-muted-foreground">{group.members.length}/{group.maxSize}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {group.members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={m.user.image || ""} />
                          <AvatarFallback>{getInitials(m.user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{m.user.name}</span>
                            {m.role === "leader" && <Crown className="h-3.5 w-3.5 text-amber-500" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{m.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={m.role === "leader" ? "default" : "secondary"} className="text-[10px]">
                          {m.role === "leader" ? "Leader" : "Member"}
                        </Badge>
                        {m.role !== "leader" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleChangeRole(m.userId, "leader")}
                            disabled={processingMember === m.userId}
                          >
                            <Shield className="mr-1 h-3 w-3" /> Make Leader
                          </Button>
                        )}
                        {m.role === "leader" && group.members.filter((mm) => mm.role === "leader").length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleChangeRole(m.userId, "member")}
                            disabled={processingMember === m.userId}
                          >
                            Demote
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive"
                          onClick={() => handleRemoveMember(m.userId, m.user.name)}
                          disabled={processingMember === m.userId}
                        >
                          <UserMinus className="mr-1 h-3 w-3" /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Join Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {group.joinRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No join requests</p>
              ) : (
                <div className="space-y-3">
                  {group.joinRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={req.user.image || ""} />
                          <AvatarFallback>{getInitials(req.user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium">{req.user.name}</span>
                          <p className="text-xs text-muted-foreground">{req.user.email}</p>
                        </div>
                      </div>
                      {req.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" className="h-8" onClick={() => handleApproveRequest(req.id)} disabled={processingRequest === req.id}>
                            <Check className="mr-1 h-3 w-3" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-8" onClick={() => handleRejectRequest(req.id)} disabled={processingRequest === req.id}>
                            <X className="mr-1 h-3 w-3" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <Badge variant={req.status === "APPROVED" ? "default" : "secondary"}>{req.status}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="project" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Proposal</CardTitle>
            </CardHeader>
            <CardContent>
              {!project ? (
                <p className="text-sm text-muted-foreground text-center py-8">No project proposal yet</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">{project.title}</h3>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status === "PROPOSED" ? "Proposal Pending" : project.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  )}
                  {project.techStack && project.techStack !== "[]" && project.techStack !== "null" && (
                    <div>
                      <p className="text-sm font-medium mb-1">Tech Stack</p>
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(project.techStack).map((tech: string) => (
                          <Badge key={tech} variant="secondary" className="text-[10px]">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {(project.repoUrl || project.liveUrl) && (
                    <div className="flex gap-2">
                      {project.repoUrl && (
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted h-7 gap-1 px-2.5 text-[0.8rem] whitespace-nowrap">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> Repository
                        </a>
                      )}
                      {project.liveUrl && (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted h-7 gap-1 px-2.5 text-[0.8rem] whitespace-nowrap">
                          <ExternalLink className="h-3.5 w-3.5 mr-1" /> Live Demo
                        </a>
                      )}
                    </div>
                  )}
                  {project.status === "PROPOSED" && (
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleApproveProject}>
                        <Check className="mr-1 h-4 w-4" /> Approve
                      </Button>
                      <Button variant="outline" onClick={handleRejectProject}>
                        <X className="mr-1 h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Group Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 max-w-sm">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSize">Max Members</Label>
                  <Input id="maxSize" type="number" value={editMaxSize} onChange={(e) => setEditMaxSize(parseInt(e.target.value) || 5)} min={1} max={20} />
                </div>
                <Button onClick={handleSaveSettings} disabled={saving} className="w-fit">
                  {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  <Save className="mr-1 h-4 w-4" /> Save Changes
                </Button>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Invite Code</p>
                  <div className="flex items-center gap-2">
                    <code className="rounded bg-muted px-2 py-1 text-sm font-mono">{group.inviteCode}</code>
                    <Button variant="outline" size="sm" onClick={handleRegenerateInvite}>
                      <RefreshCw className="mr-1 h-3 w-3" /> Regenerate
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <Button variant="destructive" onClick={handleDeleteGroup}>
                  <Trash2 className="mr-1 h-4 w-4" /> Delete Group
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
