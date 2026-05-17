"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

interface MilestoneCreateFormProps {
  projectId: string
}

export function MilestoneCreateForm({ projectId }: MilestoneCreateFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const form = new FormData(e.currentTarget)
    form.set("projectId", projectId)

    try {
      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: form.get("title"),
          description: form.get("description") || undefined,
          order: parseInt(form.get("order") as string) || 1,
          weight: parseInt(form.get("weight") as string) || 1,
          dueDate: form.get("dueDate") ? new Date(form.get("dueDate") as string).toISOString() : undefined,
        }),
      })
      if (!res.ok) { toast.error("Failed to create milestone"); return }
      toast.success("Milestone created")
      setOpen(false)
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Milestone</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create Milestone</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required minLength={3} maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input id="order" name="order" type="number" min={1} defaultValue={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (1-10)</Label>
              <Input id="weight" name="weight" type="number" min={1} max={10} defaultValue={1} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" name="dueDate" type="date" />
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Milestone
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
