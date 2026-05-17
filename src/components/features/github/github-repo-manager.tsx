"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { GitBranch, GitCommit, Loader2, Plus, RefreshCw, Trash2, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react"
import { formatDateRelative } from "@/lib/utils"
import { toast } from "sonner"
import { CommitActivityFeed } from "./commit-activity-feed"
import { ContributorStats } from "./contributor-stats"
import type { GitHubRepository } from "@prisma/client"

interface GitHubRepoManagerProps {
  projectId: string
  repositories: GitHubRepository[]
}

export function GitHubRepoManager({ projectId, repositories: initialRepos }: GitHubRepoManagerProps) {
  const router = useRouter()
  const [repos, setRepos] = useState(initialRepos)
  const [linkOpen, setLinkOpen] = useState(false)
  const [fullName, setFullName] = useState("")
  const [linking, setLinking] = useState(false)
  const [syncing, setSyncing] = useState<string | null>(null)

  async function handleLink(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    setLinking(true)
    try {
      const res = await fetch("/api/github/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, fullName: fullName.trim() }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to link repo"); return }
      toast.success("Repository linked")
      setLinkOpen(false)
      setFullName("")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLinking(false)
    }
  }

  async function handleUnlink(repoId: string) {
    try {
      const res = await fetch(`/api/github/repos/${repoId}`, { method: "DELETE" })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Failed to unlink"); return }
      toast.success("Repository unlinked")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    }
  }

  async function handleSync(repoId: string) {
    setSyncing(repoId)
    try {
      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Sync failed"); return }
      toast.success("Repository synced")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSyncing(null)
    }
  }

  async function handleSyncAll() {
    setSyncing("all")
    try {
      const res = await fetch("/api/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || "Sync failed"); return }
      toast.success("All repositories synced")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSyncing(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">GitHub Repositories</CardTitle>
            <CardDescription>Link and sync your GitHub repositories</CardDescription>
          </div>
          <div className="flex gap-2">
            {repos.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleSyncAll} disabled={syncing === "all"}>
                <RefreshCw className={`mr-1 h-3 w-3 ${syncing === "all" ? "animate-spin" : ""}`} />
                {syncing === "all" ? "Syncing..." : "Sync All"}
              </Button>
            )}
            <Dialog open={linkOpen} onOpenChange={(v) => { if (!linking) setLinkOpen(v) }}>
              <Button size="sm" onClick={() => setLinkOpen(true)}>
                <Plus className="mr-1 h-3 w-3" /> Link Repo
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Link GitHub Repository</DialogTitle>
                  <DialogDescription>Enter the repository name in the format owner/repo</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleLink}>
                  <div className="py-4 space-y-2">
                    <Label htmlFor="fullName">Repository</Label>
                    <Input
                      id="fullName"
                      placeholder="e.g. facebook/react"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={linking}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={linking || !fullName.trim()}>
                      {linking && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                      {linking ? "Linking..." : "Link"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {repos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No repositories linked. Click "Link Repo" to connect a GitHub repository.
          </p>
        ) : (
          <>
            <ContributorStats repos={repos} />
            <Separator />
            <div className="space-y-3">
              {repos.map((repo) => (
                <div key={repo.id} className="flex items-start justify-between gap-2 border-b pb-3 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <a href={repo.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline truncate">
                        {repo.fullName}
                      </a>
                      {repo.syncedAt ? (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 gap-0.5">
                          <CheckCircle2 className="h-2.5 w-2.5 text-primary" />
                          Synced {formatDateRelative(repo.syncedAt)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 gap-0.5">
                          <AlertCircle className="h-2.5 w-2.5 text-amber-500" />
                          Not synced
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <GitCommit className="h-3 w-3" />
                        {repo.commitCount24h} commits/24h
                      </span>
                      <span>·</span>
                      <span>{repo.commitCount7d} commits/7d</span>
                      {repo.lastCommitMsg && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[200px]">{repo.lastCommitMsg}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSync(repo.id)} disabled={syncing === repo.id}>
                      {syncing === repo.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleUnlink(repo.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
