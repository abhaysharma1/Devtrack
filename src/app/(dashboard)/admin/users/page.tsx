"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getInitials, formatDateRelative } from "@/lib/utils"
import { Search, Plus, Shield, MoreHorizontal, Loader2, Trash2, Ban, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: string
  image: string | null
  isActive: boolean
  isSuspended: boolean
  studentId: string | null
  department: string | null
  createdAt: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string | null>("")
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchUsers(true)
  }, [search, roleFilter])

  const roleFilterValue = roleFilter || ""

  async function fetchUsers(reset = false) {
    if (reset) setLoading(true)
    else setLoadingMore(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (roleFilterValue) params.set("role", roleFilterValue)
      if (!reset && nextCursor) params.set("cursor", nextCursor)
      params.set("limit", "50")
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (reset) {
          setUsers(data.items)
          setNextCursor(data.nextCursor)
          setTotal(data.total)
        } else {
          setUsers((prev) => [...prev, ...data.items])
          setNextCursor(data.nextCursor)
        }
      } else toast.error("Failed to load users")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          role: form.get("role"),
          studentId: form.get("studentId") || undefined,
          department: form.get("department") || undefined,
        }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed to create"); return }
      toast.success("User created")
      setAddOpen(false)
      fetchUsers(true)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingUser) return
    setSaving(true)
    const form = new FormData(e.currentTarget)
    const body: Record<string, unknown> = {
      name: form.get("name"),
      email: form.get("email"),
      role: form.get("role"),
      isSuspended: form.get("isSuspended") === "true",
    }
    const password = form.get("password") as string
    if (password) body.password = password

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed to update"); return }
      toast.success("User updated")
      setEditOpen(false)
      setEditingUser(null)
      fetchUsers(true)
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`Delete ${user.name}? This cannot be undone.`)) return
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Failed to delete"); return }
      toast.success("User deleted")
      fetchUsers(true)
    } catch {
      toast.error("Something went wrong")
    }
  }

  async function toggleSuspend(user: User) {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: !user.isSuspended }),
      })
      if (!res.ok) return
      toast.success(user.isSuspended ? "User unsuspended" : "User suspended")
      fetchUsers(true)
    } catch {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage all platform users</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger>
            <div className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer">
              <Plus className="mr-1 h-4 w-4" /> Add User
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
              <DialogDescription>Create a new user account</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="add-name">Full Name</Label>
                  <Input id="add-name" name="name" required minLength={2} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-email">Email</Label>
                  <Input id="add-email" name="email" type="email" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-password">Password</Label>
                  <Input id="add-password" name="password" type="password" required minLength={8} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-role">Role</Label>
                  <Select name="role" defaultValue="STUDENT">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-studentId">Student ID (optional)</Label>
                  <Input id="add-studentId" name="studentId" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="add-department">Department (optional)</Label>
                  <Input id="add-department" name="department" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                  {saving ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilterValue} onValueChange={(v) => setRoleFilter(v === "all" ? null : v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
            <SelectItem value="TEACHER">Teacher</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="divide-y">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        {user.isSuspended && <Badge variant="destructive" className="text-[10px] px-1 py-0">Suspended</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:inline">{formatDateRelative(user.createdAt)}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingUser(user); setEditOpen(true) }}>
                          <Shield className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleSuspend(user)}>
                          {user.isSuspended ? (
                            <><CheckCircle className="mr-2 h-4 w-4" /> Unsuspend</>
                          ) : (
                            <><Ban className="mr-2 h-4 w-4" /> Suspend</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(user)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">No users found</div>
              )}
            </div>
          )}
          {nextCursor && !loading && (
            <div className="flex justify-center border-t p-4">
              <Button variant="outline" size="sm" onClick={() => fetchUsers(false)} disabled={loadingMore}>
                {loadingMore ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                {loadingMore ? "Loading..." : `Load more (${users.length}/${total})`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditingUser(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input id="edit-name" name="name" defaultValue={editingUser?.name} required minLength={2} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" name="email" type="email" defaultValue={editingUser?.email} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-password">New Password (leave blank to keep)</Label>
                <Input id="edit-password" name="password" type="password" minLength={8} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select name="role" defaultValue={editingUser?.role}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-suspended">Status</Label>
                <Select name="isSuspended" defaultValue={editingUser?.isSuspended ? "true" : "false"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Active</SelectItem>
                    <SelectItem value="true">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setEditOpen(false); setEditingUser(null) }}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
