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
import { Plus, Search, Users, LogOut, KeyRound, Loader2, ExternalLink } from "lucide-react"
import { getInitials, getStatusColor } from "@/lib/utils"
import { toast } from "sonner"

interface GroupMember {
  user: { id: string; name: string; image: string | null }
}

interface GroupItem {
  id: string
  name: string
  maxSize: number
  inviteCode: string
  isActive: boolean
  class: { name: string; code: string }
  members: GroupMember[]
  project: { id: string; title: string; status: string } | null
}

export default function StudentGroupsPage() {
  const router = useRouter()
  const [myGroups, setMyGroups] = useState<GroupItem[]>([])
  const [availableGroups, setAvailableGroups] = useState<GroupItem[]>([])
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<{ id: string; name: string; code: string }[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [selectedClass, setSelectedClass] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadData()
    loadClasses()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [myRes, availRes] = await Promise.all([
        fetch("/api/groups?limit=50"),
        fetch("/api/groups/available"),
      ])
      if (myRes.ok) {
        const myData = await myRes.json()
        setMyGroups(Array.isArray(myData) ? myData : myData.items || [])
      }
      if (availRes.ok) setAvailableGroups(await availRes.json())
    } catch {
      toast.error("Failed to load groups")
    } finally {
      setLoading(false)
    }
  }

  async function loadClasses() {
    try {
      const res = await fetch("/api/classes?limit=50")
      if (res.ok) {
        const data = await res.json()
        setClasses(Array.isArray(data) ? data : data.items || [])
      }
    } catch { /* ignore */ }
  }

  async function handleCreateGroup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          classId: form.get("classId"),
          maxSize: parseInt(form.get("maxSize") as string) || 5,
        }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to create"); return }
      toast.success("Group created!")
      setCreateOpen(false)
      loadData()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setCreating(false)
    }
  }

  async function handleJoinByCode() {
    if (!inviteCode.trim()) return
    setJoining(true)
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: inviteCode.trim() }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to join"); return }
      toast.success("Joined group!")
      setJoinOpen(false)
      setInviteCode("")
      loadData()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setJoining(false)
    }
  }

  async function handleLeaveGroup(groupId: string, groupName: string) {
    if (!confirm(`Leave "${groupName}"?`)) return
    try {
      const res = await fetch(`/api/groups/${groupId}/leave`, { method: "POST" })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to leave"); return }
      toast.success("Left group")
      loadData()
    } catch {
      toast.error("Something went wrong")
    }
  }

  async function handleRequestJoin(groupId: string) {
    try {
      const res = await fetch(`/api/groups/${groupId}/request-join`, { method: "POST" })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to request"); return }
      toast.success("Join request sent!")
    } catch {
      toast.error("Something went wrong")
    }
  }

  const filteredAvailable = availableGroups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.class.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">Manage your group memberships</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger>
              <Button variant="outline" size="sm">
                <KeyRound className="mr-1 h-4 w-4" /> Join Code
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join Group by Code</DialogTitle>
                <DialogDescription>Enter the invite code shared by your group leader</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input id="inviteCode" placeholder="Paste invite code..." value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setJoinOpen(false)}>Cancel</Button>
                <Button onClick={handleJoinByCode} disabled={joining || !inviteCode.trim()}>
                  {joining ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                  {joining ? "Joining..." : "Join"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={createOpen} onOpenChange={(v) => { if (!creating) setCreateOpen(v) }}>
            <DialogTrigger>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Create Group</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Group</DialogTitle>
                <DialogDescription>Start a new project group</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateGroup}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Group Name</Label>
                    <Input id="name" name="name" placeholder="Team Alpha" required disabled={creating} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classId">Class</Label>
                    <Select name="classId" required disabled={creating} value={selectedClass} onValueChange={(v: string | null) => v && setSelectedClass(v)}>
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
                    <Label htmlFor="maxSize">Max Members</Label>
                    <Input id="maxSize" name="maxSize" type="number" defaultValue={5} min={1} max={10} disabled={creating} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={creating}>
                    {creating && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                    {creating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="my-groups">
        <TabsList>
          <TabsTrigger value="my-groups">My Groups ({myGroups.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableGroups.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="mt-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : myGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No groups yet</h3>
              <p className="text-sm text-muted-foreground">Create a group or join one with an invite code</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {myGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <CardDescription>{group.class.code}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono">{group.inviteCode}</Badge>
                        {group.project && (
                          <Badge className={getStatusColor(group.project.status)}>
                            {group.project.status.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {group.project && (
                      <p className="text-sm font-medium mb-3">Project: {group.project.title}</p>
                    )}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <Users className="h-3 w-3" /> {group.members.length}/{group.maxSize} members
                    </div>
                    <ScrollArea className="h-[100px] mb-3">
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
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleLeaveGroup(group.id, group.name)}>
                      <LogOut className="mr-1 h-3 w-3" /> Leave Group
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-4">
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search groups..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {filteredAvailable.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No available groups</h3>
              <p className="text-sm text-muted-foreground">All groups in your classes are shown here</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAvailable.map((group) => (
                <Card key={group.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{group.name}</CardTitle>
                        <CardDescription>{group.class.code}</CardDescription>
                      </div>
                      <Badge variant="secondary">{group.members.length}/{group.maxSize}</Badge>
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
                    <div className="flex gap-2">
                      <Button size="sm" variant="default" className="flex-1" onClick={() => handleRequestJoin(group.id)}>
                        Request Join
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Code: <span className="font-mono">{group.inviteCode}</span></p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
