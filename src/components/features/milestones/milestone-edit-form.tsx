"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"

interface MilestoneEditFormProps {
  milestone: {
    id: string
    title: string
    description: string | null
    dueDate: Date | null
  }
}

export function MilestoneEditForm({ milestone }: MilestoneEditFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)

    try {
      const body: Record<string, unknown> = {
        title: form.get("title"),
        description: form.get("description") || undefined,
      }
      const dueDate = form.get("dueDate") as string
      if (dueDate) body.dueDate = new Date(dueDate).toISOString()

      const res = await fetch(`/api/milestones/${milestone.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) { toast.error("Failed to update milestone"); return }
      toast.success("Milestone updated")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const dueDateStr = milestone.dueDate
    ? new Date(milestone.dueDate).toISOString().split("T")[0]
    : ""

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" type="button">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Milestone</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input id="edit-title" name="title" required minLength={3} maxLength={200}
              defaultValue={milestone.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" name="description"
              defaultValue={milestone.description || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-dueDate">Due Date</Label>
            <Input id="edit-dueDate" name="dueDate" type="date" defaultValue={dueDateStr} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Milestone
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
