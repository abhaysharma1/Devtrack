"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Users, FolderKanban, BookOpen, MoreHorizontal, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface ClassWithCounts {
  id: string
  name: string
  code: string
  description: string | null
  section: string | null
  semester: string
  year: number
  isActive: boolean
  _count: { members: number; projects: number; groups: number }
  teacher: { name: string; image: string | null }
}

export function ClassesPageContent({
  classes,
  teacherId,
}: {
  classes: ClassWithCounts[]
  teacherId: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  async function handleCreateClass(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const data = {
      name: form.get("name") as string,
      code: form.get("code") as string,
      description: form.get("description") as string,
      section: form.get("section") as string,
      semester: form.get("semester") as string,
      year: parseInt(form.get("year") as string),
    }

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || "Failed to create class")
        return
      }

      toast.success("Class created successfully")
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
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">Manage your classes and student enrollments</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { if (!loading) setOpen(v) }}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 text-sm font-medium hover:bg-primary/90 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            New Class
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
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>Set up a new class for project management</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClass}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Class Name</Label>
                    <Input id="name" name="name" placeholder="Software Engineering" required disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Class Code</Label>
                    <Input id="code" name="code" placeholder="CS-401" required disabled={loading} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input id="description" name="description" placeholder="Capstone project course" disabled={loading} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input id="section" name="section" placeholder="A" disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select name="semester" defaultValue="Spring" disabled={loading}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Spring">Spring</SelectItem>
                        <SelectItem value="Summer">Summer</SelectItem>
                        <SelectItem value="Fall">Fall</SelectItem>
                        <SelectItem value="Winter">Winter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input id="year" name="year" type="number" defaultValue={2026} required disabled={loading} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? "Creating..." : "Create Class"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search classes..." className="pl-10 max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No classes yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first class to get started</p>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Class
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {classes.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).map((cls) => (
            <Card key={cls.id} className="transition-colors hover:bg-accent/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{cls.name}</CardTitle>
                    <CardDescription>{cls.code}</CardDescription>
                  </div>
                  <Badge variant={cls.isActive ? "default" : "secondary"}>
                    {cls.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {cls.description && <p className="text-sm text-muted-foreground mb-4">{cls.description}</p>}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {cls._count.members} students
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderKanban className="h-3 w-3" /> {cls._count.projects} projects
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {cls._count.groups} groups
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/teacher/groups?classId=${cls.id}`} className="flex-1 inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted h-7 px-2.5 text-[0.8rem] font-medium">Groups</Link>
                  <Link href={`/teacher/projects?classId=${cls.id}`} className="flex-1 inline-flex items-center justify-center rounded-md border border-border bg-background hover:bg-muted h-7 px-2.5 text-[0.8rem] font-medium">Projects</Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
