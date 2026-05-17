"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Search, Users, Loader2, X, Check, UserPlus } from "lucide-react"
import { getInitials, getStatusColor } from "@/lib/utils"
import { toast } from "sonner"

interface GroupMember {
  user: { id: string; name: string; image: string | null; email: string }
}

interface GroupWithDetails {
  id: string
  name: string
  maxSize: number
  inviteCode: string
  isActive: boolean
  class: { name: string; code: string }
  members: GroupMember[]
  project: { id: string; title: string; status: string } | null
}

interface JoinRequest {
  id: string
  groupId: string
  userId: string
  status: string
  createdAt: string
  user: { id: string; name: string; image: string | null; email: string }
}

export function GroupsPageContent({
  groups: initialGroups,
  classes,
  teacherId,
}: {
  groups: GroupWithDetails[]
  classes: { id: string; name: string; code: string }[]
  teacherId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [groups, setGroups] = useState(initialGroups)
  const [joinRequests, setJoinRequests] = useState<Record<string, JoinRequest[]>>({})
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)

  useEffect(() => {
    setGroups(initialGroups)
  }, [initialGroups])

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.class.name.toLowerCase().includes(search.toLowerCase())
  )

  async function loadJoinRequests(groupId: string) {
    try {
      const res = await fetch(`/api/groups/${groupId}/requests`)
      if (res.ok) {
        const data = await res.json()
        setJoinRequests((prev) => ({ ...prev, [groupId]: data }))
      }
    } catch { /* ignore */ }
  }

  async function handleCreateGroup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          classId: form.get("classId"),
          maxSize: parseInt(form.get("maxSize") as string),
        }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to create group"); return }
      toast.success("Group created")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(requestId: string) {
    setProcessingRequest(requestId)
    try {
      const res = await fetch(`/api/groups/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to approve"); return }
      toast.success("Request approved")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setProcessingRequest(null)
    }
  }

  async function handleReject(requestId: string) {
    setProcessingRequest(requestId)
    try {
      const res = await fetch(`/api/groups/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to reject"); return }
      toast.success("Request rejected")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setProcessingRequest(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">Manage project groups</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!loading) setOpen(v) }}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 text-sm font-medium hover:bg-primary/90 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> New Group
          </DialogTrigger>
          <DialogContent className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-muted border-t-primary" />
                  <p className="text-xs text-muted-foreground">Creating...</p>
                </div>
              </div>
            )}
            <DialogHeader>
              <DialogTitle>Create Group</DialogTitle>
              <DialogDescription>Create a new project group</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGroup}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input id="name" name="name" placeholder="Group Alpha" required disabled={loading} />
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
                  <Label htmlFor="maxSize">Max Group Size</Label>
                  <Input id="maxSize" name="maxSize" type="number" defaultValue={5} min={1} max={10} disabled={loading} />
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
        <Input placeholder="Search groups..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((group) => (
          <Card key={group.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{group.name}</CardTitle>
                  <CardDescription>{group.class.code}</CardDescription>
                </div>
                <Badge variant={group.isActive ? "default" : "secondary"}>
                  {group.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {group.project && (
                <div className="mb-3">
                  <p className="text-sm font-medium">{group.project.title}</p>
                  <Badge className={getStatusColor(group.project.status)}>
                    {group.project.status.replace("_", " ")}
                  </Badge>
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                <Users className="h-3 w-3" /> {group.members.length}/{group.maxSize} members
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Code: <span className="font-mono text-primary">{group.inviteCode}</span>
              </p>
              <ScrollArea className="h-[100px]">
                <div className="space-y-2">
                  {group.members.map((m) => (
                    <div key={m.user.id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={m.user.image || ""} />
                        <AvatarFallback className="text-[10px]">{getInitials(m.user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{m.user.name}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="mt-3">
                <Tabs defaultValue="members" onValueChange={(v) => { if (v === "requests") loadJoinRequests(group.id) }}>
                  <TabsList className="w-full">
                    <TabsTrigger value="members" className="flex-1 text-xs">Members</TabsTrigger>
                    <TabsTrigger value="requests" className="flex-1 text-xs">
                      Requests
                      {joinRequests[group.id]?.filter((r) => r.status === "PENDING").length ? (
                        <Badge variant="destructive" className="ml-1 text-[10px] px-1 py-0">
                          {joinRequests[group.id].filter((r) => r.status === "PENDING").length}
                        </Badge>
                      ) : null}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="requests" className="mt-2">
                    {!joinRequests[group.id] ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : joinRequests[group.id].length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No requests</p>
                    ) : (
                      <div className="space-y-2">
                        {joinRequests[group.id].map((req) => (
                          <div key={req.id} className="flex items-center justify-between gap-2 bg-muted/30 rounded p-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={req.user.image || ""} />
                                <AvatarFallback className="text-[8px]">{getInitials(req.user.name)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs truncate">{req.user.name}</span>
                            </div>
                            {req.status === "PENDING" ? (
                              <div className="flex gap-1 flex-shrink-0">
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-green-500" onClick={() => handleApprove(req.id)} disabled={processingRequest === req.id}>
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => handleReject(req.id)} disabled={processingRequest === req.id}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Badge variant={req.status === "APPROVED" ? "default" : "secondary"} className="text-[10px]">
                                {req.status}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
